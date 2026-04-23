import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const COLORS = {
  blue:    { grad: 'from-blue-900/60 to-blue-700/20',     border: 'border-blue-500/30',    text: 'text-blue-300',    statBg: 'bg-blue-950/60',  statBorder: 'border-blue-700/40',    secBg: 'bg-blue-900/20',   secBorder: 'border-blue-500/20',   dot: 'bg-blue-400',    tabActive: 'bg-blue-800/40 border-blue-500/50',    sky: 'from-blue-600 via-blue-400 to-blue-300' },
  indigo:  { grad: 'from-indigo-900/60 to-indigo-700/20', border: 'border-indigo-500/30',  text: 'text-indigo-300',  statBg: 'bg-indigo-950/60', statBorder: 'border-indigo-700/40',  secBg: 'bg-indigo-900/20', secBorder: 'border-indigo-500/20', dot: 'bg-indigo-400',  tabActive: 'bg-indigo-800/40 border-indigo-500/50',  sky: 'from-indigo-600 via-indigo-400 to-indigo-300' },
  amber:   { grad: 'from-amber-900/60 to-amber-700/20',   border: 'border-amber-500/30',   text: 'text-amber-300',   statBg: 'bg-amber-950/60',  statBorder: 'border-amber-700/40',   secBg: 'bg-amber-900/20',  secBorder: 'border-amber-500/20',  dot: 'bg-amber-400',   tabActive: 'bg-amber-800/40 border-amber-500/50',    sky: 'from-amber-600 via-amber-400 to-amber-200' },
  sky:     { grad: 'from-sky-900/60 to-sky-700/20',       border: 'border-sky-500/30',     text: 'text-sky-300',     statBg: 'bg-sky-950/60',    statBorder: 'border-sky-700/40',     secBg: 'bg-sky-900/20',    secBorder: 'border-sky-500/20',    dot: 'bg-sky-400',     tabActive: 'bg-sky-800/40 border-sky-500/50',        sky: 'from-sky-500 via-sky-300 to-white/40' },
  slate:   { grad: 'from-slate-800/70 to-slate-600/30',   border: 'border-slate-500/40',   text: 'text-slate-300',   statBg: 'bg-slate-900/70',  statBorder: 'border-slate-600/40',   secBg: 'bg-slate-800/20',  secBorder: 'border-slate-500/20',  dot: 'bg-slate-400',   tabActive: 'bg-slate-700/50 border-slate-400/50',    sky: 'from-slate-600 via-slate-400 to-slate-300' },
  green:   { grad: 'from-green-900/60 to-green-700/20',   border: 'border-green-500/30',   text: 'text-green-300',   statBg: 'bg-green-950/60',  statBorder: 'border-green-700/40',   secBg: 'bg-green-900/20',  secBorder: 'border-green-500/20',  dot: 'bg-green-400',   tabActive: 'bg-green-800/40 border-green-500/50',    sky: 'from-green-600 via-green-400 to-green-200' },
  red:     { grad: 'from-red-900/70 to-red-700/30',       border: 'border-red-500/40',     text: 'text-red-300',     statBg: 'bg-red-950/70',    statBorder: 'border-red-700/50',     secBg: 'bg-red-900/25',    secBorder: 'border-red-500/25',    dot: 'bg-red-400',     tabActive: 'bg-red-800/50 border-red-500/60',        sky: 'from-red-700 via-orange-500 to-yellow-400' },
  cyan:    { grad: 'from-cyan-900/60 to-cyan-700/20',     border: 'border-cyan-500/30',    text: 'text-cyan-300',    statBg: 'bg-cyan-950/60',   statBorder: 'border-cyan-700/40',    secBg: 'bg-cyan-900/20',   secBorder: 'border-cyan-500/20',   dot: 'bg-cyan-400',    tabActive: 'bg-cyan-800/40 border-cyan-500/50',      sky: 'from-cyan-400 via-sky-300 to-white/30' },
  orange:  { grad: 'from-orange-900/60 to-orange-700/20', border: 'border-orange-500/30',  text: 'text-orange-300',  statBg: 'bg-orange-950/60', statBorder: 'border-orange-700/40',  secBg: 'bg-orange-900/20', secBorder: 'border-orange-500/20', dot: 'bg-orange-400',  tabActive: 'bg-orange-800/40 border-orange-500/50',  sky: 'from-orange-600 via-orange-400 to-amber-300' },
  teal:    { grad: 'from-teal-900/60 to-teal-700/20',     border: 'border-teal-500/30',    text: 'text-teal-300',    statBg: 'bg-teal-950/60',   statBorder: 'border-teal-700/40',    secBg: 'bg-teal-900/20',   secBorder: 'border-teal-500/20',   dot: 'bg-teal-400',    tabActive: 'bg-teal-800/40 border-teal-500/50',      sky: 'from-teal-600 via-teal-400 to-teal-200' },
  purple:  { grad: 'from-purple-900/60 to-purple-700/20', border: 'border-purple-500/30',  text: 'text-purple-300',  statBg: 'bg-purple-950/60', statBorder: 'border-purple-700/40',  secBg: 'bg-purple-900/20', secBorder: 'border-purple-500/20', dot: 'bg-purple-400',  tabActive: 'bg-purple-800/40 border-purple-500/50',  sky: 'from-purple-600 via-purple-400 to-purple-200' },
  emerald: { grad: 'from-emerald-900/60 to-emerald-700/20', border: 'border-emerald-500/30', text: 'text-emerald-300', statBg: 'bg-emerald-950/60', statBorder: 'border-emerald-700/40', secBg: 'bg-emerald-900/20', secBorder: 'border-emerald-500/20', dot: 'bg-emerald-400', tabActive: 'bg-emerald-800/40 border-emerald-500/50', sky: 'from-emerald-600 via-emerald-400 to-emerald-200' },
};

