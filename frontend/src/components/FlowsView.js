import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, StopIcon, SpeakerWaveIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { QueueListIcon } from '@heroicons/react/24/outline';

const colorMap = {
  blue:   {
    tab:     'bg-blue-500/30 border-blue-400/50 text-blue-200',
    item:    'bg-blue-500/10 border-blue-400/20 text-white/70 hover:text-white/90 hover:bg-blue-500/20',
    playing: 'bg-blue-500/40 border-blue-400/80 text-white',
    num:     'bg-blue-500/40 text-blue-200',
    bar:     'bg-blue-500/20 border-blue-400/30',
    dot:     'bg-blue-400',
  },
  orange: {
    tab:     'bg-orange-500/30 border-orange-400/50 text-orange-200',
    item:    'bg-orange-500/10 border-orange-400/20 text-white/70 hover:text-white/90 hover:bg-orange-500/20',
    playing: 'bg-orange-500/40 border-orange-400/80 text-white',
    num:     'bg-orange-500/40 text-orange-200',
    bar:     'bg-orange-500/20 border-orange-400/30',
    dot:     'bg-orange-400',
  },
  green: {
    tab:     'bg-green-500/30 border-green-400/50 text-green-200',
    item:    'bg-green-500/10 border-green-400/20 text-white/70 hover:text-white/90 hover:bg-green-500/20',
    playing: 'bg-green-500/40 border-green-400/80 text-white',
    num:     'bg-green-500/40 text-green-200',
    bar:     'bg-green-500/20 border-green-400/30',
    dot:     'bg-green-400',
  },
  red: {
    tab:     'bg-red-500/30 border-red-400/50 text-red-200',
    item:    'bg-red-500/10 border-red-400/20 text-white/70 hover:text-white/90 hover:bg-red-500/20',
    playing: 'bg-red-500/40 border-red-400/80 text-white',
    num:     'bg-red-500/40 text-red-200',
    bar:     'bg-red-500/20 border-red-400/30',
    dot:     'bg-red-400',
  },
  purple: {
    tab:     'bg-purple-500/30 border-purple-400/50 text-purple-200',
    item:    'bg-purple-500/10 border-purple-400/20 text-white/70 hover:text-white/90 hover:bg-purple-500/20',
    playing: 'bg-purple-500/40 border-purple-400/80 text-white',
    num:     'bg-purple-500/40 text-purple-200',
    bar:     'bg-purple-500/20 border-purple-400/30',
    dot:     'bg-purple-400',
  },
};

