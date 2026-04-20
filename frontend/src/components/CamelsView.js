import React from 'react';
import { motion } from 'framer-motion';

const CELL_COLORS = {
  amber:   { bg: 'bg-amber-500/20',   border: 'border-amber-400/30',   text: 'text-amber-100'   },
  orange:  { bg: 'bg-orange-500/20',  border: 'border-orange-400/30',  text: 'text-orange-100'  },
  slate:   { bg: 'bg-slate-500/25',   border: 'border-slate-400/30',   text: 'text-slate-200'   },
  emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-400/30', text: 'text-emerald-100' },
  red:     { bg: 'bg-red-500/20',     border: 'border-red-400/30',     text: 'text-red-100'     },
  rose:    { bg: 'bg-rose-500/20',    border: 'border-rose-400/30',    text: 'text-rose-100'    },
  cyan:    { bg: 'bg-cyan-500/20',    border: 'border-cyan-400/30',    text: 'text-cyan-100'    },
  purple:  { bg: 'bg-purple-500/20',  border: 'border-purple-400/30',  text: 'text-purple-100'  },
  blue:    { bg: 'bg-blue-500/20',    border: 'border-blue-400/30',    text: 'text-blue-100'    },
  sky:     { bg: 'bg-sky-500/20',     border: 'border-sky-400/30',     text: 'text-sky-100'     },
  green:   { bg: 'bg-green-500/20',   border: 'border-green-400/30',   text: 'text-green-100'   },
  indigo:  { bg: 'bg-indigo-500/15',  border: 'border-indigo-400/20',  text: 'text-indigo-200'  },
};

const LETTER_COLORS = [
  'text-amber-300',
  'text-orange-300',
  'text-sky-300',
  'text-emerald-300',
  'text-rose-300',
  'text-indigo-300',
];

const GROUP_STYLE = {
  stall:      { bg: 'bg-blue-500/10',   text: 'text-blue-300'   },
  maneuver:   { bg: 'bg-purple-500/10', text: 'text-purple-300' },
  ground_ref: { bg: 'bg-green-500/10',  text: 'text-green-300'  },
};

const CamelsView = ({ data }) => {
  if (!data) return null;

  const { maneuvers, rows, groupLabels } = data;

  // Build colspan spans for group header row
  const groupSpans = [];
  let currentGroup = null;
  let span = 0;
  for (const m of maneuvers) {
    if (m.group !== currentGroup) {
      if (currentGroup !== null) groupSpans.push({ group: currentGroup, span });
      currentGroup = m.group;
      span = 1;
    } else {
      span++;
    }
  }
  if (currentGroup) groupSpans.push({ group: currentGroup, span });

  return (
    <div>
      {/* CAMELS letter tiles */}
      <div className="flex flex-wrap gap-3 mb-5">
        {rows.map((row, i) => (
          <motion.div
            key={row.letter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-13 h-13 w-12 h-12 flex items-center justify-center rounded-xl font-black text-2xl border border-white/15 bg-white/5 ${LETTER_COLORS[i]}`}>
              {row.letter}
            </div>
            <span className="text-white/40 text-xs font-semibold tracking-wide">{row.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Context callout */}
      <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-xl px-4 py-2.5 mb-6 text-xs text-white/50 leading-relaxed">
        ⚡ <span className="text-yellow-300/80 font-semibold">Power On Stall</span> simulates a takeoff scenario ·{' '}
        <span className="text-yellow-300/80 font-semibold">Power Off Stall</span> simulates a landing scenario ·{' '}
        Cells sharing the same color within a row have <span className="text-white/70">identical requirements</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full border-collapse" style={{ minWidth: '700px' }}>
          <thead>
            {/* Group header row */}
            <tr>
              <th
                className="px-4 py-3 text-left bg-black/50 sticky left-0 z-20 border-r border-white/10 border-b border-white/10"
                rowSpan={2}
              >
                <span className="text-white/20 text-xs font-bold uppercase tracking-widest">C·A·M·E·L·S</span>
              </th>
              {groupSpans.map(({ group, span: s }, gi) => {
                const gs = GROUP_STYLE[group] || GROUP_STYLE.maneuver;
                return (
                  <th
                    key={group}
                    colSpan={s}
                    className={`py-2 text-center text-xs font-bold uppercase tracking-wider border-b border-white/10 ${gi < groupSpans.length - 1 ? 'border-r border-white/10' : ''} ${gs.bg} ${gs.text}`}
                  >
                    {groupLabels[group]}
                  </th>
                );
              })}
            </tr>

            {/* Maneuver name row */}
            <tr className="border-b border-white/10">
              {maneuvers.map((m, i) => (
                <th
                  key={m.id}
                  className={`px-3 py-3 text-center bg-white/5 ${i < maneuvers.length - 1 ? 'border-r border-white/5' : ''}`}
                >
                  <div className="text-white/75 font-bold text-xs whitespace-nowrap">{m.name}</div>
                  <div className="text-white/30 text-xs font-normal mt-0.5">{m.emoji} {m.context}</div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.letter}
                className="border-b border-white/5 last:border-b-0 hover:brightness-110 transition-all duration-150"
              >
                {/* Sticky label cell */}
                <td className="px-4 py-4 bg-black/50 sticky left-0 z-10 border-r border-white/10 min-w-[130px]">
                  <div className={`font-black text-xl leading-none mb-1 ${LETTER_COLORS[ri]}`}>{row.letter}</div>
                  <div className="text-white/60 text-xs font-semibold">{row.label}</div>
                  <div className="text-white/25 text-xs mt-0.5 leading-tight">{row.description}</div>
                </td>

                {/* Value cells */}
                {row.cells.map((cell, ci) => {
                  const colorName = row.groupColors[String(cell.group)];
                  const c = CELL_COLORS[colorName] || CELL_COLORS.indigo;
                  return (
                    <td
                      key={cell.maneuver}
                      className={`px-3 py-4 text-center text-xs font-semibold leading-snug ${ci < row.cells.length - 1 ? 'border-r border-white/5' : ''} ${c.bg} ${c.text}`}
                    >
                      {cell.value.split('\n').map((line, li) => (
                        <div key={li}>{line}</div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-white/20 text-xs mt-3 italic text-center">
        Same color within a row = identical requirement · differences reveal what makes each maneuver unique
      </p>
    </div>
  );
};

export default CamelsView;
