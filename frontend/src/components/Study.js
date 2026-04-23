import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpenIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import FlowsView from './FlowsView';
import AirspaceView from './AirspaceView';
import WeatherView from './WeatherView';
import CamelsView from './CamelsView';
import AerodynamicsView from './AerodynamicsView';
import SEO from './SEO';

const colorMap = {
  purple: { card: 'from-purple-600/30 to-purple-400/20 border-purple-400/30', badge: 'bg-purple-400/20 text-purple-200', letter: 'bg-purple-500/30 text-purple-200 border-purple-400/40', sub: 'bg-purple-500/10 border-purple-400/20', dot: 'bg-purple-400', active: 'bg-purple-500/20 border-purple-400/30' },
  blue:   { card: 'from-blue-600/30 to-blue-400/20 border-blue-400/30',       badge: 'bg-blue-400/20 text-blue-200',     letter: 'bg-blue-500/30 text-blue-200 border-blue-400/40',     sub: 'bg-blue-500/10 border-blue-400/20',   dot: 'bg-blue-400',   active: 'bg-blue-500/20 border-blue-400/30' },
  green:  { card: 'from-green-600/30 to-green-400/20 border-green-400/30',    badge: 'bg-green-400/20 text-green-200',   letter: 'bg-green-500/30 text-green-200 border-green-400/40',  sub: 'bg-green-500/10 border-green-400/20', dot: 'bg-green-400', active: 'bg-green-500/20 border-green-400/30' },
  red:    { card: 'from-red-600/30 to-red-400/20 border-red-400/30',          badge: 'bg-red-400/20 text-red-200',       letter: 'bg-red-500/30 text-red-200 border-red-400/40',        sub: 'bg-red-500/10 border-red-400/20',     dot: 'bg-red-400',   active: 'bg-red-500/20 border-red-400/30' },
  orange: { card: 'from-orange-600/30 to-orange-400/20 border-orange-400/30', badge: 'bg-orange-400/20 text-orange-200', letter: 'bg-orange-500/30 text-orange-200 border-orange-400/40', sub: 'bg-orange-500/10 border-orange-400/20', dot: 'bg-orange-400', active: 'bg-orange-500/20 border-orange-400/30' },
};

