import React, { lazy, Suspense } from 'react';

// Lazy load Plot component to reduce initial bundle size
const Plot = lazy(() => import('react-plotly.js'));

// Loading component for Plot
const PlotLoading = () => (
  <div className="flex items-center justify-center p-8 bg-white/5 rounded-lg">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mb-2"></div>
      <p className="text-white/70">Loading chart...</p>
    </div>
  </div>
);

// Wrapper component that lazy loads Plot
const LazyPlot = (props) => {
  return (
    <Suspense fallback={<PlotLoading />}>
      <Plot {...props} />
    </Suspense>
  );
};

export default LazyPlot;