const HAZARD = {
  danger:  { badge: 'bg-red-500/20 text-red-200 border-red-500/40',          label: '⚠ DANGER',  border: 'border-l-red-500' },
  caution: { badge: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/40', label: '⚡ CAUTION', border: 'border-l-yellow-500' },
};

const AerodynamicsView = ({ data }) => {
  const [selectedId, setSelectedId]     = useState('four-forces');
  const [openSections, setOpenSections] = useState(() => new Set([0, 1, 2, 3, 4]));
  const tabScrollRef                    = useRef(null);

  const topic = data?.find(t => t.id === selectedId);
  const c     = COLORS[topic?.color] || COLORS.indigo;

  const selectTopic = (id) => {
    setSelectedId(id);
    setOpenSections(new Set([0, 1, 2, 3, 4]));
  };

  const toggleSection = (i) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  useEffect(() => {
    if (!tabScrollRef.current) return;
    const active = tabScrollRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  if (!data?.length) return null;

  return (
    <div>
      {/* ── Accent bar ── */}
      <div className={`h-1 rounded-full mb-4 bg-gradient-to-r ${c.sky} opacity-60`} />

      {/* ── Topic tabs ── */}
      <div
        ref={tabScrollRef}
        className="flex gap-2 overflow-x-auto pb-2 mb-5"
        style={{ scrollbarWidth: 'none' }}
      >
        {data.map(t => {
          const tc       = COLORS[t.color] || COLORS.indigo;
          const isActive = selectedId === t.id;
          return (
            <button
              key={t.id}
              data-active={isActive}
              onClick={() => selectTopic(t.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border transition-all duration-200 min-w-[72px] ${
                isActive ? `${tc.tabActive}` : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-xl leading-none">{t.emoji}</span>
              <span className={`text-xs font-semibold leading-tight text-center ${isActive ? tc.text : 'text-white/35'}`}>
                {t.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Detail panel ── */}
      <AnimatePresence mode="wait">
        {topic && (
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className={`bg-gradient-to-br ${c.grad} rounded-2xl ${c.border} border p-5 mb-4 backdrop-blur-sm`}>
              <div className="flex items-start gap-4">
                <span className="text-5xl leading-none flex-shrink-0 mt-0.5">{topic.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-2xl leading-tight">{topic.name}</h3>
                  <p className={`text-sm mt-1 ${c.text}`}>{topic.tagline}</p>
                </div>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {topic.keyStats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className={`rounded-xl border ${c.statBg} ${c.statBorder} p-3`}
                >
                  <p className="text-white/30 text-xs mb-1.5 leading-tight">{stat.label}</p>
                  <p className={`font-bold text-base leading-snug ${c.text}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Sections */}
            <div className="space-y-2">
              {topic.sections.map((sec, si) => {
                const isOpen = openSections.has(si);
                const h      = sec.hazard ? HAZARD[sec.hazard] : null;
                return (
                  <div
                    key={si}
                    className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
                      isOpen
                        ? `${c.secBg} ${c.secBorder} ${h ? `border-l-4 ${h.border}` : ''}`
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <button
                      onClick={() => toggleSection(si)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                      <span className={`font-semibold text-sm flex-1 ${isOpen ? 'text-white' : 'text-white/50'}`}>
                        {sec.title}
                      </span>
                      {h && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${h.badge}`}>
                          {h.label}
                        </span>
                      )}
                      <span className="text-white/20 text-xs flex-shrink-0 tabular-nums">
                        {sec.rows.length}
                      </span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-white/25 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10 divide-y divide-white/5">
                            {sec.rows.map((row, ri) => (
                              <motion.div
                                key={ri}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: ri * 0.025 }}
                                className="flex items-start gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${c.dot}`} />
                                <div className="flex-1 min-w-0 text-sm leading-snug">
                                  <span className="text-white/85 font-semibold">{row.label}</span>
                                  <span className="text-white/35 mx-1.5">·</span>
                                  <span className="text-white/50">{row.info}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Collapse/expand all */}
            <div className="flex gap-3 mt-4 mb-8">
              <button
                onClick={() => setOpenSections(new Set(topic.sections.map((_, i) => i)))}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Expand all
              </button>
              <span className="text-white/15 text-xs">·</span>
              <button
                onClick={() => setOpenSections(new Set())}
                className="text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                Collapse all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick topic rail ── */}
      <div>
        <h3 className="text-white/25 text-xs font-bold uppercase tracking-widest mb-3">All Topics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {data.map(t => {
            const tc       = COLORS[t.color] || COLORS.indigo;
            const isActive = selectedId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => selectTopic(t.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                  isActive ? `${tc.tabActive}` : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-lg leading-none flex-shrink-0">{t.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm leading-none ${isActive ? tc.text : 'text-white/55'}`}>{t.name}</p>
                  <p className="text-white/25 text-xs mt-0.5 truncate">{t.tagline.split(' — ')[1] || t.tagline}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AerodynamicsView;
