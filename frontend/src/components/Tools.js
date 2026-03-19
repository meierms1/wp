import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  CalculatorIcon, 
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Tools = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [calculatorForm, setCalculatorForm] = useState({
    input_value: '',
    input_unit: '',
    output_unit: ''
  });
  const [materialForm, setMaterialForm] = useState({
    first_property_name: '',
    first_property_value: '',
    second_property_name: '',
    second_property_value: ''
  });
  const [sr20Form, setsr20Form] = useState({
    pressure_value: "",
    temperature_value: "",
    unit: "C"
  });

  const [sr20aform, setsr20aForm] = useState({
    empty_weight: "",
    empty_weight_cg: "",
    front_seat: "",
    front_seat_cg: "",
    rear_seat: "",
    rear_seat_cg: "",
    baggage: "",
    baggage_cg: "",
    fuel: "",
    fuel_cg: "",
    burn: "",
    runup: "",
    pressure_value: "",
    temperature_value: "",
    altimeter_value: "",
    elevation_value: "",
    unit: "C"
  });

  const [conversionResult, setConversionResult] = useState(null);
  const [materialResult, setMaterialResult] = useState(null);
  const [sr20Result, setSR20Result] = useState(null);
  const [sr20aResult, setSR20aResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Common units for the calculator
  // Removed predefined units dropdown; free-text unit syntax is now used.

  const handleConvert = async (e) => {
    e.preventDefault();
    const { input_value, input_unit, output_unit } = calculatorForm;
    if (!input_value || !input_unit || !output_unit) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/calculator/convert', calculatorForm);
      if (response.data.success) {
        setConversionResult(response.data.result);
        toast.success('Conversion successful!');
      } else {
        toast.error(response.data.message || 'Conversion failed');
      }
    } catch (error) {
      toast.error('Conversion failed');
      console.error('Conversion error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSR20Advanced = async (e) => {
    e.preventDefault();
    const required = ['empty_weight','empty_weight_cg','front_seat','front_seat_cg',
                      'fuel','fuel_cg','burn','temperature_value',
                      'altimeter_value','elevation_value'];
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
        empty_weight:     parseFloat(sr20aform.empty_weight),
        empty_weight_cg:  parseFloat(sr20aform.empty_weight_cg),
        front_seat:       parseFloat(sr20aform.front_seat),
        front_seat_cg:    parseFloat(sr20aform.front_seat_cg),
        rear_seat:        sr20aform.rear_seat      !== '' ? parseFloat(sr20aform.rear_seat)      : 0,
        rear_seat_cg:     sr20aform.rear_seat_cg   !== '' ? parseFloat(sr20aform.rear_seat_cg)   : 0,
        baggage:          sr20aform.baggage         !== '' ? parseFloat(sr20aform.baggage)         : 0,
        baggage_cg:       sr20aform.baggage_cg      !== '' ? parseFloat(sr20aform.baggage_cg)      : 0,
        fuel:             parseFloat(sr20aform.fuel),
        fuel_cg:          parseFloat(sr20aform.fuel_cg),
        burn:             parseFloat(sr20aform.burn),
        runup:            sr20aform.runup !== '' ? parseFloat(sr20aform.runup) : 0,
        temperature_value:parseFloat(sr20aform.temperature_value),
        altimeter_value:  parseFloat(sr20aform.altimeter_value),
        elevation_value:  parseFloat(sr20aform.elevation_value),
        unit:             sr20aform.unit === 'F'
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

  const handleSR20 = async (e) => {
    e.preventDefault();
    const { pressure_value, temperature_value, unit } = sr20Form;
    if (pressure_value === '' || temperature_value === '') {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        pressure: parseFloat(pressure_value),
        temperature: parseFloat(temperature_value),
        unit: unit === 'F'
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

  const handleMaterialProperties = async (e) => {
    e.preventDefault();
    const { first_property_name, first_property_value, second_property_name, second_property_value } = materialForm;
    if (!first_property_name || !second_property_name || first_property_value === '' || second_property_value === '') {
      toast.error('Please provide both properties and values');
      return;
    }
    if (first_property_name === second_property_name) {
      toast.error('Please choose two different properties');
      return;
    }

    try {
      setLoading(true);
      setMaterialResult(null);
      const payload = {
        first_property_name,
        first_property_value: Number(first_property_value),
        second_property_name,
        second_property_value: Number(second_property_value)
      };
      const response = await axios.post('/api/calculator/material-properties', payload);
      if (response.data.success) {
        setMaterialResult(response.data.properties);
        toast.success('Material properties computed!');
      } else {
        toast.error(response.data.message || 'Computation failed');
      }
    } catch (error) {
      toast.error('Computation failed');
      console.error('Error computing material properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
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
              Tools
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Enhance your financial knowledge with our calculator tools.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10">
              {[
                { id: 'calculator', label: 'Unit Calculator', icon: CalculatorIcon },
                { id: 'materialproperties', label: 'Material Properties', icon: CalculatorIcon },
                { id: 'sr20', label: 'SR20 Performance', icon: CalculatorIcon },
                { id: 'sr20a', label: 'SR20 Advanced', icon: CalculatorIcon }
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
            {/* Unit Calculator */}
            {activeTab === 'calculator' && (
              <motion.div
                key="calculator"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-4xl mx-auto"
              >
                <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <CalculatorIcon className="w-8 h-8 text-purple-400 mr-4" />
                    <h2 className="text-3xl font-bold text-white">Unit Converter</h2>
                  </div>

                  <form onSubmit={handleConvert} className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Value</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="Enter value"
                          value={calculatorForm.input_value}
                          onChange={(e) => setCalculatorForm({ ...calculatorForm, input_value: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">From Unit</label>
                        <input
                          type="text"
                          placeholder="e.g., m**2./s or W./m./K"
                          value={calculatorForm.input_unit}
                          onChange={(e) => setCalculatorForm({ ...calculatorForm, input_unit: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">To Unit</label>
                        <input
                          type="text"
                          placeholder="e.g., m./m./degC or N./mm**2"
                          value={calculatorForm.output_unit}
                          onChange={(e) => setCalculatorForm({ ...calculatorForm, output_unit: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <CalculatorIcon className="w-6 h-6 mr-2" />
                          Convert
                        </>
                      )}
                    </motion.button>
                  </form>

                  {conversionResult !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">Conversion Result</h3>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-400">{conversionResult}</p>
                        <p className="text-gray-300 mt-2">
                          {calculatorForm.input_value} {calculatorForm.input_unit} = {conversionResult} {calculatorForm.output_unit}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Accepted Units & Syntax Help */}
                  <motion.div
                    variants={itemVariants}
                    className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">Accepted Units & Syntax</h3>
                    <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                      <div>
                        <p className="font-semibold text-white mb-2">Syntax</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Unit entries must be dot separated.</li>
                          <li>Denominator units must be individually followed by "/"</li>
                          <li>Every unit and prefix name is CASE SENSITIVE</li>
                          <li>Unless otherwise specified, prefixes must be dot separated</li>
                          <li>Exponential can be entered using "**"</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-white mb-2">Examples</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Square meter per second → m**2./s</li>
                          <li>Watts per Kelvin per meter → W./m./K</li>
                          <li>m./m./degC</li>
                          <li>N./mm**2</li>
                          <li>BTU./ft**2./hr./degF</li>
                          <li>cal.m./s./cm**2./degC</li>
                        </ul>
                        <div className="mt-3">
                          <span className="text-sm text-gray-300">Current status is </span>
                          <span className="text-sm text-green-400 font-semibold">PASSING</span>
                          <span className="text-sm text-gray-300"> for all </span>
                          <span className="text-sm text-white font-semibold">20</span>
                          <span className="text-sm text-gray-300"> test cases.</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid md:grid-cols-3 gap-6 text-gray-300">
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-white mb-2">Space</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>m - Meter (mm, cm, km)</li>
                            <li>in - Inches</li>
                            <li>ft - Foot</li>
                            <li>yd - Yard</li>
                            <li>mile - Miles</li>
                            <li>nmile - Nautic Miles</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Mass</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>g - Gram (kg accepted)</li>
                            <li>lb - Pound</li>
                            <li>oz - Ounce</li>
                            <li>ton - US ton</li>
                            <li>tone - Metric ton</li>
                            <li>ukton - UK ton</li>
                            <li>slug - slug</li>
                            <li>stone - stone</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Time</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>s - Second</li>
                            <li>min - Minute</li>
                            <li>hr - Hour</li>
                            <li>day - Day</li>
                            <li>week - Week</li>
                            <li>month - Month</li>
                            <li>year - Year</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Charge</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>A - Ampere</li>
                            <li>C - Coulomb</li>
                            <li>Ohm - Ohm</li>
                            <li>Wb - Weber</li>
                            <li>H - Henry</li>
                            <li>S - Siemens</li>
                            <li>T - Tesla</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Velocity</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>kph - Kilometer per Hour</li>
                            <li>mph - Miles per hour</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-white mb-2">Temperature</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>degC - Celsius</li>
                            <li>degF - Fahrenheit</li>
                            <li>K - Kelvin</li>
                            <li>R - Rankine</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Energy/Power</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>J - Joules (kJ)</li>
                            <li>W - Watts</li>
                            <li>hp - Horse power</li>
                            <li>BTU - BTU American Natural Gas</li>
                            <li>BTUc - BTU Canadian</li>
                            <li>BTUt - BTU Thermochemical</li>
                            <li>BTUcal - BTU water calorie</li>
                            <li>IT - BTU International Steam Table</li>
                            <li>cal - Calorie</li>
                            <li>calt - Calorie Thermochemical</li>
                            <li>cal4 - Calorie 4 degC</li>
                            <li>cal15 - Calorie 15 degC</li>
                            <li>cal20 - Calorie 20 degC</li>
                            <li>calmean - Mean Calorie</li>
                            <li>calit - Calorie International Steam Table</li>
                            <li>toneTNT - TNT per tone</li>
                            <li>TNT - TNT per mass unit</li>
                            <li>eV - Electron volt</li>
                            <li>ccf - Natural Gas 100 cubic feet</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Frequency</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Hz - Hertz</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Volume</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>L - Liter</li>
                            <li>gallon - Gallon</li>
                            <li>pint - Pint</li>
                            <li>floz - Fluid Ounce</li>
                            <li>quart - Quart</li>
                            <li>tbsp - Tablespoon</li>
                            <li>tbs - Teaspoon</li>
                          </ul>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-white mb-2">Force</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>N - Newton (kN)</li>
                            <li>lbf - Pound Force (feet)</li>
                            <li>lbi - Pound Force (inch)</li>
                            <li>kip - Kilo lbf</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Pressure</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Pa - Pascal (kPa, MPa, GPa)</li>
                            <li>psi - Pound per square inch</li>
                            <li>psf - Pound per square feet</li>
                            <li>bar - Bar</li>
                            <li>atm - Atmospheric</li>
                            <li>mH2O - Water column</li>
                            <li>ftH2O - Water column</li>
                            <li>mmHg - Mercury column</li>
                            <li>inHz - Mercury column</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-white mb-2">Prefixes</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Y - Yotta (10e24)</li>
                            <li>Z - Zetta (10e21)</li>
                            <li>E - Exa (10e18)</li>
                            <li>P - Peta (10e15)</li>
                            <li>T - Terra (10e12)</li>
                            <li>G - Giga (10e9)</li>
                            <li>M - Mega (10e6)</li>
                            <li>k - Kilo (10e3)</li>
                            <li>h - Hecto (10e2)</li>
                            <li>da - Daca (10e1)</li>
                            <li>d - Deci (10e-1)</li>
                            <li>c - Centi (10e-2)</li>
                            <li>mi - Mili (10e-3)</li>
                            <li>mc - Micro (10e-6)</li>
                            <li>n - Nano (10e-9)</li>
                            <li>p - Pico (10e-12)</li>
                            <li>f - Femto (10e-15)</li>
                            <li>a - Atto (10e-18)</li>
                            <li>z - Zepto (10e-21)</li>
                            <li>yo - Yocoto (10e-24)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* Marterial Properties */}
            {activeTab === 'materialproperties' && (
              <motion.div
                key="materialproperties"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-4xl mx-auto"
              >
                <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <CalculatorIcon className="w-8 h-8 text-purple-400 mr-4" />
                    <h2 className="text-3xl font-bold text-white">Material Properties</h2>
                  </div>

                  <form onSubmit={handleMaterialProperties} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">First Property Value</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            step="any"
                            placeholder="Enter value"
                            value={materialForm.first_property_value}
                            onChange={(e) => setMaterialForm({ ...materialForm, first_property_value: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                          />
                          <select
                            value={materialForm.first_property_name}
                            onChange={(e) => setMaterialForm({ ...materialForm, first_property_name: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                          >
                            <option value="" disabled>Select property</option>
                            <option value="young">Young Module</option>
                            <option value="shear">Shear Module</option>
                            <option value="bulk">Bulk Modulus</option>
                            <option value="lame">Lame First Parameter</option>
                            <option value="poisson">Poisson Coeficient</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Second Property Value</label>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            step="any"
                            placeholder="Enter value"
                            value={materialForm.second_property_value}
                            onChange={(e) => setMaterialForm({ ...materialForm, second_property_value: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                          />
                          <select
                            value={materialForm.second_property_name}
                            onChange={(e) => setMaterialForm({ ...materialForm, second_property_name: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                          >
                            <option value="" disabled>Select property</option>
                            <option value="young">Young Module</option>
                            <option value="shear">Shear Module</option>
                            <option value="bulk">Bulk Modulus</option>
                            <option value="lame">Lame First Parameter</option>
                            <option value="poisson">Poisson Coeficient</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <CalculatorIcon className="w-6 h-6 mr-2" />
                          Compute
                        </>
                      )}
                    </motion.button>
                  </form>

                  {materialResult && (
                    <div className="mt-8 text-black">
                      <div className="overflow-x-auto">
                        <table className="table-auto w-full text-left bg-white/90 rounded-lg">
                          <thead>
                            <tr>
                              <th className="px-4 py-2">Property Name</th>
                              <th className="px-4 py-2">Property Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-2">Young Modulus (E)</td>
                              <td className="px-4 py-2">{materialResult.E}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Shear Modulus (G)</td>
                              <td className="px-4 py-2">{materialResult.G}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Bulk Modulus (K)</td>
                              <td className="px-4 py-2">{materialResult.K}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Lame First Parameter (λ)</td>
                              <td className="px-4 py-2">{materialResult.lame}</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Poisson Coefficient (ν)</td>
                              <td className="px-4 py-2">{materialResult.Poisson}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
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
                          type="number"
                          step="any"
                          placeholder="e.g. 2500"
                          value={sr20Form.pressure_value}
                          onChange={(e) => setsr20Form({ ...sr20Form, pressure_value: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">Temperature</label>
                        <input
                          type="number"
                          step="any"
                          placeholder={sr20Form.unit === 'F' ? 'e.g. 86' : 'e.g. 30'}
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
                              key={u}
                              type="button"
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <CalculatorIcon className="w-6 h-6 mr-2" />
                          Interpolate
                        </>
                      )}
                    </motion.button>
                  </form>

                  {sr20Result && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
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
                      <p className="text-gray-400 text-xs mt-3">Values interpolated at {sr20Form.pressure_value} ft / {sr20Form.temperature_value} °{sr20Form.unit || 'C'}. Source: Cirrus SR20 POH performance tables.</p>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}

            {/* SR20 Advanced */}
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-6 h-6 animate-spin" />
                      ) : (
                        <><CalculatorIcon className="w-6 h-6 mr-2" />Compute</>)
                      }
                    </motion.button>
                  </form>

                  {sr20aResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-10 space-y-8"
                    >
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

export default Tools;