const MnemonicsView = ({ data }) => {
  const [selected, setSelected]                   = useState(null);
  const [activeLetter, setActiveLetter]           = useState(null);
  const [activeSubLetter, setActiveSubLetter]     = useState(null);
  const [activeSubSubLetter, setActiveSubSubLetter] = useState(null);

  const enter = (m) => { setSelected(m); setActiveLetter(null); setActiveSubLetter(null); setActiveSubSubLetter(null); };
  const back  = ()  => { setSelected(null); setActiveLetter(null); setActiveSubLetter(null); setActiveSubSubLetter(null); };
  const toggleLetter = (idx) => { setActiveLetter(prev => prev === idx ? null : idx); setActiveSubLetter(null); setActiveSubSubLetter(null); };
  const toggleSub    = (key) => { setActiveSubLetter(prev => prev === key ? null : key); setActiveSubSubLetter(null); };
  const toggleSubSub = (key) => setActiveSubSubLetter(prev => prev === key ? null : key);

  /* ── Gallery ── */
  if (!selected) {
    return (
      <motion.div
        key="gallery"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {(data || []).map((m, mi) => {
          const c = colorMap[m.color] || colorMap.blue;
          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mi * 0.07 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => enter(m)}
              className={`bg-gradient-to-br ${c.card} rounded-2xl border p-6 text-left transition-all duration-200 backdrop-blur-sm group`}
            >
              {/* Letter tiles */}
              <div className="flex flex-wrap gap-2 mb-5">
                {m.acronym.split('').map((ch, i) => (
                  <span key={i} className={`w-11 h-11 flex items-center justify-center rounded-xl font-black text-xl border ${c.letter} group-hover:scale-105 transition-transform`}>
                    {ch}
                  </span>
                ))}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{m.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{m.description}</p>
              <p className="text-white/30 text-xs mt-4 font-semibold tracking-wide">{m.letters.length} items &rarr;</p>
            </motion.button>
          );
        })}
      </motion.div>
    );
  }

  /* ── Drilldown ── */
  const c = colorMap[selected.color] || colorMap.blue;
  return (
    <motion.div key="detail" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>

      {/* Back + breadcrumb */}
      <button onClick={back}
        className="mb-6 flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors"
      >
        <ChevronRightIcon className="w-4 h-4 rotate-180" />
        All Mnemonics
      </button>

      {/* Header */}
      <div className={`bg-gradient-to-br ${c.card} rounded-2xl border p-6 mb-5 backdrop-blur-sm`}>
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.acronym.split('').map((ch, i) => (
            <span key={i} className={`w-12 h-12 flex items-center justify-center rounded-xl font-black text-2xl border ${c.letter}`}>
              {ch}
            </span>
          ))}
        </div>
        <h2 className="text-white font-bold text-2xl">{selected.title}</h2>
        <p className="text-white/55 text-sm mt-1">{selected.description}</p>
      </div>

      {/* Letter cards */}
      <div className="space-y-3">
        {selected.letters.map((l, li) => {
          const isActive = activeLetter === li;
          return (
            <motion.div key={li} layout className={`rounded-2xl border overflow-hidden ${isActive ? c.active : c.sub} transition-colors duration-200`}>

              {/* Letter button */}
              <button onClick={() => toggleLetter(li)}
                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
              >
                <span className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-2xl border ${c.letter}`}>
                  {l.letter}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-bold text-base">{l.word}</span>
                  {(l.subMnemonics || (l.subMnemonic ? [l.subMnemonic] : [])).map((sm, smi) => (
                    <span key={smi} className={`ml-3 text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                      → {sm.acronym}
                    </span>
                  ))}
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                      <p className="text-white/70 text-sm leading-relaxed">{l.description}</p>

                      {/* Bullet items */}
                      {l.items && (
                        <ul className="space-y-2">
                          {l.items.map((item, ii) => (
                            <li key={ii} className="flex gap-3 text-sm">
                              <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${c.dot}`} />
                              <div>
                                <span className="text-white/85 font-semibold">{item.label}: </span>
                                <span className="text-white/55">{item.detail}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Sub-mnemonic(s) */}
                      {(l.subMnemonics || (l.subMnemonic ? [l.subMnemonic] : [])).map((sm, mi) => (
                        <div key={mi} className="rounded-xl bg-black/20 border border-white/10 overflow-hidden">
                          <div className="flex flex-wrap gap-2 items-center px-4 py-3 border-b border-white/10">
                            {sm.acronym.split('').map((ch, i) => (
                              <span key={i} className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm border ${c.letter}`}>{ch}</span>
                            ))}
                            <span className="text-white/45 text-xs ml-1">{sm.title}</span>
                          </div>
                          <div className="divide-y divide-white/5">
                            {sm.letters.map((sl, sli) => {
                              const subKey = `${li}-${mi}-${sli}`;
                              const subOpen = activeSubLetter === subKey;
                              return (
                                <div key={sli}>
                                  {/* Sub-letter row */}
                                  <button onClick={() => toggleSub(subKey)}
                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${subOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                  >
                                    <span className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md font-black text-sm border mt-0.5 ${c.letter}`}>{sl.letter}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white/90 text-sm font-semibold">
                                        {sl.word}
                                        {(sl.subMnemonics || (sl.subMnemonic ? [sl.subMnemonic] : [])).map((ssm, ssmi) => (
                                          <span key={ssmi} className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${c.badge}`}>→ {ssm.acronym}</span>
                                        ))}
                                      </div>
                                      <AnimatePresence>
                                        {subOpen && sl.description && (
                                          <motion.p
                                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-white/55 text-xs mt-1 leading-relaxed overflow-hidden"
                                          >
                                            {sl.description}
                                          </motion.p>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                    <ChevronDownIcon className={`w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-1 transition-transform duration-150 ${subOpen ? 'rotate-180' : ''}`} />
                                  </button>

                                  {/* Sub-sub-mnemonic(s) */}
                                  <AnimatePresence>
                                    {subOpen && (sl.subMnemonics || (sl.subMnemonic ? [sl.subMnemonic] : [])).length > 0 && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                      >
                                        {(sl.subMnemonics || (sl.subMnemonic ? [sl.subMnemonic] : [])).map((ssm, ssmi) => (
                                        <div key={ssmi} className="mx-4 mb-3 rounded-xl bg-black/20 border border-white/10 overflow-hidden">
                                          <div className="flex flex-wrap gap-1.5 items-center px-3 py-2 border-b border-white/10">
                                            {ssm.acronym.split('').map((ch, i) => (
                                              <span key={i} className={`w-6 h-6 flex items-center justify-center rounded font-black text-xs border ${c.letter}`}>{ch}</span>
                                            ))}
                                            <span className="text-white/40 text-xs ml-1">{ssm.title}</span>
                                          </div>
                                          <div className="divide-y divide-white/5">
                                            {ssm.letters.map((ssl, ssli) => {
                                              const subSubKey = `${li}-${mi}-${sli}-${ssmi}-${ssli}`;
                                              const subSubOpen = activeSubSubLetter === subSubKey;
                                              return (
                                                <button key={ssli} onClick={() => toggleSubSub(subSubKey)}
                                                  className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${subSubOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                                >
                                                  <span className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded font-black text-xs border ${c.letter}`}>{ssl.letter}</span>
                                                  <div className="flex-1 min-w-0">
                                                    <div className="text-white/85 text-xs font-semibold">{ssl.word}</div>
                                                    <AnimatePresence>
                                                      {subSubOpen && ssl.description && (
                                                        <motion.p
                                                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                          exit={{ opacity: 0, height: 0 }}
                                                          className="text-white/50 text-xs mt-0.5 overflow-hidden"
                                                        >
                                                          {ssl.description}
                                                        </motion.p>
                                                      )}
                                                    </AnimatePresence>
                                                  </div>
                                                  {ssl.description && <ChevronDownIcon className={`w-3 h-3 text-white/25 flex-shrink-0 transition-transform duration-150 ${subSubOpen ? 'rotate-180' : ''}`} />}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const Study = () => {
  const [sectionData, setSectionData]       = useState({});
  const [sectionLoading, setSectionLoading] = useState(false);
  const [selectedStudy, setSelectedStudy]   = useState(null);

  const FILE_MAP = {
    metars:       '/quiz-data/pilot-metars.json',
    general:      '/quiz-data/pilot-general.json',
    mnemonics:    '/quiz-data/mnemonics.json',
    flows:        '/quiz-data/flows.json',
    airspace:     '/quiz-data/airspace.json',
    weather:      '/quiz-data/weather.json',
    camels:       '/quiz-data/camels.json',
    aerodynamics: '/quiz-data/aerodynamics.json',
  };

  const handleSelectStudy = async (key) => {
    setSelectedStudy(key);
    if (sectionData[key]) return; // already loaded
    setSectionLoading(true);
    try {
      const res = await axios.get(FILE_MAP[key]);
      setSectionData(prev => ({ ...prev, [key]: res.data }));
    } catch (err) {
      console.error('Failed to load section:', err);
      toast.error('Failed to load study materials');
      setSelectedStudy(null);
    } finally {
      setSectionLoading(false);
    }
  };

  const StudyBox = ({ data, title, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-600/30 to-blue-400/20 rounded-2xl p-8 border border-blue-400/30 backdrop-blur-sm"
    >
      <div className="flex items-center space-x-3 mb-6">
        {Icon && <Icon className="w-6 h-6 text-blue-300" />}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="ml-auto text-sm text-blue-200 bg-blue-400/20 px-3 py-1 rounded-full">
          {data?.questions?.length || 0} items
        </span>
      </div>

      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
        {data?.questions?.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.id * 0.02 }}
            className="bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 rounded-lg p-4 transition-all duration-200"
          >
            <div className="flex-1">
              <div className="text-xs text-blue-300 font-semibold mb-2 uppercase tracking-wider">
                Q{item.id}:
              </div>
              <h3 className="text-base font-medium text-white leading-relaxed mb-4">
                {item.question_text}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2">
                    Answer
                  </p>
                  <p className="text-sm text-white/90 bg-blue-400/25 border border-blue-300/40 rounded px-3 py-2 font-medium">
                    {item.correct_answer}
                  </p>
                </div>

                {item.explanation && (
                  <div>
                    <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2">
                      Explanation
                    </p>
                    <p className="text-sm text-white/75 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 container-custom">
      <SEO
        title="Study Materials"
        path="/study"
        description="Aviation and FIRE study materials by Maycon Meier — mnemonics, METARs, aviation mnemonics (PAVE, IMSAFE, ICEFLAGS), procedures, and flashcards for student pilots."
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center space-x-3 mb-4">
          <BookOpenIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">Study Materials</h1>
        </div>
        <p className="text-blue-200/60 text-lg">
          Select a study category to begin
        </p>
      </motion.div>

      {!selectedStudy ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('metars')}
            className="group bg-gradient-to-br from-blue-600/40 to-blue-400/20 hover:from-blue-600/60 hover:to-blue-400/40 border border-blue-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-blue-300 mb-4 group-hover:text-blue-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">METAR Study</h2>
            <p className="text-blue-200 mb-4">METAR decoding · 40+ questions</p>
            <span className="text-blue-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('general')}
            className="group bg-gradient-to-br from-blue-600/40 to-blue-400/20 hover:from-blue-600/60 hover:to-blue-400/40 border border-blue-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-blue-300 mb-4 group-hover:text-blue-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">General Knowledge</h2>
            <p className="text-blue-200 mb-4">Regulations, systems, weather · 50+ questions</p>
            <span className="text-blue-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('mnemonics')}
            className="group bg-gradient-to-br from-purple-600/40 to-purple-400/20 hover:from-purple-600/60 hover:to-purple-400/40 border border-purple-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-purple-300 mb-4 group-hover:text-purple-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">Mnemonics</h2>
            <p className="text-purple-200 mb-4">PAVE, IMSAFE, ICEFLAGS · 15+ acronyms</p>
            <span className="text-purple-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('flows')}
            className="group bg-gradient-to-br from-green-600/40 to-green-400/20 hover:from-green-600/60 hover:to-green-400/40 border border-green-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-green-300 mb-4 group-hover:text-green-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">Flows</h2>
            <p className="text-green-200 mb-4">SR20 cockpit flows · 4 phases</p>
            <span className="text-green-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('airspace')}
            className="group bg-gradient-to-br from-orange-600/40 to-amber-400/20 hover:from-orange-600/60 hover:to-amber-400/40 border border-orange-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-orange-300 mb-4 group-hover:text-orange-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">Airspace</h2>
            <p className="text-orange-200 mb-4">Classes A · B · C · D · E · G</p>
            <span className="text-orange-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('weather')}
            className="group bg-gradient-to-br from-sky-600/40 to-blue-400/20 hover:from-sky-600/60 hover:to-blue-400/40 border border-sky-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-sky-300 mb-4 group-hover:text-sky-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">Weather</h2>
            <p className="text-sky-200 mb-4">PHAK Ch. 11–12 · 12 topics</p>
            <span className="text-sky-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('camels')}
            className="group bg-gradient-to-br from-amber-600/40 to-yellow-400/20 hover:from-amber-600/60 hover:to-yellow-400/40 border border-amber-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-amber-300 mb-4 group-hover:text-amber-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">CAMELS</h2>
            <p className="text-amber-200 mb-4">SR20 maneuver requirements · 7 maneuvers</p>
            <span className="text-amber-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelectStudy('aerodynamics')}
            className="group bg-gradient-to-br from-indigo-600/40 to-violet-400/20 hover:from-indigo-600/60 hover:to-violet-400/40 border border-indigo-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-indigo-300 mb-4 group-hover:text-indigo-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">Aerodynamics & Maneuvers</h2>
            <p className="text-indigo-200 mb-4">PHAK Ch. 4–5 · AFH maneuvers · 12 topics</p>
            <span className="text-indigo-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
              Start Studying →
            </span>
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => setSelectedStudy(null)}
            className="mb-8 px-6 py-2 bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/40 rounded-lg text-blue-200 font-semibold transition-colors"
          >
            ← Back to Selection
          </motion.button>

          {sectionLoading ? (
            <div className="flex justify-center py-20">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
            </div>
          ) : selectedStudy === 'mnemonics' ? (
            <MnemonicsView data={sectionData.mnemonics} />
          ) : selectedStudy === 'flows' ? (
            <FlowsView data={sectionData.flows} />
          ) : selectedStudy === 'airspace' ? (
            <AirspaceView data={sectionData.airspace} />
          ) : selectedStudy === 'weather' ? (
            <WeatherView data={sectionData.weather} />
          ) : selectedStudy === 'camels' ? (
            <CamelsView data={sectionData.camels} />
          ) : selectedStudy === 'aerodynamics' ? (
            <AerodynamicsView data={sectionData.aerodynamics} />
          ) : (
            <StudyBox
              data={sectionData[selectedStudy]}
              title={sectionData[selectedStudy]?.category_name || (selectedStudy === 'metars' ? 'METAR Study' : 'General Knowledge')}
              icon={BookOpenIcon}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Study;
