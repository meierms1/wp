import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  TrophyIcon, 
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';

const Pilot = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [wrongDetails, setWrongDetails] = useState([]);

  const categories = [
    { id: 1, name: 'Alphabet', icon: '🔤', description: 'Aviation phonetic alphabet' },
    { id: 2, name: 'Speed', icon: '✈️', description: 'Aircraft speed terminology' },
    { id: 3, name: 'Weights', icon: '⚖️', description: 'Aircraft weight & balance' },
    { id: 4, name: 'Procedures', icon: '📋', description: 'Flight procedures' }
  ];

  // Define handleSubmitQuiz early and memoize it
  const handleSubmitQuiz = useCallback(async () => {
    try {
      const response = await axios.post('/api/pilot-quiz/submit', {
        answers,
        questions,
        category: selectedCategory
      });
      
      const wrongs = questions
        .filter(q => (answers[q.id] || '').toLowerCase().trim() !== q.correct_answer.toLowerCase().trim())
        .map(q => ({
          id: q.id,
          question_text: q.question_text,
          correct_answer: q.correct_answer,
          user_answer: answers[q.id],
          explanation: q.explanation_long || q.explanation || ''
        }));
      setWrongDetails(wrongs);
      
      setScore(response.data.percentage);
      toast.success(`Quiz completed! Score: ${response.data.percentage}%`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  }, [answers, questions, selectedCategory]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && score === null) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && quizStarted && questions.length > 0 && score === null) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, score, questions.length, handleSubmitQuiz]);

  const fetchQuestions = async (categoryId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/pilot-quiz/questions?category=${categoryId}`);
      
      if (response.data.questions && Array.isArray(response.data.questions)) {
        // Shuffle questions using Fisher-Yates algorithm
        const shuffled = [...response.data.questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setQuestions(shuffled);
      } else {
        toast.error('Invalid response format from server');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load quiz questions');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const startQuiz = (categoryId) => {
    setSelectedCategory(categoryId);
    setQuizStarted(true);
    const calculatedTime = 10 * 60; // 10 minutes
    setTimeLeft(calculatedTime);
    fetchQuestions(categoryId);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(null);
    setQuizStarted(false);
    setTimeLeft(0);
    setQuestions([]);
    setWrongDetails([]);
    setSelectedCategory(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-blue-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-blue-900 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ✈️ Pilot Quiz
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Test your aviation knowledge
            </p>
          </div>

          {!quizStarted && score === null ? (
            // Category Selection
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Select a Category
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => startQuiz(category.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900 dark:to-cyan-900 rounded-lg border-2 border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-md"
                  >
                    <div className="text-5xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {category.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : score !== null ? (
            // Quiz Results
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
            >
              <TrophyIcon className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Quiz Complete!
              </h2>
              <div className="text-6xl font-bold text-blue-600 mb-4">
                {score}%
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {score >= 80 ? 'Excellent work!' : 
                 score >= 60 ? 'Good job!' : 
                 'Keep learning!'}
              </p>
              
              {/* Review Incorrect Answers */}
              <div className="mt-12 text-left">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Review Incorrect Answers</h4>
                {wrongDetails.length === 0 ? (
                  <p className="text-green-600 dark:text-green-400">Perfect score! No incorrect answers.</p>
                ) : (
                  <div className="space-y-6">
                    {wrongDetails.map((item, idx) => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-white font-semibold mb-2">{idx + 1}. {item.question_text}</p>
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/40">
                            Your answer: {item.user_answer || '—'}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/40">
                            Correct: {item.correct_answer}
                          </span>
                        </div>
                        {item.explanation && (
                          <p className="text-gray-700 dark:text-gray-300">{item.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={resetQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors mt-8"
              >
                Choose Different Category
              </button>
            </motion.div>
          ) : (
            // Quiz Questions
            <div className="space-y-6">
              {/* Timer and Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">
                    Question {currentQuestion + 1} of {questions.length}
                  </div>
                </div>
                <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              {questions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {questions[currentQuestion]?.question_text || "Loading question..."}
                    </h3>
                  </div>

                  {/* Answer Input Field */}
                  <div className="mb-8">
                    <input
                      type="text"
                      value={answers[questions[currentQuestion]?.id] || ''}
                      onChange={(e) => handleAnswerSelect(questions[currentQuestion].id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      autoFocus
                    />
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      Previous
                    </button>
                    {currentQuestion === questions.length - 1 ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Pilot;
