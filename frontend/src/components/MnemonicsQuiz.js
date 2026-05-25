import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XMarkIcon, ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const colorMap = {
  purple: { card: 'from-purple-600/30 to-purple-400/20 border-purple-400/30', letter: 'bg-purple-500/30 text-purple-200 border-purple-400/40', text: 'text-purple-300', bar: 'bg-purple-500', inputFocus: 'focus:border-purple-400/70 focus:ring-purple-400/20' },
  blue:   { card: 'from-blue-600/30 to-blue-400/20 border-blue-400/30',       letter: 'bg-blue-500/30 text-blue-200 border-blue-400/40',       text: 'text-blue-300',   bar: 'bg-blue-500',   inputFocus: 'focus:border-blue-400/70 focus:ring-blue-400/20' },
  green:  { card: 'from-green-600/30 to-green-400/20 border-green-400/30',    letter: 'bg-green-500/30 text-green-200 border-green-400/40',    text: 'text-green-300',  bar: 'bg-green-500',  inputFocus: 'focus:border-green-400/70 focus:ring-green-400/20' },
  red:    { card: 'from-red-600/30 to-red-400/20 border-red-400/30',          letter: 'bg-red-500/30 text-red-200 border-red-400/40',          text: 'text-red-300',    bar: 'bg-red-500',    inputFocus: 'focus:border-red-400/70 focus:ring-red-400/20' },
  orange: { card: 'from-orange-600/30 to-orange-400/20 border-orange-400/30', letter: 'bg-orange-500/30 text-orange-200 border-orange-400/40', text: 'text-orange-300', bar: 'bg-orange-500', inputFocus: 'focus:border-orange-400/70 focus:ring-orange-400/20' },
};

const COLOR_CYCLE = ['purple', 'blue', 'green', 'red', 'orange'];

// ── Flatten all mnemonics recursively ──────────────────────────────────────
function flattenMnemonics(data) {
  const result = [];
  let colorIdx = 0;

  function process(m, inheritColor) {
    const color = m.color || inheritColor || COLOR_CYCLE[colorIdx++ % COLOR_CYCLE.length];
    if (m.acronym && m.letters?.length) {
      result.push({ acronym: m.acronym, title: m.title, description: m.description, letters: m.letters, color, _key: m.acronym + '_' + result.length });
    }
    (m.letters || []).forEach(l => {
      const subs = Array.isArray(l.subMnemonics) ? l.subMnemonics
                 : l.subMnemonics                 ? [l.subMnemonics]
                 : l.subMnemonic                  ? [l.subMnemonic]
                 :                                  [];
      subs.forEach(sub => process(sub, color));
    });
  }

  (data || []).forEach(m => process(m, null));
  return result;
}

// ── Fuzzy matching ─────────────────────────────────────────────────────────
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const prev = Array.from({ length: n + 1 }, (_, j) => j);
  const curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev.splice(0, n + 1, ...curr);
  }
  return prev[n];
}

/**
 * Returns 'exact' | 'fuzzy' | 'wrong'
 * Fuzzy tolerance: 0 errors ≤4 chars, 1 error 5–8, 2 errors 9–13, 3 errors 14+
 */
function matchResult(input, word) {
  const norm = s => s.trim().toLowerCase().replace(/[-–]/g, ' ').replace(/\s+/g, ' ');
  const val = norm(input);
  if (!val) return 'wrong';
  const variants = word.split(/\s*\/\s*/).map(norm);
  if (variants.includes(val)) return 'exact';
  const fuzzy = variants.some(v => {
    const maxLen = Math.max(val.length, v.length);
    const threshold = maxLen <= 4 ? 0 : maxLen <= 8 ? 1 : maxLen <= 13 ? 2 : 3;
    return levenshtein(val, v) <= threshold;
  });
  return fuzzy ? 'fuzzy' : 'wrong';
}

