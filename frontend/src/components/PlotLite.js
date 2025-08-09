// Lightweight wrapper for plotly charts with dynamic import of only required modules
// Further optimization could build a custom bundle, but this lazy component already splits code.
import React from 'react';
import Plot from 'react-plotly.js';

const PlotLite = (props) => {
  return <Plot {...props} />;
};

export default PlotLite;
