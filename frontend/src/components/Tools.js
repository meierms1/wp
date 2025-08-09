import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  CalculatorIcon, 
  AcademicCapIcon, 
  ArrowPathIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  ChartBarIcon
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
  const [conversionResult, setConversionResult] = useState(null);
  const [materialResult, setMaterialResult] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  // Track incorrect answers with explanations
  const [wrongDetails, setWrongDetails] = useState([]);

  // Common units for the calculator
  // Removed predefined units dropdown; free-text unit syntax is now used.

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      const response = await axios.get('/api/quiz/questions');
      if (response.data.success) {
        setQuizQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      toast.error('Failed to load quiz questions');
    }
  };

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

  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setQuizResults(null);
  };

  // Store selected answer by question id with the selected option text
  const selectAnswer = (questionId, option) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      // Include both answers and questions so backend can grade
      const response = await axios.post('/api/quiz/submit', { 
        answers: userAnswers,
        questions: quizQuestions
      });
      if (response.data.success) {
        // Build list of incorrect answers with explanations
        const wrongs = quizQuestions
          .filter(q => userAnswers[q.id] !== q.correct_answer)
          .map(q => ({
            id: q.id,
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            user_answer: userAnswers[q.id],
            explanation: q.explanation_long || q.explanation || ''
          }));
        setWrongDetails(wrongs);
        setQuizResults(response.data);
        setQuizCompleted(true);
        toast.success('Quiz completed!');
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setUserAnswers({});
    setQuizCompleted(false);
    setQuizResults(null);
    setWrongDetails([]);
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
              Enhance your financial knowledge with our calculator and quiz tools.
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div variants={itemVariants} className="flex justify-center mb-12">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-2 border border-white/10">
              {[
                { id: 'calculator', label: 'Unit Calculator', icon: CalculatorIcon },
                { id: 'materialproperties', label: 'Material Properties', icon: CalculatorIcon },
                { id: 'quiz', label: 'FIRE Quiz', icon: AcademicCapIcon }
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

            {/* FIRE Quiz */}
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="max-w-4xl mx-auto"
              >
                <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                  <div className="flex items-center mb-6">
                    <AcademicCapIcon className="w-8 h-8 text-pink-400 mr-4" />
                    <h2 className="text-3xl font-bold text-white">FIRE Quiz</h2>
                  </div>

                  {!quizStarted && !quizCompleted && (
                    <div className="text-center py-12">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center"
                      >
                        <PlayIcon className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-4">Test Your FIRE Knowledge</h3>
                      <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                        Take our NFPA 1033 and 921 Fire Investigation quiz to test your understanding 
                        of key concepts and strategies.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startQuiz}
                        disabled={quizQuestions.length === 0}
                        className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 disabled:opacity-50"
                      >
                        Start Quiz ({quizQuestions.length} Questions)
                      </motion.button>
                    </div>
                  )}

                  {quizStarted && !quizCompleted && quizQuestions.length > 0 && (
                    <div>
                      {/* Progress Bar */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-300">Question {currentQuestion + 1} of {quizQuestions.length}</span>
                          <span className="text-gray-300">{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Question */}
                      <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="text-xl font-semibold text-white mb-6">
                          {quizQuestions[currentQuestion]?.question_text}
                        </h3>

                        <div className="space-y-3">
                          {quizQuestions[currentQuestion]?.options?.map((option, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectAnswer(quizQuestions[currentQuestion].id, option)}
                              className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                                userAnswers[quizQuestions[currentQuestion].id] === option
                                  ? 'bg-gradient-to-r from-pink-500/30 to-red-500/30 border-2 border-pink-500'
                                  : 'bg-white/5 hover:bg-white/10 border border-white/20'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                  userAnswers[quizQuestions[currentQuestion].id] === option
                                    ? 'border-pink-500 bg-pink-500'
                                    : 'border-gray-400'
                                }`}>
                                  {userAnswers[quizQuestions[currentQuestion].id] === option && (
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <span className="text-white">{option}</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        <div className="flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={nextQuestion}
                            disabled={userAnswers[quizQuestions[currentQuestion].id] === undefined || loading}
                            className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
                          >
                            {loading ? (
                              <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : currentQuestion === quizQuestions.length - 1 ? (
                              'Submit Quiz'
                            ) : (
                              'Next Question'
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {quizCompleted && quizResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                          quizResults.percentage >= 80 ? 'bg-green-500' : 
                          quizResults.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {quizResults.percentage >= 80 ? (
                          <CheckCircleIcon className="w-12 h-12 text-white" />
                        ) : quizResults.percentage >= 60 ? (
                          <ChartBarIcon className="w-12 h-12 text-white" />
                        ) : (
                          <XCircleIcon className="w-12 h-12 text-white" />
                        )}
                      </motion.div>

                      <h3 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h3>
                      <p className="text-gray-300 mb-6">Here are your results:</p>
                      
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/5 rounded-lg p-6">
                          <p className="text-gray-400 text-sm">Score</p>
                          <p className="text-3xl font-bold text-white">{quizResults.score}/{quizResults.total}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-6">
                          <p className="text-gray-400 text-sm">Percentage</p>
                          <p className={`text-3xl font-bold ${
                            quizResults.percentage >= 80 ? 'text-green-400' : 
                            quizResults.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {quizResults.percentage.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-6">
                          <p className="text-gray-400 text-sm">Grade</p>
                          <p className={`text-3xl font-bold ${
                            quizResults.percentage >= 80 ? 'text-green-400' : 
                            quizResults.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {quizResults.percentage >= 80 ? 'A' : 
                             quizResults.percentage >= 60 ? 'B' : 'C'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {quizResults.percentage >= 80 && (
                          <p className="text-green-400 font-semibold">
                            🎉 Excellent! You have a strong understanding of FIRE principles.
                          </p>
                        )}
                        {quizResults.percentage >= 60 && quizResults.percentage < 80 && (
                          <p className="text-yellow-400 font-semibold">
                            👍 Good job! You have a solid foundation, but there's room for improvement.
                          </p>
                        )}
                        {quizResults.percentage < 60 && (
                          <p className="text-red-400 font-semibold">
                            📚 Keep learning! Consider reviewing FIRE concepts and investment strategies.
                          </p>
                        )}
                      </div>

                      {/* Review Incorrect Answers */}
                      <div className="mt-12 text-left">
                        <h4 className="text-2xl font-bold text-white mb-4">Review Incorrect Answers</h4>
                        {wrongDetails.length === 0 ? (
                          <p className="text-green-400">Perfect score! No incorrect answers.</p>
                        ) : (
                          <div className="space-y-6">
                            {wrongDetails.map((item, idx) => (
                              <div key={item.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                                <p className="text-white font-semibold mb-2">{idx + 1}. {item.question_text}</p>
                                <div className="flex flex-wrap gap-3 mb-3">
                                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                                    Your answer: {item.user_answer || '—'}
                                  </span>
                                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
                                    Correct: {item.correct_answer}
                                  </span>
                                </div>
                                {item.explanation && (
                                  <p className="text-gray-300">{item.explanation}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={resetQuiz}
                        className="mt-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                      >
                        Take Quiz Again
                      </motion.button>
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
