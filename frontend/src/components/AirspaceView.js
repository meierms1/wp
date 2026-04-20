import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  A: {
    card: 'from-red-700/30 to-red-500/20 border-red-500/40',
    badge: 'bg-red-500/20 text-red-200',
    letter: 'bg-red-600/30 text-red-200 border-red-500/50',
    sub: 'bg-red-900/20 border-red-500/20',
    dot: 'bg-red-400',
    bar: 'bg-red-600/40',
    barActive: 'bg-red-500/70',
    ring: 'border-red-500/50',
    text: 'text-red-300',
    rowBg: 'bg-red-500/10',
  },
  B: {
    card: 'from-blue-700/30 to-blue-500/20 border-blue-500/40',
    badge: 'bg-blue-500/20 text-blue-200',
    letter: 'bg-blue-600/30 text-blue-200 border-blue-500/50',
    sub: 'bg-blue-900/20 border-blue-500/20',
    dot: 'bg-blue-400',
    bar: 'bg-blue-600/40',
    barActive: 'bg-blue-500/70',
    ring: 'border-blue-500/60',
    text: 'text-blue-300',
    rowBg: 'bg-blue-500/10',
  },
  C: {
    card: 'from-fuchsia-700/30 to-fuchsia-500/20 border-fuchsia-500/40',
    badge: 'bg-fuchsia-500/20 text-fuchsia-200',
    letter: 'bg-fuchsia-600/30 text-fuchsia-200 border-fuchsia-500/50',
    sub: 'bg-fuchsia-900/20 border-fuchsia-500/20',
    dot: 'bg-fuchsia-400',
    bar: 'bg-fuchsia-600/40',
    barActive: 'bg-fuchsia-500/70',
    ring: 'border-fuchsia-500/60',
    text: 'text-fuchsia-300',
    rowBg: 'bg-fuchsia-500/10',
  },
  D: {
    card: 'from-sky-700/30 to-sky-500/20 border-sky-500/40',
    badge: 'bg-sky-500/20 text-sky-200',
    letter: 'bg-sky-600/30 text-sky-200 border-sky-500/50',
    sub: 'bg-sky-900/20 border-sky-500/20',
    dot: 'bg-sky-400',
    bar: 'bg-sky-600/40',
    barActive: 'bg-sky-500/70',
    ring: 'border-sky-500/60 border-dashed',
    text: 'text-sky-300',
    rowBg: 'bg-sky-500/10',
  },
  E: {
    card: 'from-purple-700/30 to-purple-500/20 border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-200',
    letter: 'bg-purple-600/30 text-purple-200 border-purple-500/50',
    sub: 'bg-purple-900/20 border-purple-500/20',
    dot: 'bg-purple-400',
    bar: 'bg-purple-600/40',
    barActive: 'bg-purple-500/70',
    ring: 'border-purple-500/50',
    text: 'text-purple-300',
    rowBg: 'bg-purple-500/10',
  },
  G: {
    card: 'from-slate-700/30 to-slate-500/20 border-slate-500/40',
    badge: 'bg-slate-500/20 text-slate-200',
    letter: 'bg-slate-600/30 text-slate-200 border-slate-500/50',
    sub: 'bg-slate-900/20 border-slate-500/20',
    dot: 'bg-slate-400',
    bar: 'bg-slate-600/40',
    barActive: 'bg-slate-500/70',
    ring: 'border-slate-500/50',
    text: 'text-slate-300',
    rowBg: 'bg-slate-500/10',
  },
};