function isCorrect(input, word) {
  return matchResult(input, word) !== 'wrong';
}

// ── Shuffle ────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MnemonicsQuiz = ({ data, onBack }) => {
  const [queue,        setQueue]        = useState(() => shuffle(flattenMnemonics(data)));
  const [idx,          setIdx]          = useState(0);
  const [answers,      setAnswers]      = useState({});
  const [checked,      setChecked]      = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalLetters, setTotalLetters] = useState(0);
  const [done,         setDone]         = useState(false);
  const inputRefs = useRef([]);

  const mnemonic = queue[idx];
  const c = colorMap[mnemonic?.color] || colorMap.blue;

  // Re-flatten when data first arrives
  useEffect(() => {
    if (data?.length) {
      setQueue(shuffle(flattenMnemonics(data)));
      setIdx(0); setAnswers({}); setChecked(false);
      setTotalCorrect(0); setTotalLetters(0); setDone(false);
      inputRefs.current = [];
    }
  }, [data]);

  // Auto-focus first input
  useEffect(() => {
    if (!checked) {
      const t = setTimeout(() => inputRefs.current[0]?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [idx, checked]);

  const handleCheck = useCallback(() => {
    if (checked || !mnemonic) return;
    const correct = mnemonic.letters.filter((l, i) => isCorrect(answers[i] ?? '', l.word)).length;
    setTotalCorrect(prev => prev + correct);
    setTotalLetters(prev => prev + mnemonic.letters.length);
    setChecked(true);
  }, [checked, mnemonic, answers]);

  const handleNext = () => {
    if (idx + 1 >= queue.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setAnswers({});
      setChecked(false);
      inputRefs.current = [];
    }
  };

  const handleRestart = () => {
    setQueue(shuffle(data || []));
    setIdx(0);
    setAnswers({});
    setChecked(false);
    setTotalCorrect(0);
    setTotalLetters(0);
    setDone(false);
    inputRefs.current = [];
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = inputRefs.current[i + 1];
      if (next) {
        next.focus();
      } else {
        handleCheck();
      }
    }
  };

  // ── Done / summary screen ──
  if (done) {
    const pct = totalLetters > 0 ? Math.round((totalCorrect / totalLetters) * 100) : 0;
    const grade = pct >= 90 ? { label: 'Excellent', color: 'text-green-300' }
                : pct >= 70 ? { label: 'Good',      color: 'text-blue-300' }
                : pct >= 50 ? { label: 'Keep at it', color: 'text-yellow-300' }
                :             { label: 'Study more', color: 'text-red-300' };
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-10"
      >
        <div className="text-7xl mb-6">{pct >= 90 ? '🏆' : pct >= 70 ? '✈️' : pct >= 50 ? '📖' : '🔁'}</div>
        <h2 className="text-white font-bold text-3xl mb-2">Quiz Complete</h2>
        <p className={`text-xl font-semibold mb-6 ${grade.color}`}>{grade.label}</p>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <p className="text-white/40 text-sm mb-1">Final Score</p>
          <p className="text-white font-black text-5xl mb-1">{pct}<span className="text-2xl font-bold text-white/40">%</span></p>
          <p className="text-white/40 text-sm">{totalCorrect} / {totalLetters} letters correct across {queue.length} mnemonics</p>
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/40 rounded-xl text-white font-semibold transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" /> Try Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/60 font-semibold transition-colors"
          >
            Back
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (!mnemonic) return null;

  const roundCorrect = checked
    ? mnemonic.letters.filter((l, i) => isCorrect(answers[i] ?? '', l.word)).length
    : null;

  return (
    <div className="max-w-lg mx-auto">

      {/* Progress */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${c.bar}`}
            animate={{ width: `${(idx / queue.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="text-white/30 text-xs tabular-nums flex-shrink-0">{idx + 1} / {queue.length}</span>
        {totalLetters > 0 && (
          <span className="text-white/30 text-xs tabular-nums flex-shrink-0">{Math.round((totalCorrect / totalLetters) * 100)}%</span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mnemonic._key}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>

          {/* Header */}
          <div className={`bg-gradient-to-br ${c.card} rounded-2xl border p-5 mb-4 backdrop-blur-sm`}>
            <div className="flex flex-wrap gap-2 mb-3">
              {mnemonic.acronym.split('').map((ch, i) => (
                <span key={i} className={`w-11 h-11 flex items-center justify-center rounded-xl font-black text-xl border ${c.letter}`}>{ch}</span>
              ))}
            </div>
            <h3 className="text-white font-bold text-lg leading-tight">{mnemonic.title}</h3>
            {mnemonic.description && <p className={`text-sm mt-0.5 ${c.text} opacity-75`}>{mnemonic.description}</p>}
          </div>

          {/* Letter rows */}
          <div className="space-y-2 mb-5">
            {mnemonic.letters.map((l, i) => {
              const result = checked ? matchResult(answers[i] ?? '', l.word) : null;
              const isOk   = result === 'exact' || result === 'fuzzy';
              const rowBg  = checked
                ? result === 'exact' ? 'bg-green-500/10 border-green-500/30'
                : result === 'fuzzy' ? 'bg-amber-500/10 border-amber-500/30'
                :                      'bg-red-500/10 border-red-500/30'
                : 'bg-white/5 border-white/10';

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${rowBg}`}>

                  <span className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-lg border ${c.letter}`}>
                    {l.letter}
                  </span>

                  <div className="flex-1 min-w-0">
                    {!checked ? (
                      <input
                        ref={el => { inputRefs.current[i] = el; }}
                        type="text"
                        value={answers[i] ?? ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                        onKeyDown={e => handleKeyDown(e, i)}
                        placeholder="Type the word…"
                        className={`w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 outline-none ring-1 ring-transparent transition-all ${c.inputFocus} focus:ring-1`}
                      />
                    ) : (
                      <div>
                        <p className={`text-sm font-semibold ${result === 'exact' ? 'text-green-300' : result === 'fuzzy' ? 'text-amber-300' : 'text-red-300'}`}>
                          {answers[i] || <span className="italic text-white/30">blank</span>}
                          {result === 'fuzzy' && <span className="ml-2 text-xs text-amber-400/60 font-normal">close enough</span>}
                        </p>
                        {!isOk && (
                          <p className="text-white/50 text-xs mt-0.5">✓ <span className="text-white/75">{l.word}</span></p>
                        )}
                      </div>
                    )}
                  </div>

                  {checked && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        result === 'exact' ? 'bg-green-500/30' : result === 'fuzzy' ? 'bg-amber-500/30' : 'bg-red-500/30'
                      }`}>
                      {isOk
                        ? <CheckIcon className={`w-3.5 h-3.5 ${result === 'fuzzy' ? 'text-amber-300' : 'text-green-300'}`} />
                        : <XMarkIcon className="w-3.5 h-3.5 text-red-300" />}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {checked && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center text-white/40 text-sm mb-4">
              {roundCorrect} / {mnemonic.letters.length} correct this round
            </motion.p>
          )}

          <div className="flex gap-3">
            {!checked ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCheck}
                className={`flex-1 py-3 rounded-xl font-semibold text-white border bg-gradient-to-br ${c.card} hover:brightness-125 transition-all`}>
                Check Answers
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors flex items-center justify-center gap-2">
                {idx + 1 < queue.length ? <><span>Next</span><ChevronRightIcon className="w-4 h-4" /></> : <span>See Results</span>}
              </motion.button>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack}
              className="px-4 py-3 rounded-xl text-white/30 hover:text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm">
              Quit
            </motion.button>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-5 text-xs text-white/25">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Exact</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Close enough</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Wrong</span>
      </div>
    </div>
  );
};

export default MnemonicsQuiz;
