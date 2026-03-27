import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpenIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MNEMONICS_DATA = [
  {
    id: 'pave',
    acronym: 'PAVE',
    title: 'Pilot Risk Assessment',
    description: 'A structured framework for identifying hazards before every flight.',
    color: 'purple',
    letters: [
      {
        letter: 'P', word: 'Pilot',
        description: 'Assess your own fitness to fly before every flight.',
        subMnemonic: {
          acronym: 'IMSAFE',
          title: 'Personal Minimums Checklist',
          description: 'A self-assessment checklist to evaluate personal readiness.',
          letters: [
            { letter: 'I', word: 'Illness',          description: 'Am I suffering from any illness or symptoms that could affect performance?' },
            { letter: 'M', word: 'Medication',        description: 'Am I taking any medication that could affect my judgement or performance?' },
            { letter: 'S', word: 'Stress',            description: 'Am I under unusual psychological or emotional stress?' },
            { letter: 'A', word: 'Alcohol',           description: 'Have I consumed alcohol within the last 8 hours? (8 hours bottle to throttle, <0.04% BAC)' },
            { letter: 'F', word: 'Fatigue',           description: 'Am I adequately rested and alert? Fatigue is a leading cause of accidents.' },
            { letter: 'E', word: 'Eating / Emotion',  description: 'Have I eaten properly? Am I emotionally stable?' },
          ]
        }
      },
      {
        letter: 'A', word: 'Aircraft',
        description: 'Is the aircraft airworthy and properly equipped for the planned flight?',
        subMnemonic: {
          acronym: 'ARROW',
          title: 'Required Aircraft Documents',
          description: 'Documents that must be on board the aircraft at all times.',
          letters: [
            { letter: 'A', word: 'Airworthiness Certificate',  description: 'Must be displayed and visible in the aircraft at all times.' },
            { letter: 'R', word: 'Registration',               description: 'Current FAA aircraft registration certificate.' },
            { letter: 'R', word: 'Radio Station License',       description: 'Required when flying internationally or outside US airspace.' },
            { letter: 'O', word: 'Operating Handbook (POH/AFM)', description: 'Approved flight manual or pilot\'s operating handbook for the specific aircraft.' },
            { letter: 'W', word: 'Weight and Balance',          description: 'Current weight and balance data, including equipment list.' },
          ]
        }
      },
      {
        letter: 'V', word: 'enVironment',
        description: 'Evaluate all external environmental conditions that may affect your flight.',
        items: [
          { label: 'Weather',           detail: 'Current, forecast, and en-route weather including winds, icing, turbulence, and visibility.' },
          { label: 'Airspace',          detail: 'Restricted areas, TFRs, special use airspace, and class of airspace along the route.' },
          { label: 'Terrain & Obstacles', detail: 'Minimum safe altitudes, mountains, towers, and other obstructions.' },
          { label: 'NOTAMs',            detail: 'Notices to Air Missions affecting runways, navaids, and airspace along the route.' },
          { label: 'Night / IMC',       detail: 'Additional risks and requirements for night operations or instrument conditions.' },
        ]
      },
      {
        letter: 'E', word: 'External Pressures',
        description: 'Identify and mitigate outside influences that may compromise your decision making.',
        items: [
          { label: 'Get-there-itis',        detail: 'The hazardous attitude of pressing on to complete the flight despite warning signs.' },
          { label: 'Schedule pressure',      detail: 'External time pressure from meetings, connections, or commitments.' },
          { label: 'Passenger expectations', detail: 'Pressure from passengers who are counting on you completing the flight.' },
          { label: 'Financial pressure',     detail: 'The cost of cancelling and finding alternative transportation.' },
        ]
      },
    ]
  },
  {
    id: 'gumps',
    acronym: 'GUMPS',
    title: 'Pre-Landing Checklist',
    description: 'A memory aid for pre-landing configuration checks.',
    color: 'blue',
    letters: [
      { letter: 'G', word: 'Gas',               description: 'Fuel selector on the fullest tank or Both; verify fuel quantity.' },
      { letter: 'U', word: 'Undercarriage',      description: 'Landing gear down and locked (retractable gear aircraft).' },
      { letter: 'M', word: 'Mixture',            description: 'Mixture rich, or as required for field elevation.' },
      { letter: 'P', word: 'Propeller',          description: 'Prop control full forward for go-around capability (if applicable).' },
      { letter: 'S', word: 'Switches / Seatbelts', description: 'Lights on, switches as required, seatbelts and harnesses secured.' },
    ]
  },
  {
    id: 'cigar',
    acronym: 'CIGAR',
    title: 'Pre-Takeoff Checklist',
    description: 'A memory aid for verifying aircraft configuration before takeoff.',
    color: 'green',
    letters: [
      { letter: 'C', word: 'Controls',             description: 'Flight controls free and correct (full range of motion, correct deflection).' },
      { letter: 'I', word: 'Instruments',           description: 'All instruments set and functioning — altimeter QNH, DI aligned, fuel gauges.' },
      { letter: 'G', word: 'Gas',                   description: 'Fuel on correct tank, sufficient quantity confirmed for the flight.' },
      { letter: 'A', word: 'Attitude / Altimeter',  description: 'Attitude indicator erect, altimeter set to current QNH/altimeter setting.' },
      { letter: 'R', word: 'Run-up / Runway',        description: 'Engine run-up complete, correct runway, clearance obtained if required.' },
    ]
  },
  {
    id: '5hazardous',
    acronym: '5 Hazardous Attitudes',
    title: 'Pilot Decision Making',
    description: 'The five hazardous attitudes that lead to poor aeronautical decision making (ADM), and their antidotes.',
    color: 'red',
    letters: [
      { letter: '1', word: 'Anti-authority',  description: 'Antidote: Follow the rules — they are usually right.' },
      { letter: '2', word: 'Impulsivity',     description: 'Antidote: Not so fast. Think first.' },
      { letter: '3', word: 'Invulnerability', description: 'Antidote: It could happen to me.' },
      { letter: '4', word: 'Macho',           description: 'Antidote: Taking chances is foolish.' },
      { letter: '5', word: 'Resignation',     description: 'Antidote: I\'m not helpless — I can make a difference.' },
    ]
  },
];