const quickRef = [
  { id: 'A', alt: '18,000 – FL600',      clearance: 'ATC IFR Clearance', comm: 'Required',      vis: 'N/A (IFR only)',      clouds: 'N/A (IFR only)' },
  { id: 'B', alt: 'Surface – ~10,000',   clearance: 'ATC Clearance',     comm: 'Required',      vis: '3 SM',                clouds: 'Clear of clouds' },
  { id: 'C', alt: 'Surface – ~4,000',    clearance: '2-Way Comm',        comm: 'Required',      vis: '3 SM',                clouds: '500 / 1,000 / 2,000' },
  { id: 'D', alt: 'Surface – ~2,500',    clearance: '2-Way Comm',        comm: 'Required',      vis: '3 SM',                clouds: '500 / 1,000 / 2,000' },
  { id: 'E', alt: '1,200 – 17,999',      clearance: 'None (VFR)',        comm: 'None (VFR)',    vis: '3 SM / 5 SM*',        clouds: '500/1k/2k  |  1k/1k/1SM*' },
  { id: 'G', alt: 'Surface – ~1,200',    clearance: 'None',              comm: 'None',          vis: '1 SM day / 3 SM night', clouds: 'Clear (day <1,200)' },
];

const WeatherBlock = ({ label, vis, clouds }) => (
  <div className="bg-black/20 rounded-lg px-3 py-2">
    {label && <p className="text-white/35 text-xs mb-1">{label}</p>}
    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
      <span><span className="text-white/40 text-xs">Vis: </span><span className="text-white/85 font-semibold">{vis}</span></span>
      <span><span className="text-white/40 text-xs">Clouds: </span><span className="text-white/85 font-semibold">{clouds}</span></span>
    </div>
  </div>
);

