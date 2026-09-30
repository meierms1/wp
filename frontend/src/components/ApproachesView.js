import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const COLORS = {
  sky:     { grad: 'from-sky-900/60 to-sky-700/20',       border: 'border-sky-500/30',     text: 'text-sky-300',     head: 'bg-sky-900/40 text-sky-200',     dot: 'bg-sky-400',     line: 'bg-sky-400/60',     chip: 'bg-sky-500/20 border-sky-400/40 text-sky-100' },
  amber:   { grad: 'from-amber-900/60 to-amber-700/20',   border: 'border-amber-500/30',   text: 'text-amber-300',   head: 'bg-amber-900/40 text-amber-200', dot: 'bg-amber-400',   line: 'bg-amber-400/60',   chip: 'bg-amber-500/20 border-amber-400/40 text-amber-100' },
  purple:  { grad: 'from-purple-900/60 to-purple-700/20', border: 'border-purple-500/30',  text: 'text-purple-300',  head: 'bg-purple-900/40 text-purple-200', dot: 'bg-purple-400', line: 'bg-purple-400/60', chip: 'bg-purple-500/20 border-purple-400/40 text-purple-100' },
  emerald: { grad: 'from-emerald-900/60 to-emerald-700/20', border: 'border-emerald-500/30', text: 'text-emerald-300', head: 'bg-emerald-900/40 text-emerald-200', dot: 'bg-emerald-400', line: 'bg-emerald-400/60', chip: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100' },
  red:     { grad: 'from-red-900/60 to-red-700/20',       border: 'border-red-500/30',     text: 'text-red-300',     head: 'bg-red-900/40 text-red-200',     dot: 'bg-red-400',     line: 'bg-red-400/60',     chip: 'bg-red-500/20 border-red-400/40 text-red-100' },
};

const StepList = ({ items, colorClass = 'bg-white/20' }) => (
  <ol className="space-y-2">
    {items.map((it, i) => (
      <li key={i} className="relative pl-5">
        <span className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${colorClass}`} />
        <span className="text-white font-semibold text-sm">{it.step}</span>
        <p className="text-white/55 text-xs leading-relaxed mt-0.5">{it.detail}</p>
      </li>
    ))}
  </ol>
);

const ApproachesView = ({ data }) => {
  const [considerationsOpen, setConsiderationsOpen] = useState(false);

  if (!data) return null;
  const { title, source, intro, considerations, trunk, branchPrompt, types, convergence, comparisonRows, classification, downgrades } = data;

  return (
    <div>
      <div className="h-1 rounded-full mb-4 bg-gradient-to-r from-sky-500 via-purple-400 to-emerald-400 opacity-60" />

      {/* Intro */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 backdrop-blur-sm">
        <h3 className="text-white font-bold text-2xl mb-1">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{intro}</p>
        {source && <p className="text-white/30 text-xs mt-2 italic">Source: {source}</p>}
      </div>

      {/* General Considerations */}
      {considerations?.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setConsiderationsOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <span className="text-white font-semibold text-sm">General Instrument Approach Considerations</span>
            <ChevronDownIcon className={`w-4 h-4 text-white/40 transition-transform ${considerationsOpen ? 'rotate-180' : ''}`} />
          </button>
          {considerationsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="grid sm:grid-cols-2 gap-3 mt-3 overflow-hidden"
            >
              {considerations.map((c, i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-white/85 text-xs font-bold mb-1">{c.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{c.text}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* Comparison Table — differences highlighted side by side */}
      <div className="mb-8">
        <h4 className="text-white font-bold text-lg mb-3">Approach Type Comparison</h4>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white/10 text-white/70 text-xs font-semibold px-3 py-3 w-40">Attribute</th>
                {types.map(t => {
                  const c = COLORS[t.color] || COLORS.sky;
                  return (
                    <th key={t.id} className={`text-xs font-bold px-3 py-3 ${c.head}`}>
                      <span className="mr-1">{t.emoji}</span>{t.shortName}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white/[0.03]' : 'bg-white/[0.06]'}>
                  <td className="sticky left-0 bg-[#161422] text-white/70 text-xs font-semibold px-3 py-3 align-top">{row.label}</td>
                  {types.map(t => (
                    <td key={t.id} className="text-white/80 text-xs px-3 py-3 align-top leading-relaxed border-l border-white/5">
                      {row[t.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flow Diagram: common trunk -> branch split -> convergence */}
      <div>
        <h4 className="text-white font-bold text-lg mb-1">Procedure Flow</h4>
        <p className="text-white/40 text-xs mb-4">Every approach shares the same setup and inbound flow, then splits based on the type of minimums/guidance, and reconverges at the landing decision.</p>

        {/* Trunk */}
        <div className="max-w-xl mx-auto mb-2">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-white/40 text-[11px] uppercase tracking-widest font-semibold mb-2">Common to All Approaches</p>
            <StepList items={trunk} colorClass="bg-white/40" />
          </div>
        </div>

        {/* Connector: trunk -> branch bar */}
        <div className="flex justify-center">
          <div className="w-px h-6 bg-white/25" />
        </div>
        {branchPrompt && (
          <p className="text-center text-white/40 text-xs italic mb-1 max-w-xl mx-auto">{branchPrompt}</p>
        )}
        <div className="relative h-6 max-w-4xl mx-auto mb-1">
          <div className="absolute left-[12.5%] right-[12.5%] top-0 h-px bg-white/25" />
          <div className="grid grid-cols-4 h-full">
            {types.map(t => {
              const c = COLORS[t.color] || COLORS.sky;
              return <div key={t.id} className={`mx-auto w-px h-full ${c.line}`} />;
            })}
          </div>
        </div>

        {/* Branch columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
          {types.map(t => {
            const c = COLORS[t.color] || COLORS.sky;
            return (
              <div key={t.id} className={`bg-gradient-to-br ${c.grad} rounded-2xl border ${c.border} p-4 flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg leading-none">{t.emoji}</span>
                  <span className={`font-bold text-sm ${c.text}`}>{t.shortName}</span>
                </div>
                <p className="text-white/40 text-[11px] mb-3">{t.tagline}</p>
                <StepList items={t.steps} colorClass={c.dot} />
              </div>
            );
          })}
        </div>

        {/* Connector: branch bar -> convergence */}
        <div className="relative h-6 max-w-4xl mx-auto mb-1">
          <div className="absolute left-[12.5%] right-[12.5%] bottom-0 h-px bg-white/25" />
          <div className="grid grid-cols-4 h-full">
            {types.map(t => {
              const c = COLORS[t.color] || COLORS.sky;
              return <div key={t.id} className={`mx-auto w-px h-full ${c.line}`} />;
            })}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-px h-6 bg-white/25" />
        </div>

        {/* Convergence */}
        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-white/40 text-[11px] uppercase tracking-widest font-semibold mb-2">Common Landing Decision</p>
            <StepList items={convergence} colorClass="bg-white/40" />
          </div>
        </div>
      </div>

      {/* ICAO Annex 10 Classification */}
      {classification && (
        <div className="mt-10">
          <h4 className="text-white font-bold text-lg mb-1">{classification.title}</h4>
          <p className="text-white/40 text-xs mb-4 max-w-3xl">{classification.intro}</p>

          <div className="grid gap-3 md:grid-cols-3 mb-8">
            {classification.categories.map(cat => {
              const c = COLORS[cat.color] || COLORS.sky;
              return (
                <div key={cat.id} className={`bg-gradient-to-br ${c.grad} rounded-2xl border ${c.border} p-4 flex flex-col`}>
                  <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border mb-2 ${c.chip}`}>{cat.id.toUpperCase()}</span>
                  <h5 className="text-white font-bold text-base leading-tight mb-1">{cat.name}</h5>
                  <p className={`text-xs font-semibold mb-2 ${c.text}`}>{cat.examples}</p>
                  <p className="text-white/40 text-[11px] font-semibold mb-1">Minimums: <span className="text-white/70 font-normal">{cat.minimum}</span></p>
                  <p className="text-white/55 text-xs leading-relaxed mb-2">{cat.description}</p>
                  <p className="text-white/40 text-[11px] font-semibold mt-auto pt-2 border-t border-white/10">Descend below minimums? <span className="text-white/70 font-normal block mt-0.5">{cat.descendBelow}</span></p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Downgrade Paths */}
      {downgrades?.length > 0 && (
        <div>
          <h4 className="text-white font-bold text-lg mb-1">Approach Downgrades by Failure</h4>
          <p className="text-white/40 text-xs mb-4 max-w-3xl">Equipment or signal failures can force a reversion to a lower level of service mid-approach. Knowing the downgrade path ahead of time keeps the transition from being a surprise.</p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-white/10">
                  <th className="text-white/70 text-xs font-semibold px-3 py-3 w-1/4">Failure</th>
                  <th className="text-red-200 text-xs font-semibold px-3 py-3 w-1/6">From</th>
                  <th className="text-emerald-200 text-xs font-semibold px-3 py-3 w-1/6">Downgrades To</th>
                  <th className="text-white/70 text-xs font-semibold px-3 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {downgrades.map((d, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white/[0.03]' : 'bg-white/[0.06]'}>
                    <td className="text-white/85 text-xs font-semibold px-3 py-3 align-top">{d.failure}</td>
                    <td className="text-white/60 text-xs px-3 py-3 align-top border-l border-white/5">{d.from}</td>
                    <td className="text-white/60 text-xs px-3 py-3 align-top border-l border-white/5">{d.to}</td>
                    <td className="text-white/45 text-xs px-3 py-3 align-top leading-relaxed border-l border-white/5">{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproachesView;