const FlowsView = ({ data }) => {
  const [phaseIndex, setPhaseIndex]     = useState(0);
  const [playingIndex, setPlayingIndex] = useState(-1); // -1 = phase name being read, >=0 = item index
  const [isPlaying, setIsPlaying]       = useState(false);
  const [isAllFlows, setIsAllFlows]     = useState(false);

  // Queue-based model: each entry is { text, phaseIdx, itemIdx }
  // itemIdx = -1 means it's a phase name announcement (no item highlight)
  const playStateRef = useRef({ active: false, queue: [], pos: 0 });
  const itemRefs     = useRef([]);

  const phase = data?.[phaseIndex];
  const c     = colorMap[phase?.color] || colorMap.blue;

  // Scroll active item into view
  useEffect(() => {
    if (playingIndex >= 0 && itemRefs.current[playingIndex]) {
      itemRefs.current[playingIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [playingIndex]);

  const stopAudio = useCallback(() => {
    playStateRef.current.active = false;
    window.speechSynthesis.cancel();
    setPlayingIndex(-1);
    setIsPlaying(false);
    setIsAllFlows(false);
  }, []);

  const speakNext = useCallback(() => {
    const state = playStateRef.current;
    if (!state.active || state.pos >= state.queue.length) {
      setPlayingIndex(-1);
      setIsPlaying(false);
      setIsAllFlows(false);
      playStateRef.current.active = false;
      return;
    }
    const entry = state.queue[state.pos];
    // Drive tab to the current phase (handles auto-advance in Play All Flows)
    setPhaseIndex(entry.phaseIdx);
    // -1 = no item highlight (phase name announcement)
    setPlayingIndex(entry.itemIdx);
    playStateRef.current.pos = state.pos + 1;
    const utter = new SpeechSynthesisUtterance(entry.text);
    utter.rate  = 0.9;
    utter.pitch = 1;
    utter.onend = speakNext;
    utter.onerror = () => {
      playStateRef.current.active = false;
      setIsPlaying(false);
      setIsAllFlows(false);
      setPlayingIndex(-1);
    };
    window.speechSynthesis.speak(utter);
  }, []);

  // Build queue entries for one phase, optionally prefixed with a phase name utterance
  const buildPhaseQueue = useCallback((p, phaseIdx, announceName) => {
    const q = [];
    if (announceName) q.push({ text: `${p.phase} flow`, phaseIdx, itemIdx: -1 });
    p.items.forEach((item, i) => q.push({ text: item, phaseIdx, itemIdx: i }));
    return q;
  }, []);

  // Tap an item: start from that item, no phase name announced
  const startFrom = useCallback((phaseIdx, startItemIdx) => {
    const p = data[phaseIdx];
    const queue = p.items.slice(startItemIdx).map((item, i) => ({
      text: item, phaseIdx, itemIdx: startItemIdx + i,
    }));
    window.speechSynthesis.cancel();
    playStateRef.current = { active: true, queue, pos: 0 };
    setIsPlaying(true);
    setIsAllFlows(false);
    setTimeout(() => speakNext(), 80);
  }, [data, speakNext]);

  // "Play Flow" button: announce phase name then all items
  const startPhase = useCallback((phaseIdx) => {
    const queue = buildPhaseQueue(data[phaseIdx], phaseIdx, true);
    window.speechSynthesis.cancel();
    playStateRef.current = { active: true, queue, pos: 0 };
    setIsPlaying(true);
    setIsAllFlows(false);
    setTimeout(() => speakNext(), 80);
  }, [data, buildPhaseQueue, speakNext]);

  // "Play All Flows": all 11 phases in sequence, each prefixed with its name
  const startAllFlows = useCallback(() => {
    const queue = data.flatMap((p, pi) => buildPhaseQueue(p, pi, true));
    window.speechSynthesis.cancel();
    playStateRef.current = { active: true, queue, pos: 0 };
    setPhaseIndex(0);
    setIsPlaying(true);
    setIsAllFlows(true);
    setTimeout(() => speakNext(), 80);
  }, [data, buildPhaseQueue, speakNext]);

  // Manual tab/phase change — stop any running audio
  const selectPhase = (i) => {
    if (isPlaying) stopAudio();
    setPhaseIndex(i);
    itemRefs.current = [];
  };

  const goPhase = (dir) =>
    selectPhase(Math.max(0, Math.min(data.length - 1, phaseIndex + dir)));

  const statusText = () => {
    if (!isPlaying) return 'Tap any item to start from there';
    if (playingIndex === -1) return `${phase?.phase} flow…`;
    if (isAllFlows) return `Phase ${phaseIndex + 1}/${data.length} — item ${playingIndex + 1}/${phase?.items.length}`;
    return `${playingIndex + 1} / ${phase?.items.length} — ${phase?.phase}`;
  };

  if (!data || data.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

      {/* ── Phase tab bar ── */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {data.map((p, i) => {
          const pc = colorMap[p.color] || colorMap.blue;
          return (
            <button
              key={p.id}
              onClick={() => selectPhase(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                i === phaseIndex
                  ? pc.tab
                  : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
              }`}
            >
              {p.phase}
            </button>
          );
        })}
      </div>

      {/* ── Phase content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {/* Audio controls bar */}
          <div className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border mb-4 ${c.bar}`}>
            {isPlaying ? (
              <button
                onClick={stopAudio}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 border border-red-400/40 text-red-200 text-sm font-semibold transition-colors"
              >
                <StopIcon className="w-4 h-4" />
                Stop
              </button>
            ) : (
              <>
                <button
                  onClick={() => startPhase(phaseIndex)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition-colors"
                >
                  <PlayIcon className="w-4 h-4" />
                  Play Flow
                </button>
                <button
                  onClick={startAllFlows}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white text-sm font-semibold transition-colors"
                >
                  <QueueListIcon className="w-4 h-4" />
                  Play All Flows
                </button>
              </>
            )}

            <div className="flex items-center gap-2 text-sm">
              <SpeakerWaveIcon className={`w-4 h-4 flex-shrink-0 ${isPlaying ? 'text-white/80 animate-pulse' : 'text-white/25'}`} />
              <span className={isPlaying ? 'text-white/70' : 'text-white/30'}>{statusText()}</span>
            </div>

            {/* Phase arrows */}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => goPhase(-1)}
                disabled={phaseIndex === 0}
                className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-white/30 text-xs px-1">{phaseIndex + 1}/{data.length}</span>
              <button
                onClick={() => goPhase(1)}
                disabled={phaseIndex === data.length - 1}
                className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-1.5">
            {phase.items.map((item, idx) => {
              const active = idx === playingIndex;
              return (
                <motion.button
                  key={idx}
                  ref={el => { itemRefs.current[idx] = el; }}
                  layout
                  onClick={() => startFrom(phaseIndex, idx)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200 ${
                    active ? c.playing : c.item
                  }`}
                >
                  <span className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold mt-0.5 transition-colors ${
                    active ? 'bg-white/25 text-white' : c.num
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium leading-relaxed pt-0.5 flex-1">{item}</span>
                  {active && (
                    <SpeakerWaveIcon className="w-4 h-4 flex-shrink-0 text-white/60 animate-pulse mt-1" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Phase footer navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => goPhase(-1)}
              disabled={phaseIndex === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white/80 hover:border-white/25 disabled:opacity-20 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              {phaseIndex > 0 ? data[phaseIndex - 1].phase : 'Previous'}
            </button>
            <button
              onClick={() => goPhase(1)}
              disabled={phaseIndex === data.length - 1}
              className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white/80 hover:border-white/25 disabled:opacity-20 disabled:cursor-not-allowed text-sm font-semibold transition-colors"
            >
              {phaseIndex < data.length - 1 ? data[phaseIndex + 1].phase : 'Next'}
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default FlowsView;
