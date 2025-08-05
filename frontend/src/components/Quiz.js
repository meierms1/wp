import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const Quiz = () => {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [totalAvailable, setTotalAvailable] = useState(0);

  useEffect(() => {
    // Load initial info about available questions
    fetchQuestionInfo();
  }, []);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && score === null) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, score]);

  const fetchQuestionInfo = async () => {
    try {
      const response = await axios.get('/api/quiz/questions?count=1');
      setTotalAvailable(response.data.total_available);
    } catch (error) {
      console.error('Error fetching question info:', error);
      toast.error('Failed to load quiz information');
    }
  };

  const fetchQuestions = async (count = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/quiz/questions?count=${count}`);
      setQuestions(response.data.questions);
      setTotalAvailable(response.data.total_available);
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

  const handleSubmitQuiz = async () => {
    try {
      const response = await axios.post('/api/quiz/submit', {
        answers,
        questions
      });
      setScore(response.data.percentage);
      toast.success(`Quiz completed! Score: ${response.data.percentage}%`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  const startQuiz = () => {
    fetchQuestions(numQuestions);
    setQuizStarted(true);
    setTimeLeft(300);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(null);
    setQuizStarted(false);
    setTimeLeft(300);
    setQuestions([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-20">
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
              Fire Investigation Quiz
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Test your knowledge of NFPA 1033 and NFPA 921.
            </p>
          </div>

          {!quizStarted && score === null ? (
            // Quiz Introduction
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center"
            >
              <QuestionMarkCircleIcon className="h-24 w-24 text-indigo-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to test your knowledge?
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 mb-8">
                <p>• Multiple choice questions from FIRE investigation database</p>
                <p>• 5 minutes time limit</p>
                <p>• Covers NFPA 1033 and NFPA 921 standards</p>
                <p>• {totalAvailable} questions available in total</p>
              </div>
              
              {/* Number of Questions Selector */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Select Number of Questions:
                </label>
                <div className="flex justify-center space-x-4">
                  {[5, 10, 15, 20, 25].map((count) => (
                    <button
                      key={count}
                      onClick={() => setNumQuestions(count)}
                      disabled={count > totalAvailable}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        numQuestions === count
                          ? 'bg-indigo-600 text-white'
                          : count > totalAvailable
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Selected: {numQuestions} questions
                </p>
              </div>

              <button
                onClick={startQuiz}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                {loading ? 'Loading Questions...' : 'Start Quiz'}
              </button>
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
              <div className="text-6xl font-bold text-indigo-600 mb-4">
                {score}%
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {score >= 80 ? 'Excellent work!' : 
                 score >= 60 ? 'Good job!' : 
                 'Keep learning!'}
              </p>
              <button
                onClick={resetQuiz}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Take Quiz Again
              </button>
            </motion.div>
          ) : (
            // Quiz Questions
            <div className="space-y-6">
              {/* Timer and Progress */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-6 w-6 text-indigo-600" />
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
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              {questions[currentQuestion] && (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {questions[currentQuestion].question_text}
                  </h3>
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(questions[currentQuestion].id, option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          answers[questions[currentQuestion].id] === option
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            answers[questions[currentQuestion].id] === option
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {answers[questions[currentQuestion].id] === option && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <span className="text-gray-900 dark:text-white">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    {currentQuestion === questions.length - 1 ? (
                      <button
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;
