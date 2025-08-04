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
  const [conversionResult, setConversionResult] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Common units for the calculator
  const units = {
    length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'inch', 'foot', 'yard', 'mile'],
    weight: ['kilogram', 'gram', 'pound', 'ounce', 'ton'],
    temperature: ['celsius', 'fahrenheit', 'kelvin'],
    volume: ['liter', 'milliliter', 'gallon', 'quart', 'pint', 'cup', 'fluid_ounce'],
    area: ['square_meter', 'square_kilometer', 'square_centimeter', 'square_inch', 'square_foot', 'acre'],
    time: ['second', 'minute', 'hour', 'day', 'week', 'month', 'year']
  };

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
    if (!calculatorForm.input_value || !calculatorForm.input_unit || !calculatorForm.output_unit) {
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
      console.error('Error converting units:', error);
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

  const selectAnswer = (questionIndex, answerIndex) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answerIndex
    });
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
      const response = await axios.post('/api/quiz/submit', { answers: userAnswers });
      if (response.data.success) {
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
                        <select
                          value={calculatorForm.input_unit}
                          onChange={(e) => setCalculatorForm({ ...calculatorForm, input_unit: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select unit</option>
                          {Object.entries(units).map(([category, unitList]) => (
                            <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                              {unitList.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-300 mb-2 font-medium">To Unit</label>
                        <select
                          value={calculatorForm.output_unit}
                          onChange={(e) => setCalculatorForm({ ...calculatorForm, output_unit: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">Select unit</option>
                          {Object.entries(units).map(([category, unitList]) => (
                            <optgroup key={category} label={category.charAt(0).toUpperCase() + category.slice(1)}>
                              {unitList.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
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
                        Take our Financial Independence, Retire Early (FIRE) quiz to test your understanding 
                        of key financial concepts and investment strategies.
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
                          {quizQuestions[currentQuestion]?.question}
                        </h3>

                        <div className="space-y-3">
                          {quizQuestions[currentQuestion]?.answers?.map((answer, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectAnswer(currentQuestion, index)}
                              className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                                userAnswers[currentQuestion] === index
                                  ? 'bg-gradient-to-r from-pink-500/30 to-red-500/30 border-2 border-pink-500'
                                  : 'bg-white/5 hover:bg-white/10 border border-white/20'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                  userAnswers[currentQuestion] === index
                                    ? 'border-pink-500 bg-pink-500'
                                    : 'border-gray-400'
                                }`}>
                                  {userAnswers[currentQuestion] === index && (
                                    <CheckCircleIcon className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <span className="text-white">{answer}</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        <div className="flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={nextQuestion}
                            disabled={userAnswers[currentQuestion] === undefined || loading}
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
