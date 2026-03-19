import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  CalculatorIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SR20 = () => {
  const [activeTab, setActiveTab] = useState('sr20');

  const [sr20Form, setsr20Form] = useState({
    pressure_value: '',
    temperature_value: '',
    unit: 'C'
  });

  const [sr20aform, setsr20aForm] = useState({
    empty_weight: '',
    empty_weight_cg: '',
    front_seat: '',
    front_seat_cg: '',
    rear_seat: '',
    rear_seat_cg: '',
    baggage: '',
    baggage_cg: '',
    fuel: '',
    fuel_cg: '',
    burn: '',
    runup: '',
    pressure_value: '',
    temperature_value: '',
    altimeter_value: '',
    elevation_value: '',
    unit: 'C'
  });

  const [sr20Result, setSR20Result] = useState(null);
  const [sr20aResult, setSR20aResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSR20 = async (e) => {
    e.preventDefault();
    const { pressure_value, temperature_value } = sr20Form;
    if (pressure_value === '' || temperature_value === '') {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        pressure: parseFloat(pressure_value),
        temperature: parseFloat(temperature_value),
        unit: sr20Form.unit === 'F'
      };
      const response = await axios.post('/api/calculator/sr20-interpolator', payload);
      if (response.data.success) {
        setSR20Result(response.data.interpolated_value);
        toast.success('SR20 interpolation successful!');
      } else {
        toast.error(response.data.message || 'SR20 interpolation failed');
      }
    } catch (error) {
      toast.error('SR20 interpolation failed');
      console.error('SR20 interpolation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSR20Advanced = async (e) => {
    e.preventDefault();
    const required = ['empty_weight', 'empty_weight_cg', 'front_seat', 'front_seat_cg',
      'fuel', 'fuel_cg', 'burn', 'temperature_value',
      'altimeter_value', 'elevation_value'];
    for (const k of required) {
      if (sr20aform[k] === '') {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    try {
      setLoading(true);
      setSR20aResult(null);
      const payload = {
        empty_weight:      parseFloat(sr20aform.empty_weight),
        empty_weight_cg:   parseFloat(sr20aform.empty_weight_cg),
        front_seat:        parseFloat(sr20aform.front_seat),
        front_seat_cg:     parseFloat(sr20aform.front_seat_cg),
        rear_seat:         sr20aform.rear_seat      !== '' ? parseFloat(sr20aform.rear_seat)      : 0,
        rear_seat_cg:      sr20aform.rear_seat_cg   !== '' ? parseFloat(sr20aform.rear_seat_cg)   : 0,
        baggage:           sr20aform.baggage         !== '' ? parseFloat(sr20aform.baggage)         : 0,
        baggage_cg:        sr20aform.baggage_cg      !== '' ? parseFloat(sr20aform.baggage_cg)      : 0,
        fuel:              parseFloat(sr20aform.fuel),
        fuel_cg:           parseFloat(sr20aform.fuel_cg),
        burn:              parseFloat(sr20aform.burn),
        runup:             sr20aform.runup !== '' ? parseFloat(sr20aform.runup) : 0,
        temperature_value: parseFloat(sr20aform.temperature_value),
        altimeter_value:   parseFloat(sr20aform.altimeter_value),
        elevation_value:   parseFloat(sr20aform.elevation_value),
        unit:              sr20aform.unit === 'F'
      };
      const response = await axios.post('/api/calculator/sr20-advanced', payload);
      if (response.data.success) {
        setSR20aResult(response.data.result);
        toast.success('SR20 advanced computation successful!');
      } else {
        toast.error(response.data.message || 'SR20 advanced computation failed');
      }
    } catch (error) {
      toast.error('SR20 advanced computation failed');
      console.error('SR20 advanced error:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent mb-6">
              SR20 Tools
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cirrus SR20 performance interpolation and full weight &amp; balance calculator.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10">
              {[
                { id: 'sr20',  label: 'SR20 Performance', icon: CalculatorIcon },
                { id: 'sr20a', label: 'SR20 Advanced',     icon: CalculatorIcon }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-8 py-4 mx-1 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-6 h-6 mr-3" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* SR20 Performance Tab */}
            {activeTab === 'sr20' && (
              <motion.div
                key="sr20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-4xl mx-auto"
              >
                <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <CalculatorIcon className="w-8 h-8 text-purple-400 mr-4" />
                    <h2 className="text-3xl font-bold text-white">SR20 Performance Interpolator</h2>
                  </div>
                  <p className="text-gray-400 mb-6 text-sm">
                    Bilinear interpolation of the Cirrus SR20 POH performance tables. Pressure altitude: 0–10,000 ft. Temperature: 0–50 °C (or equivalent °F).
                  </p>

                  <form onSubmit={handleSR20} className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Pressure Altitude (ft)</label>
                        <input
                          type="number" step="any" placeholder="e.g. 2500"
                          value={sr20Form.pressure_value}
                          onChange={(e) => setsr20Form({ ...sr20Form, pressure_value: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Temperature</label>
                        <input
                          type="number" step="any" placeholder={sr20Form.unit === 'F' ? 'e.g. 86' : 'e.g. 30'}
                          value={sr20Form.temperature_value}
                          onChange={(e) => setsr20Form({ ...sr20Form, temperature_value: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Temperature Unit</label>
                        <div className="flex">
                          {['C', 'F'].map((u) => (
                            <button
                              key={u} type="button"
                              onClick={() => setsr20Form({ ...sr20Form, unit: u })}
                              className={`flex-1 py-3 font-semibold rounded-lg transition-all duration-200 ${
                                sr20Form.unit === u
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
                              } ${u === 'C' ? 'mr-2' : ''}`}
                            >
                              °{u}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <><CalculatorIcon className="w-6 h-6 mr-2" />Interpolate</>
                      )}
                    </motion.button>
                  </form>

                  {sr20Result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                      <h3 className="text-xl font-bold text-white mb-4">Interpolated Performance (ft)</h3>
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full text-left bg-white/90 rounded-lg text-black">
                          <thead>
                            <tr className="bg-purple-200">
                              <th className="px-4 py-2">Phase</th>
                              <th className="px-4 py-2">Distance (ft)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-2">Takeoff Roll</td>
                              <td className="px-4 py-2 font-semibold">{Math.round(sr20Result.takeoff_roll)}</td>
                            </tr>
                            <tr className="bg-gray-100">
                              <td className="px-4 py-2">Takeoff over 50 ft Obstacle</td>
                              <td className="px-4 py-2 font-semibold">{Math.round(sr20Result.takeoff_obs)}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Landing Roll</td>
                              <td className="px-4 py-2 font-semibold">{Math.round(sr20Result.landing_roll)}</td>
                            </tr>
                            <tr className="bg-gray-100">
                              <td className="px-4 py-2">Landing over 50 ft Obstacle</td>
                              <td className="px-4 py-2 font-semibold">{Math.round(sr20Result.landing_obs)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-gray-400 text-xs mt-3">
                        Values interpolated at {sr20Form.pressure_value} ft / {sr20Form.temperature_value} °{sr20Form.unit || 'C'}. Source: Cirrus SR20 POH performance tables.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* SR20 Advanced Tab */}
            {activeTab === 'sr20a' && (
              <motion.div
                key="sr20a"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-5xl mx-auto"
              >
                <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <CalculatorIcon className="w-8 h-8 text-purple-400 mr-4" />
                    <h2 className="text-3xl font-bold text-white">SR20 Advanced — W&B &amp; Performance</h2>
                  </div>
                  <p className="text-gray-400 mb-8 text-sm">
                    Full weight &amp; balance, conditions, and interpolated performance for the Cirrus SR20.
                    Weights in lbs, arms in inches, fuel in gallons, altimeter in inHg.
                  </p>

                  <form onSubmit={handleSR20Advanced} className="space-y-8">

                    {/* Weight & Balance Inputs */}
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">Weight &amp; Balance</h3>
                      <div className="grid md:grid-cols-2 gap-4">

                        {/* Empty weight */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Empty Weight (lb)</label>
                            <input type="number" step="any" placeholder="e.g. 2065"
                              value={sr20aform.empty_weight}
                              onChange={(e) => setsr20aForm({ ...sr20aform, empty_weight: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Empty CG (in)</label>
                            <input type="number" step="any" placeholder="e.g. 143.5"
                              value={sr20aform.empty_weight_cg}
                              onChange={(e) => setsr20aForm({ ...sr20aform, empty_weight_cg: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required />
                          </div>
                        </div>

                        {/* Front seat */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Front Seats (lb)</label>
                            <input type="number" step="any" placeholder="e.g. 340"
                              value={sr20aform.front_seat}
                              onChange={(e) => setsr20aForm({ ...sr20aform, front_seat: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Front Seats CG (in)</label>
                            <input type="number" step="any" placeholder="e.g. 143.0"
                              value={sr20aform.front_seat_cg}
                              onChange={(e) => setsr20aForm({ ...sr20aform, front_seat_cg: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required />
                          </div>
                        </div>

                        {/* Rear seat */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Rear Seats (lb)</label>
                            <input type="number" step="any" placeholder="0"
                              value={sr20aform.rear_seat}
                              onChange={(e) => setsr20aForm({ ...sr20aform, rear_seat: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Rear Seats CG (in)</label>
                            <input type="number" step="any" placeholder="e.g. 179.0"
                              value={sr20aform.rear_seat_cg}
                              onChange={(e) => setsr20aForm({ ...sr20aform, rear_seat_cg: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          </div>
                        </div>

                        {/* Baggage */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Baggage (lb)</label>
                            <input type="number" step="any" placeholder="0"
                              value={sr20aform.baggage}
                              onChange={(e) => setsr20aForm({ ...sr20aform, baggage: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Baggage CG (in)</label>
                            <input type="number" step="any" placeholder="e.g. 208.0"
                              value={sr20aform.baggage_cg}
                              onChange={(e) => setsr20aForm({ ...sr20aform, baggage_cg: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          </div>
                        </div>

                        {/* Fuel */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Fuel (gal)</label>
                            <input type="number" step="any" placeholder="e.g. 56"
                              value={sr20aform.fuel}
                              onChange={(e) => setsr20aForm({ ...sr20aform, fuel: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Fuel CG (in)</label>
                            <input type="number" step="any" placeholder="e.g. 151.5"
                              value={sr20aform.fuel_cg}
                              onChange={(e) => setsr20aForm({ ...sr20aform, fuel_cg: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required />
                          </div>
                        </div>

                        {/* Burn & Runup */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Fuel Burn (gal)</label>
                            <input type="number" step="any" placeholder="e.g. 8.5"
                              value={sr20aform.burn}
                              onChange={(e) => setsr20aForm({ ...sr20aform, burn: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required />
                          </div>
                          <div>
                            <label className="block text-gray-300 mb-1 text-sm font-medium">Run-up Burn (gal)</label>
                            <input type="number" step="any" placeholder="e.g. 0.5"
                              value={sr20aform.runup}
                              onChange={(e) => setsr20aForm({ ...sr20aform, runup: e.target.value })}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Conditions Inputs */}
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300 mb-4">Conditions</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-1 text-sm font-medium">Temperature</label>
                          <input type="number" step="any" placeholder={sr20aform.unit === 'F' ? 'e.g. 86' : 'e.g. 30'}
                            value={sr20aform.temperature_value}
                            onChange={(e) => setsr20aForm({ ...sr20aform, temperature_value: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1 text-sm font-medium">Temp Unit</label>
                          <div className="flex">
                            {['C', 'F'].map((u) => (
                              <button key={u} type="button"
                                onClick={() => setsr20aForm({ ...sr20aform, unit: u })}
                                className={`flex-1 py-3 font-semibold rounded-lg transition-all duration-200 ${
                                  sr20aform.unit === u
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                } ${u === 'C' ? 'mr-2' : ''}`}>
                                °{u}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1 text-sm font-medium">Altimeter (inHg)</label>
                          <input type="number" step="any" placeholder="e.g. 29.92"
                            value={sr20aform.altimeter_value}
                            onChange={(e) => setsr20aForm({ ...sr20aform, altimeter_value: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1 text-sm font-medium">Field Elevation (ft)</label>
                          <input type="number" step="any" placeholder="e.g. 500"
                            value={sr20aform.elevation_value}
                            onChange={(e) => setsr20aForm({ ...sr20aform, elevation_value: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required />
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <><CalculatorIcon className="w-6 h-6 mr-2" />Compute</>
                      )}
                    </motion.button>
                  </form>

                  {sr20aResult && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10 space-y-8">

                      {/* Weight & Balance Table */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Weight &amp; Balance</h3>
                        <div className="overflow-x-auto">
                          <table className="table-auto w-full bg-white/90 rounded-lg text-black text-sm">
                            <thead>
                              <tr className="bg-purple-200">
                                <th className="px-4 py-2 text-left">Item</th>
                                <th className="px-4 py-2 text-right">Weight (lb)</th>
                                <th className="px-4 py-2 text-right">Arm (in)</th>
                                <th className="px-4 py-2 text-right">Moment (lb·in)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sr20aResult.wb.rows.map((row, i) => (
                                <tr key={i} className={row.subtotal ? 'bg-purple-100 font-bold border-t-2 border-purple-300' : i % 2 === 0 ? '' : 'bg-gray-100'}>
                                  <td className="px-4 py-2">{row.name}</td>
                                  <td className="px-4 py-2 text-right">{row.weight.toFixed(1)}</td>
                                  <td className="px-4 py-2 text-right">{row.arm.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-right">{row.moment.toFixed(0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Conditions Table */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Conditions</h3>
                        <div className="overflow-x-auto">
                          <table className="table-auto w-full bg-white/90 rounded-lg text-black text-sm">
                            <thead>
                              <tr className="bg-purple-200">
                                <th className="px-4 py-2 text-left">Parameter</th>
                                <th className="px-4 py-2 text-right">Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-2">OAT</td>
                                <td className="px-4 py-2 text-right">{sr20aResult.conditions.oat_c.toFixed(1)} °C / {sr20aResult.conditions.oat_f.toFixed(1)} °F</td>
                              </tr>
                              <tr className="bg-gray-100">
                                <td className="px-4 py-2">Altimeter Setting</td>
                                <td className="px-4 py-2 text-right">{sr20aResult.conditions.altimeter.toFixed(2)} inHg</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2">Field Elevation</td>
                                <td className="px-4 py-2 text-right">{sr20aResult.conditions.elevation.toFixed(0)} ft</td>
                              </tr>
                              <tr className="bg-gray-100">
                                <td className="px-4 py-2">Pressure Altitude</td>
                                <td className="px-4 py-2 text-right font-semibold">{sr20aResult.conditions.pressure_alt.toFixed(0)} ft</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2">Density Altitude</td>
                                <td className="px-4 py-2 text-right font-semibold">{sr20aResult.conditions.density_alt.toFixed(0)} ft</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Performance Speeds */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Performance Speeds (KIAS)</h3>
                        <div className="overflow-x-auto">
                          <table className="table-auto w-full bg-white/90 rounded-lg text-black text-sm">
                            <thead>
                              <tr className="bg-purple-200">
                                <th className="px-4 py-2 text-left">Speed</th>
                                <th className="px-4 py-2 text-right">At Takeoff Wt</th>
                                <th className="px-4 py-2 text-right">At Landing Wt</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-2">Vso (Stall, Landing Config)</td>
                                <td className="px-4 py-2 text-right font-semibold">{Math.round(sr20aResult.speeds.vso_takeoff)}</td>
                                <td className="px-4 py-2 text-right font-semibold">{Math.round(sr20aResult.speeds.vso_landing)}</td>
                              </tr>
                              <tr className="bg-gray-100">
                                <td className="px-4 py-2">Va (Maneuvering Speed)</td>
                                <td className="px-4 py-2 text-right font-semibold">{Math.round(sr20aResult.speeds.va_takeoff)}</td>
                                <td className="px-4 py-2 text-right font-semibold">{Math.round(sr20aResult.speeds.va_landing)}</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2">Vbg (Best Glide)</td>
                                <td className="px-4 py-2 text-right font-semibold">{Math.round(sr20aResult.speeds.vbg_takeoff)}</td>
                                <td className="px-4 py-2 text-right font-semibold">{Math.round(sr20aResult.speeds.vbg_landing)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Performance Table */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Performance (ft)</h3>
                        <div className="overflow-x-auto">
                          <table className="table-auto w-full bg-white/90 rounded-lg text-black text-sm">
                            <thead>
                              <tr className="bg-purple-200">
                                <th className="px-4 py-2 text-left">Phase</th>
                                <th className="px-4 py-2 text-right">Distance (ft)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-4 py-2">Takeoff Roll</td>
                                <td className="px-4 py-2 text-right font-bold text-purple-700">{Math.round(sr20aResult.performance.takeoff_roll)}</td>
                              </tr>
                              <tr className="bg-gray-100">
                                <td className="px-4 py-2">Takeoff over 50 ft Obstacle</td>
                                <td className="px-4 py-2 text-right font-bold text-purple-700">{Math.round(sr20aResult.performance.takeoff_obs)}</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2">Landing Roll</td>
                                <td className="px-4 py-2 text-right font-bold text-purple-700">{Math.round(sr20aResult.performance.landing_roll)}</td>
                              </tr>
                              <tr className="bg-gray-100">
                                <td className="px-4 py-2">Landing over 50 ft Obstacle</td>
                                <td className="px-4 py-2 text-right font-bold text-purple-700">{Math.round(sr20aResult.performance.landing_obs)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className="text-gray-400 text-xs mt-3">
                          Takeoff interpolated at {sr20aResult.wb.takeoff_weight.toFixed(1)} lb /
                          {' '}{sr20aResult.conditions.pressure_alt.toFixed(0)} ft PA /
                          {' '}{sr20aResult.conditions.oat_c.toFixed(1)} °C.
                          Landing at max gross. Source: Cirrus SR20 POH.
                        </p>
                      </div>

                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SR20;
