import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClockIcon, TrophyIcon, FireIcon  } from '@heroicons/react/24/outline';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [totalAvailable, setTotalAvailable] = useState(0);
  // Track incorrect answers with explanations
  const [wrongDetails, setWrongDetails] = useState([]);

  useEffect(() => {
    // Load initial info about available questions
    fetchQuestionInfo();
  }, []);

  // Define handleSubmitQuiz early and memoize it, so it can be safely used in effects
  const handleSubmitQuiz = useCallback(async () => {
    try {
      const response = await axios.post('/api/quiz/submit', {
        answers,
        questions
      });
      
      // Build list of incorrect answers with explanations
      const wrongs = questions
        .filter(q => answers[q.id] !== q.correct_answer)
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
  }, [answers, questions]);

  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && score === null) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, score, handleSubmitQuiz]);

  // Debug effect to monitor questions state changes
  useEffect(() => {
    console.log('Questions state changed:', {
      questionsLength: questions.length,
      questions: questions.slice(0, 1), // Just log first question to avoid too much output
      loading,
      quizStarted
    });
  }, [questions, loading, quizStarted]);

  const fetchQuestionInfo = async () => {
    try {
      console.log('Fetching question info...');
      const response = await axios.get('/api/quiz/questions?count=1');
      console.log('Question info response:', response.data);
      setTotalAvailable(response.data.total_available);
    } catch (error) {
      console.error('Error fetching question info:', error);
      toast.error('Failed to load quiz information');
    }
  };

  const fetchQuestions = async (count = 10) => {
    console.log(`Starting fetchQuestions with count: ${count}`);
    setLoading(true);
    try {
      console.log(`Fetching ${count} questions...`);
      const response = await axios.get(`/api/quiz/questions?count=${count}`);
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Questions array:', response.data.questions);
      console.log('Number of questions received:', response.data.questions?.length);
      
      if (response.data.questions && Array.isArray(response.data.questions)) {
        setQuestions(response.data.questions);
        setTotalAvailable(response.data.total_available);
        console.log('Questions state updated successfully');
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Invalid response format from server');
      }
      
      setLoading(false);
      console.log('Loading set to false');
    } catch (error) {
      console.error('Error fetching questions:', error);
      console.error('Error details:', error.response?.data);
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

  const startQuiz = () => {
    console.log('=== START QUIZ FUNCTION CALLED ===');
    console.log('Starting quiz with', numQuestions, 'questions');
    
    setQuizStarted(true);
    setTimeLeft(300);
    
    // Fetch the real questions
    fetchQuestions(numQuestions);
    console.log('Quiz started, fetchQuestions called');
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setScore(null);
    setQuizStarted(false);
    setTimeLeft(300);
    setQuestions([]);
    setWrongDetails([]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-red-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading quiz...</p>
        </div>
      </div>
    );
  }

  console.log('Quiz render state:', {
    quizStarted,
    score,
    questionsLength: questions.length,
    currentQuestion,
    totalAvailable,
    loading
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-red-900 py-20">
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
              <FireIcon className="h-24 w-24 text-red-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to test your knowledge?
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 mb-8">
                <p>• Multiple choice questions from FIRE investigation database</p>
                <p>• 5 minutes time limit</p>
                <p>• Covers NFPA 1033 and NFPA 921 standards</p>
                <p>• {totalAvailable} questions available in total</p>
                <p>Disclaimer: The questions in this quiz are parsed from CFItrainer.net and are for educational purposes only.</p>
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
                          ? 'bg-red-600 text-white'
                          : count > totalAvailable
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-orange-300'
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
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
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
              <div className="text-6xl font-bold text-red-600 mb-4">
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
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
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
                    <ClockIcon className="h-6 w-6 text-red-600" />
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
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
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

                  {questions[currentQuestion]?.options && (
                    <div className="space-y-3 mb-8">
                      {questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(questions[currentQuestion].id, option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            answers[questions[currentQuestion].id] === option
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-orange-300'
                          }`}
                        >
                          <span className="text-gray-900 dark:text-white">{option}</span>
                        </button>
                      ))}
                    </div>
                  )}

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
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
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

export default Quiz;