const AirspaceView = ({ data }) => {
  const [selected, setSelected] = useState('B');

  if (!data || !data.length) return null;

  const cls = data.find(c => c.id === selected);
  const c = colorMap[selected] || colorMap.G;

  return (
    <div>
      {/* ── Visual diagrams ── */}
      <div className="flex gap-4 mb-6 flex-col sm:flex-row">

        {/* Altitude cross-section */}
        <div className="flex-1 min-w-0">
          <p className="text-white/35 text-xs font-semibold tracking-widest uppercase text-center mb-2">Altitude Cross-Section</p>
          <div className="flex gap-2 h-56">
            {/* Y-axis labels */}
            <div className="flex flex-col text-right text-xs text-white/30 w-14 shrink-0 py-0.5" style={{ justifyContent: 'space-between' }}>
              <span>FL600</span>
              <span>18,000</span>
              <span>10,000</span>
              <span>1,200</span>
              <span>0 ft</span>
            </div>
            {/* Stack */}
            <div className="flex-1 relative rounded-xl overflow-hidden border border-white/10 bg-black/30">
              {/* Class A — top 63% */}
              <button
                onClick={() => setSelected('A')}
                className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${selected === 'A' ? colorMap.A.barActive : colorMap.A.bar + ' hover:bg-red-500/55'}`}
                style={{ height: '63%' }}
              >
                <span className={`font-black text-sm tracking-widest ${selected === 'A' ? 'text-red-100' : 'text-red-300/70'}`}>CLASS A</span>
              </button>

              {/* A/E divider */}
              <div className="absolute left-0 right-0 border-t border-white/20 pointer-events-none z-10" style={{ top: '63%' }}>
                <span className="absolute -top-2.5 right-2 text-white/30 text-xs">18,000</span>
              </div>

              {/* BCD indicator band inside E zone */}
              <div className="absolute left-0 right-0 pointer-events-none z-20 flex items-center justify-end pr-2" style={{ top: '77%', height: '13%' }}>
                <span className="text-xs text-white/20 italic tracking-wide">B/C/D near airports ↓</span>
              </div>

              {/* Class E — next 29% */}
              <button
                onClick={() => setSelected('E')}
                className={`absolute left-0 right-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${selected === 'E' ? colorMap.E.barActive : colorMap.E.bar + ' hover:bg-purple-500/55'}`}
                style={{ top: '63%', height: '29%' }}
              >
                <span className={`font-black text-sm tracking-widest ${selected === 'E' ? 'text-purple-100' : 'text-purple-300/70'}`}>CLASS E</span>
              </button>

              {/* E/G divider */}
              <div className="absolute left-0 right-0 border-t border-white/20 pointer-events-none z-10" style={{ top: '92%' }}>
                <span className="absolute -top-2.5 right-2 text-white/30 text-xs">1,200</span>
              </div>

              {/* Class G — bottom 8% */}
              <button
                onClick={() => setSelected('G')}
                className={`absolute bottom-0 left-0 right-0 flex items-center justify-center transition-all duration-200 cursor-pointer ${selected === 'G' ? colorMap.G.barActive : colorMap.G.bar + ' hover:bg-slate-500/55'}`}
                style={{ height: '8%' }}
              >
                <span className={`font-black text-xs tracking-widest ${selected === 'G' ? 'text-slate-100' : 'text-slate-300/70'}`}>CLASS G</span>
              </button>
            </div>
          </div>
          <p className="text-white/20 text-xs text-center mt-1.5 italic">not to scale — click zones to explore</p>
        </div>

        {/* Airport vicinity — concentric ring top-down view */}
        <div className="w-full sm:w-56 shrink-0">
          <p className="text-white/35 text-xs font-semibold tracking-widest uppercase text-center mb-2">Airport Vicinity (top-down)</p>
          <div className="relative h-56 flex items-center justify-center">
            {/* Class B — outermost */}
            <button
              onClick={() => setSelected('B')}
              title="Class B"
              className={`absolute inset-1 rounded-full border-4 transition-all duration-200 flex items-end justify-center pb-3 ${selected === 'B' ? 'border-blue-400/90 bg-blue-500/20' : 'border-blue-400/30 hover:border-blue-400/60 bg-blue-500/5'}`}
            >
              <span className={`text-xs font-black transition-colors ${selected === 'B' ? 'text-blue-200' : 'text-blue-400/50'}`}>B</span>
            </button>

            {/* Class C */}
            <button
              onClick={() => setSelected('C')}
              title="Class C"
              className={`absolute inset-8 rounded-full border-4 transition-all duration-200 flex items-end justify-center pb-2 ${selected === 'C' ? 'border-fuchsia-400/90 bg-fuchsia-500/20' : 'border-fuchsia-400/30 hover:border-fuchsia-400/60 bg-fuchsia-500/5'}`}
            >
              <span className={`text-xs font-black transition-colors ${selected === 'C' ? 'text-fuchsia-200' : 'text-fuchsia-400/50'}`}>C</span>
            </button>

            {/* Class D — dashed border */}
            <button
              onClick={() => setSelected('D')}
              title="Class D"
              style={{ borderStyle: 'dashed' }}
              className={`absolute inset-16 rounded-full border-[3px] transition-all duration-200 flex items-center justify-center ${selected === 'D' ? 'border-sky-400/90 bg-sky-500/20' : 'border-sky-400/40 hover:border-sky-400/70 bg-sky-500/5'}`}
            >
              <span className={`text-xs font-black transition-colors ${selected === 'D' ? 'text-sky-200' : 'text-sky-400/50'}`}>D</span>
            </button>

            {/* Airport center */}
            <div className="absolute inset-24 rounded-full bg-white/8 border border-white/20 flex items-center justify-center pointer-events-none">
              <span className="text-white/30 text-base">✈</span>
            </div>
          </div>
          <p className="text-white/20 text-xs text-center mt-1.5 italic">relative size — click rings to explore</p>
        </div>
      </div>

      {/* ── Class selector tabs ── */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {data.map(item => {
          const cc = colorMap[item.id] || colorMap.G;
          const isActive = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`flex-1 min-w-[3.5rem] py-2.5 px-2 rounded-xl border font-bold text-sm transition-all duration-200 text-center ${
                isActive
                  ? `bg-gradient-to-br ${cc.card} shadow-lg`
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`font-black text-xl leading-none ${isActive ? cc.text : 'text-white/40'}`}>{item.id}</div>
              <div className={`text-xs mt-0.5 ${isActive ? 'text-white/60' : 'text-white/25'}`}>
                {item.id === 'A' ? 'FL180+' : item.id === 'E' ? '1,200+' : item.id === 'G' ? 'SFC' : 'SFC'}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Detail panel ── */}
      <AnimatePresence mode="wait">
        {cls && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {/* Header card */}
            <div className={`bg-gradient-to-br ${c.card} rounded-2xl border p-5 mb-4 backdrop-blur-sm`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 flex-shrink-0 rounded-2xl border-2 flex items-center justify-center font-black text-3xl ${c.letter}`}>
                  {cls.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-white font-bold text-xl">{cls.name}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{cls.altRange}</span>
                    {!cls.vfr_permitted && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/30 text-red-200 border border-red-500/30">IFR Only</span>
                    )}
                    {cls.clearance_required && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-200 border border-orange-500/30">Clearance Required</span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 italic ${c.text}`}>{cls.tagline}</p>
                </div>
              </div>
              <p className="text-white/65 text-sm mt-4 leading-relaxed">{cls.description}</p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Shape & Dimensions */}
              <div className={`rounded-xl border ${c.sub} p-4`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${c.text}`}>Shape & Dimensions</h4>
                <p className="text-white/55 text-sm mb-3 leading-relaxed">{cls.shape}</p>
                <div className="space-y-1.5">
                  {[['Floor', cls.dimensions.floor], ['Ceiling', cls.dimensions.ceiling], ['Lateral', cls.dimensions.horizontal]].map(([label, val]) => (
                    <div key={label} className="flex gap-2 text-sm">
                      <span className="text-white/35 w-14 shrink-0 text-xs mt-0.5">{label}</span>
                      <span className="text-white/75">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entry Requirements */}
              <div className={`rounded-xl border ${c.sub} p-4`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${c.text}`}>Entry Requirements</h4>
                <div className="space-y-2">
                  {cls.entry_requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-base leading-none mt-0.5 shrink-0">{req.icon}</span>
                      <span className="text-white/70 leading-snug">{req.req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clearance & Comms */}
              <div className={`rounded-xl border ${c.sub} p-4`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${c.text}`}>Clearance & Communication</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/35 text-xs mb-1">Two-Way Comm</p>
                    <p className={`text-sm font-semibold ${cls.two_way_comm.startsWith('Required') || cls.two_way_comm.startsWith('Must') ? 'text-yellow-300/90' : 'text-green-300/80'}`}>
                      {cls.two_way_comm}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/35 text-xs mb-1">Clearance</p>
                    <p className="text-white/70 text-sm leading-snug">{cls.clearance_details}</p>
                  </div>
                  <div>
                    <p className="text-white/35 text-xs mb-1">Transponder</p>
                    <p className="text-white/70 text-sm">{cls.transponder}</p>
                  </div>
                </div>
              </div>

              {/* Weather Minimums */}
              <div className={`rounded-xl border ${c.sub} p-4`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${c.text}`}>VFR Weather Minimums</h4>
                {cls.id === 'A' ? (
                  <p className="text-white/40 text-sm italic">{cls.weather_minimums.note}</p>
                ) : cls.id === 'E' ? (
                  <div className="space-y-2">
                    <p className="text-white/35 text-xs mb-2">{cls.weather_minimums.note}</p>
                    <WeatherBlock label="Below 10,000 MSL" vis={cls.weather_minimums.below_10000.visibility} clouds={cls.weather_minimums.below_10000.cloud_clearance} />
                    <WeatherBlock label="At or above 10,000 MSL" vis={cls.weather_minimums.above_10000.visibility} clouds={cls.weather_minimums.above_10000.cloud_clearance} />
                  </div>
                ) : cls.id === 'G' ? (
                  <div className="space-y-2">
                    <p className="text-white/35 text-xs mb-2">{cls.weather_minimums.note}</p>
                    <WeatherBlock label="Day, < 1,200 AGL" vis={cls.weather_minimums.day_below_1200_agl.visibility} clouds={cls.weather_minimums.day_below_1200_agl.cloud_clearance} />
                    <WeatherBlock label="Night, < 1,200 AGL" vis={cls.weather_minimums.night_below_1200_agl.visibility} clouds={cls.weather_minimums.night_below_1200_agl.cloud_clearance} />
                    <WeatherBlock label="Day, 1,200–10,000 AGL" vis={cls.weather_minimums.day_1200_to_10000.visibility} clouds={cls.weather_minimums.day_1200_to_10000.cloud_clearance} />
                    <WeatherBlock label="Night, 1,200–10,000 AGL" vis={cls.weather_minimums.night_1200_to_10000.visibility} clouds={cls.weather_minimums.night_1200_to_10000.cloud_clearance} />
                    <WeatherBlock label="At or above 10,000 MSL" vis={cls.weather_minimums.above_10000.visibility} clouds={cls.weather_minimums.above_10000.cloud_clearance} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-white/35 text-xs mb-2">{cls.weather_minimums.note}</p>
                    <WeatherBlock vis={cls.weather_minimums.visibility} clouds={cls.weather_minimums.cloud_clearance} />
                  </div>
                )}
              </div>
            </div>

            {/* Pilot cert + Equipment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={`rounded-xl border ${c.sub} p-4`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${c.text}`}>Pilot Certificate</h4>
                <p className="text-white/75 text-sm">{cls.pilot_certificate}</p>
              </div>
              <div className={`rounded-xl border ${c.sub} p-4`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 ${c.text}`}>Required Aircraft Equipment</h4>
                <ul className="space-y-1.5">
                  {cls.aircraft_equipment.map((eq, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${c.dot}`} />
                      <span className="text-white/70">{eq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pro tip */}
            <div className={`bg-gradient-to-r ${c.card} rounded-xl border p-4 mb-8`}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-1.5">Pro Tip</p>
              <p className="text-white/70 text-sm leading-relaxed">{cls.fun_fact}</p>
              <p className={`text-xs mt-2 font-semibold ${c.text}`}>{cls.regulation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Reference Table ── */}
      <div>
        <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Quick Reference — All Classes</h3>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {['Class', 'Altitude', 'Clearance Required', '2-Way Comm', 'VFR Visibility', 'Cloud Clearance'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-white/35 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quickRef.map(row => {
                const cc = colorMap[row.id] || colorMap.G;
                const isActive = selected === row.id;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row.id)}
                    className={`cursor-pointer transition-colors duration-150 ${isActive ? cc.rowBg : 'hover:bg-white/5'}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`font-black text-lg ${cc.text}`}>{row.id}</span>
                    </td>
                    <td className="px-4 py-3 text-white/55 text-xs">{row.alt}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${
                        row.clearance === 'ATC IFR Clearance' || row.clearance === 'ATC Clearance'
                          ? 'text-red-300'
                          : row.clearance === 'None' || row.clearance === 'None (VFR)'
                          ? 'text-green-300'
                          : 'text-yellow-300'
                      }`}>
                        {row.clearance}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${row.comm === 'Required' ? 'text-yellow-300' : 'text-green-300'}`}>
                        {row.comm}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/55 text-xs">{row.vis}</td>
                    <td className="px-4 py-3 text-white/55 text-xs">{row.clouds}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-white/20 text-xs mt-2 italic">* Class E above 10,000 MSL requires 5 SM vis and 1k/1k/1SM cloud clearance.</p>
      </div>

      {/* ── VFR Weather Minimums Chart ── */}
      <div className="mt-8">
        <h3 className="text-white/20 text-xs font-bold uppercase tracking-widest mb-1">VFR Weather Minimums</h3>
        <img
          src="/static/mins.webp"
          alt="Memory aid for VFR Weather Minimums"
          className="w-full rounded-xl border border-white/10"
        />
      </div>
    </div>
  );
};

export default AirspaceView;