const colorMap = {
  purple: { card: 'from-purple-600/30 to-purple-400/20 border-purple-400/30', badge: 'bg-purple-400/20 text-purple-200', letter: 'bg-purple-500/30 text-purple-200 border-purple-400/40', sub: 'bg-purple-500/10 border-purple-400/20' },
  blue:   { card: 'from-blue-600/30 to-blue-400/20 border-blue-400/30',       badge: 'bg-blue-400/20 text-blue-200',     letter: 'bg-blue-500/30 text-blue-200 border-blue-400/40',     sub: 'bg-blue-500/10 border-blue-400/20' },
  green:  { card: 'from-green-600/30 to-green-400/20 border-green-400/30',    badge: 'bg-green-400/20 text-green-200',   letter: 'bg-green-500/30 text-green-200 border-green-400/40',  sub: 'bg-green-500/10 border-green-400/20' },
  red:    { card: 'from-red-600/30 to-red-400/20 border-red-400/30',          badge: 'bg-red-400/20 text-red-200',       letter: 'bg-red-500/30 text-red-200 border-red-400/40',        sub: 'bg-red-500/10 border-red-400/20' },
};

const MnemonicsView = () => {
  const [openMnemonic, setOpenMnemonic] = useState(null);
  const [openLetter, setOpenLetter]   = useState({});
  const [openSubLetter, setOpenSubLetter] = useState({});

  const toggleMnemonic = (id) => {
    setOpenMnemonic(prev => prev === id ? null : id);
    setOpenLetter({});
    setOpenSubLetter({});
  };
  const toggleLetter = (mnemonicId, idx) => {
    const key = `${mnemonicId}-${idx}`;
    setOpenLetter(prev => ({ ...prev, [key]: !prev[key] }));
    setOpenSubLetter({});
  };
  const toggleSubLetter = (mnemonicId, letterIdx, subIdx) => {
    const key = `${mnemonicId}-${letterIdx}-${subIdx}`;
    setOpenSubLetter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {MNEMONICS_DATA.map((m) => {
        const c = colorMap[m.color] || colorMap.blue;
        const isOpen = openMnemonic === m.id;
        return (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${c.card} rounded-2xl border backdrop-blur-sm overflow-hidden`}>
            {/* Top-level header */}
            <button onClick={() => toggleMnemonic(m.id)}
              className="w-full flex items-center gap-4 p-6 text-left hover:bg-white/5 transition-colors">
              <span className={`text-2xl font-black tracking-widest px-4 py-2 rounded-xl border ${c.letter}`}>
                {m.acronym}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-lg">{m.title}</div>
                <div className="text-white/50 text-sm mt-0.5 truncate">{m.description}</div>
              </div>
              {isOpen
                ? <ChevronDownIcon  className="w-5 h-5 text-white/50 flex-shrink-0" />
                : <ChevronRightIcon className="w-5 h-5 text-white/50 flex-shrink-0" />}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div key="letters"
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                  className="overflow-hidden">
                  <div className="px-6 pb-6 space-y-2">
                    {m.letters.map((l, li) => {
                      const letterKey = `${m.id}-${li}`;
                      const letterOpen = !!openLetter[letterKey];
                      return (
                        <div key={li} className={`rounded-xl border ${c.sub} overflow-hidden`}>
                          {/* Letter row */}
                          <button onClick={() => toggleLetter(m.id, li)}
                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                            <span className={`w-9 h-9 flex items-center justify-center rounded-lg font-black text-lg border flex-shrink-0 ${c.letter}`}>
                              {l.letter}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-white font-semibold">{l.word}</span>
                              {l.subMnemonic && (
                                <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                                  → {l.subMnemonic.acronym}
                                </span>
                              )}
                            </div>
                            {letterOpen
                              ? <ChevronDownIcon  className="w-4 h-4 text-white/40 flex-shrink-0" />
                              : <ChevronRightIcon className="w-4 h-4 text-white/40 flex-shrink-0" />}
                          </button>

                          <AnimatePresence>
                            {letterOpen && (
                              <motion.div key="lcontent"
                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                className="overflow-hidden">
                                <div className="px-4 pb-4">
                                  <p className="text-white/70 text-sm mb-3">{l.description}</p>

                                  {/* Plain items list */}
                                  {l.items && (
                                    <ul className="space-y-2">
                                      {l.items.map((item, ii) => (
                                        <li key={ii} className="flex gap-3">
                                          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.letter.includes('purple') ? 'bg-purple-400' : c.letter.includes('blue') ? 'bg-blue-400' : c.letter.includes('green') ? 'bg-green-400' : 'bg-red-400'}`} />
                                          <div>
                                            <span className="text-white/90 text-sm font-medium">{item.label}: </span>
                                            <span className="text-white/60 text-sm">{item.detail}</span>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {/* Sub-mnemonic */}
                                  {l.subMnemonic && (
                                    <div className="mt-2 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                                      <div className="px-4 py-3 border-b border-white/10">
                                        <span className="text-white font-bold text-base tracking-widest">{l.subMnemonic.acronym}</span>
                                        <span className="text-white/50 text-sm ml-3">{l.subMnemonic.title}</span>
                                      </div>
                                      <div className="divide-y divide-white/5">
                                        {l.subMnemonic.letters.map((sl, sli) => {
                                          const subKey = `${m.id}-${li}-${sli}`;
                                          const subOpen = !!openSubLetter[subKey];
                                          return (
                                            <button key={sli} onClick={() => toggleSubLetter(m.id, li, sli)}
                                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
                                              <span className={`w-7 h-7 flex items-center justify-center rounded-md font-black text-sm border flex-shrink-0 ${c.letter}`}>
                                                {sl.letter}
                                              </span>
                                              <div className="flex-1">
                                                <span className="text-white/90 text-sm font-semibold">{sl.word}</span>
                                                <AnimatePresence>
                                                  {subOpen && (
                                                    <motion.p key="sdesc"
                                                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                      exit={{ opacity: 0, height: 0 }}
                                                      className="text-white/55 text-xs mt-1 leading-relaxed overflow-hidden">
                                                      {sl.description}
                                                    </motion.p>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                              {subOpen
                                                ? <ChevronDownIcon  className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                                                : <ChevronRightIcon className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

const Study = () => {
  const [metarsData, setMetarsData] = useState(null);
  const [generalData, setGeneralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null); // 'metars', 'general', or null

  useEffect(() => {
    fetchStudyData();
  }, []);

  const fetchStudyData = async () => {
    try {
      setLoading(true);
      const [metarsRes, generalRes] = await Promise.all([
        axios.get('/quiz-data/pilot-metars.json'),
        axios.get('/quiz-data/pilot-general.json')
      ]);
      setMetarsData(metarsRes.data);
      setGeneralData(generalRes.data);
    } catch (error) {
      console.error('Error loading study data:', error);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 container-custom">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
            <p className="text-white text-lg">Loading study materials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 container-custom">
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
          {metarsData && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStudy('metars')}
              className="group bg-gradient-to-br from-blue-600/40 to-blue-400/20 hover:from-blue-600/60 hover:to-blue-400/40 border border-blue-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
            >
              <BookOpenIcon className="w-12 h-12 text-blue-300 mb-4 group-hover:text-blue-200 transition-colors" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {metarsData.category_name || 'METAR Study'}
              </h2>
              <p className="text-blue-200 mb-4">
                {metarsData.questions?.length || 0} items
              </p>
              <span className="text-blue-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Start Studying →
              </span>
            </motion.button>
          )}

          {generalData && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStudy('general')}
              className="group bg-gradient-to-br from-blue-600/40 to-blue-400/20 hover:from-blue-600/60 hover:to-blue-400/40 border border-blue-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
            >
              <BookOpenIcon className="w-12 h-12 text-blue-300 mb-4 group-hover:text-blue-200 transition-colors" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {generalData.category_name || 'General Knowledge'}
              </h2>
              <p className="text-blue-200 mb-4">
                {generalData.questions?.length || 0} items
              </p>
              <span className="text-blue-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Start Studying →
              </span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedStudy('mnemonics')}
            className="group bg-gradient-to-br from-purple-600/40 to-purple-400/20 hover:from-purple-600/60 hover:to-purple-400/40 border border-purple-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
          >
            <BookOpenIcon className="w-12 h-12 text-purple-300 mb-4 group-hover:text-purple-200 transition-colors" />
            <h2 className="text-2xl font-bold text-white mb-2">Mnemonics</h2>
            <p className="text-purple-200 mb-4">{MNEMONICS_DATA.length} acronyms</p>
            <span className="text-purple-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
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

          {selectedStudy === 'mnemonics' ? (
            <MnemonicsView />
          ) : (
            <StudyBox
              data={selectedStudy === 'metars' ? metarsData : generalData}
              title={selectedStudy === 'metars' ? metarsData.category_name : generalData.category_name}
              icon={BookOpenIcon}
            />
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Study;
