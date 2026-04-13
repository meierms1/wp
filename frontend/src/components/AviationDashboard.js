import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AviationDashboard = () => {
  // Add slider styling
  const sliderStyles = `
    .slider {
      appearance: none;
      -webkit-appearance: none;
      width: 100%;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(to right, #4b5563, #4b5563);
      outline: none;
      cursor: pointer;
    }
    
    .slider::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a78bfa, #c084fc);
      cursor: pointer;
      border: 2px solid #7c3aed;
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.8);
      transition: all 0.2s;
    }
    
    .slider::-webkit-slider-thumb:hover {
      width: 32px;
      height: 32px;
      box-shadow: 0 0 20px rgba(168, 85, 247, 1);
    }
    
    .slider::-moz-range-thumb {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #a78bfa, #c084fc);
      cursor: pointer;
      border: 2px solid #7c3aed;
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.8);
      transition: all 0.2s;
    }
    
    .slider::-moz-range-thumb:hover {
      width: 32px;
      height: 32px;
      box-shadow: 0 0 20px rgba(168, 85, 247, 1);
    }
    
    .slider::-moz-range-track {
      background: transparent;
      border: none;
    }
    
    .slider::-moz-range-progress {
      background-color: #7c3aed;
      height: 32px;
      border-radius: 8px;
    }
  `;

  const [controls, setControls] = useState({
    // Power and Engine Controls
    powerLever: 50,
    mixture: 100,
    alternateAir: false,
    fuelPump: false,
    
    // Electrical
    bat1: false,
    bat2: false,
    alternator1: false,
    alternator2: false,
    avionics: false,
    
    // Fuel System
    fuelSelector: 'both',
    fuelQuantity: 75,
    volts: 28,
    
    // Ignition and Starting
    ignitionSwitch: 'off', // off, left, right, both, start
    starter: false,
    
    // Environmental
    lightsMaster: false,
    strobeLight: false,
    landingLight: false,
    navLight: false,
    cabinLight: false,
    
    // Safety
    capsArmed: false,
    fireExtinguisher: false,
    
    // Avionics
    autopilot: false,
    gps: false,
    aspen: false,
    
    // Doors and Equipment
    doorsLocked: true,
    wheelBrakes: 50,
    flaps: 'up', // up, 50, 100
  });

  const toggleButton = (key) => {
    setControls(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const setSelectValue = (key, value) => {
    setControls(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const setSliderValue = (key, value) => {
    setControls(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const ControlButton = ({ label, state, onChange, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      red: 'bg-red-600 hover:bg-red-700',
      green: 'bg-green-600 hover:bg-green-700',
      yellow: 'bg-yellow-600 hover:bg-yellow-700',
      gray: 'bg-gray-600 hover:bg-gray-700',
    };

    const offColorClasses = {
      blue: 'bg-blue-900 hover:bg-blue-800',
      red: 'bg-red-900 hover:bg-red-800',
      green: 'bg-green-900 hover:bg-green-800',
      yellow: 'bg-yellow-900 hover:bg-yellow-800',
      gray: 'bg-gray-900 hover:bg-gray-800',
    };

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onChange}
        className={`
          px-4 py-3 rounded-lg font-semibold text-white transition-all
          ${state ? colorClasses[color] : offColorClasses[color]}
          border-2 ${state ? `border-${color}-300` : `border-${color}-700`}
          shadow-lg
        `}
      >
        <div className="text-xs text-gray-200 uppercase tracking-wider">{label}</div>
        <div className="text-lg font-bold mt-1">{state ? 'ON' : 'OFF'}</div>
      </motion.button>
    );
  };

  const SelectControl = ({ label, value, options, onChange }) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  };

  const SliderControl = ({ label, value, min, max, onChange, unit = '' }) => {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{label}</label>
          <span className="text-xl font-bold text-white bg-gray-800 px-3 py-1 rounded">{value.toFixed(0)}{unit}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider w-full"
        />
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6 pt-28">
      <style>{sliderStyles}</style>
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Cirrus SR20 Flight Deck
            </h1>
            <p className="text-xl text-gray-400">Interactive aircraft control simulator</p>
          </motion.div>

          {/* Main Dashboard Grid - SR20 Cockpit Layout */}
          <div className="space-y-4">
            {/* TOP ROW - System Status & CAPS */}
            <div className="grid grid-cols-12 gap-3">
              {/* Left - System Status (Large) */}
              <motion.div variants={itemVariants} className="col-span-9">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3">System Status</h3>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="bg-gray-900/50 rounded p-2 border border-gray-700 text-center">
                      <div className="text-gray-400">Power</div>
                      <div className="text-green-400 font-bold">{controls.powerLever.toFixed(0)}%</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-2 border border-gray-700 text-center">
                      <div className="text-gray-400">Mix</div>
                      <div className="text-blue-400 font-bold">{controls.mixture.toFixed(0)}%</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-2 border border-gray-700 text-center">
                      <div className="text-gray-400">Fuel</div>
                      <div className="text-amber-400 font-bold">{controls.fuelQuantity.toFixed(0)}%</div>
                    </div>
                    <div className="bg-gray-900/50 rounded p-2 border border-gray-700 text-center">
                      <div className="text-gray-400">Volts</div>
                      <div className="text-cyan-400 font-bold">{controls.volts.toFixed(1)}V</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right - CAPS */}
              <motion.div variants={itemVariants} className="col-span-3">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-600 mr-2"></div>
                    CAPS Pin & Lever
                  </h3>
                  <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/50">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleButton('capsArmed')} className={`w-full px-3 py-2 rounded-lg font-semibold text-white transition-all ${controls.capsArmed ? 'bg-red-600 hover:bg-red-700 border-2 border-red-300' : 'bg-red-900 hover:bg-red-800 border-2 border-red-700'}`}>
                      <div className="text-xs uppercase">CAPS</div>
                      <div className="text-xs font-bold">{controls.capsArmed ? 'ARMED' : 'DISARMED'}</div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* SECOND ROW - Ignition, Switches, CAPS, AC */}
            <div className="grid grid-cols-12 gap-3">
              {/* Left - Ignition */}
              <motion.div variants={itemVariants} className="col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10 h-full">
                  <h3 className="text-xs font-bold text-white mb-2">Ignition</h3>
                  <SelectControl label="" value={controls.ignitionSwitch} options={[
                    { value: 'off', label: 'Off' },
                    { value: 'left', label: 'L' },
                    { value: 'right', label: 'R' },
                    { value: 'both', label: 'B' },
                    { value: 'start', label: 'St' }
                  ]} onChange={(val) => setSelectValue('ignitionSwitch', val)} />
                </div>
              </motion.div>

              {/* Center - Electrical & Avionics Switches */}
              <motion.div variants={itemVariants} className="col-span-6">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10 h-full">
                  <h3 className="text-xs font-bold text-white mb-2">Electrical & Avionics</h3>
                  <div className="grid grid-cols-7 gap-1">
                    <ControlButton label="BAT 1" state={controls.bat1} onChange={() => toggleButton('bat1')} color="green" />
                    <ControlButton label="BAT 2" state={controls.bat2} onChange={() => toggleButton('bat2')} color="green" />
                    <ControlButton label="ALT 1" state={controls.alternator1} onChange={() => toggleButton('alternator1')} color="blue" />
                    <ControlButton label="ALT 2" state={controls.alternator2} onChange={() => toggleButton('alternator2')} color="blue" />
                    <ControlButton label="Avionics" state={controls.avionics} onChange={() => toggleButton('avionics')} color="green" />
                    <ControlButton label="Nav" state={controls.navLight} onChange={() => toggleButton('navLight')} color="yellow" />
                    <ControlButton label="Strobe" state={controls.strobeLight} onChange={() => toggleButton('strobeLight')} color="yellow" />
                  </div>
                </div>
              </motion.div>

              {/* Center-Right - CAPS */}
              <motion.div variants={itemVariants} className="col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10 h-full">
                  <h3 className="text-xs font-bold text-white mb-2">CAPS</h3>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleButton('capsArmed')} className={`w-full px-2 py-2 rounded text-xs font-semibold text-white transition-all ${controls.capsArmed ? 'bg-red-600 hover:bg-red-700 border-2 border-red-300' : 'bg-red-900 hover:bg-red-800 border-2 border-red-700'}`}>
                    {controls.capsArmed ? 'ARMED' : 'DISARM'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Right - AC */}
              <motion.div variants={itemVariants} className="col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-3 border border-white/10 h-full">
                  <h3 className="text-xs font-bold text-white mb-2">AC</h3>
                  <ControlButton label="Power" state={controls.gps} onChange={() => toggleButton('gps')} color="green" />
                </div>
              </motion.div>
            </div>

            {/* THIRD ROW - Main Panel with MDF/Power Vertical Column */}
            <div className="grid grid-cols-12 gap-3">
              {/* Left - Yoke & Trim */}
              <motion.div variants={itemVariants} className="col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 h-full">
                  <h3 className="text-sm font-bold text-white mb-3">Yoke & Trim</h3>
                  <div className="space-y-2 text-xs text-gray-400">
                    <p>Control yoke</p>
                    <p>Trim wheel</p>
                  </div>
                </div>
              </motion.div>

              {/* Center - MDF/Power Vertical Column */}
              <motion.div variants={itemVariants} className="col-span-6">
                <div className="space-y-3 h-full">
                  {/* MDF Display */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 flex-1">
                    <h3 className="text-sm font-bold text-white mb-3">MDF - Multi Display</h3>
                    <div className="bg-slate-900 rounded-lg p-8 text-center text-gray-400 border border-white/5 h-32 flex items-center justify-center">
                      <span className="text-xs">Primary Display Area</span>
                    </div>
                  </div>
                  {/* Power Lever */}
                  <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                      Power Lever
                    </h3>
                    <SliderControl label="" value={controls.powerLever} min={0} max={100} onChange={(val) => setSliderValue('powerLever', val)} unit="%" />
                  </div>
                </div>
              </motion.div>

              {/* Right - Flaps */}
              <motion.div variants={itemVariants} className="col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 h-full">
                  <h3 className="text-sm font-bold text-white mb-3">Flaps</h3>
                  <SelectControl label="" value={controls.flaps} options={[
                    { value: 'up', label: 'Up' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]} onChange={(val) => setSelectValue('flaps', isNaN(val) ? val : Number(val))} />
                </div>
              </motion.div>

              {/* Far Right - Misc */}
              <motion.div variants={itemVariants} className="col-span-2">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 h-full">
                  <h3 className="text-xs font-bold text-white mb-2">Controls</h3>
                  <div className="space-y-2">
                    <ControlButton label="Pitot Heat" state={controls.alternateAir} onChange={() => toggleButton('alternateAir')} color="yellow" />
                    <ControlButton label="Ice Light" state={controls.fireExtinguisher} onChange={() => toggleButton('fireExtinguisher')} color="red" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* BOTTOM ROW - Mixture, Fuel & Engine Controls */}
            <div className="grid grid-cols-12 gap-3">
              {/* Left - Mixture & Fuel */}
              <motion.div variants={itemVariants} className="col-span-4">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                    Mixture & Fuel
                  </h3>
                  <div className="space-y-3">
                    <SliderControl label="Mixture" value={controls.mixture} min={0} max={100} onChange={(val) => setSliderValue('mixture', val)} unit="%" />
                    <SelectControl label="Selector" value={controls.fuelSelector} options={[
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                      { value: 'both', label: 'Both' },
                      { value: 'off', label: 'Off' }
                    ]} onChange={(val) => setSelectValue('fuelSelector', val)} />
                    <ControlButton label="Fuel Pump" state={controls.fuelPump} onChange={() => toggleButton('fuelPump')} color="blue" />
                  </div>
                </div>
              </motion.div>

              {/* Right - Engine & Systems */}
              <motion.div variants={itemVariants} className="col-span-8">
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-3">Engine & Systems</h3>
                  <div className="grid grid-cols-6 gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => toggleButton('starter')} className={`px-2 py-2 rounded text-xs font-semibold text-white transition-all ${controls.starter ? 'bg-red-600 hover:bg-red-700' : 'bg-red-900 hover:bg-red-800'}`}>
                      {controls.starter ? 'CRANK' : 'Start'}
                    </motion.button>
                    <ControlButton label="Alt Air" state={controls.alternateAir} onChange={() => toggleButton('alternateAir')} color="yellow" />
                    <ControlButton label="Doors" state={controls.doorsLocked} onChange={() => toggleButton('doorsLocked')} color="blue" />
                    <ControlButton label="Fire Ext" state={controls.fireExtinguisher} onChange={() => toggleButton('fireExtinguisher')} color="red" />
                    <ControlButton label="Master Light" state={controls.lightsMaster} onChange={() => toggleButton('lightsMaster')} color="yellow" />
                    <ControlButton label="Autopilot" state={controls.autopilot} onChange={() => toggleButton('autopilot')} color="green" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Status Panel */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">System Status</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Engine Power</div>
                <div className="text-2xl font-bold text-white">{controls.powerLever.toFixed(0)}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${controls.powerLever}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Mixture</div>
                <div className="text-2xl font-bold text-white">{controls.mixture.toFixed(0)}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                    style={{ width: `${controls.mixture}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Fuel</div>
                <div className="text-2xl font-bold text-white">{controls.fuelQuantity.toFixed(0)}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all"
                    style={{ width: `${controls.fuelQuantity}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Brakes</div>
                <div className="text-2xl font-bold text-white">{controls.wheelBrakes.toFixed(0)}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${controls.wheelBrakes}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Flaps</div>
                <div className="text-2xl font-bold text-white">{controls.flaps}°</div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Doors</div>
                <div className={`text-2xl font-bold ${controls.doorsLocked ? 'text-green-400' : 'text-red-400'}`}>
                  {controls.doorsLocked ? 'LOCKED' : 'UNLOCKED'}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AviationDashboard;
