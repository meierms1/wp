import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const Study = () => {
  const [metarsData, setMetarsData] = useState(null);
  const [generalData, setGeneralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState(null); // 'metars', 'general', or null

  useEffect(() => {
    fetchStudyData();
  }, []);

  const fetchStudyData = async () => {
    try {
      setLoading(true);
      const [metarsRes, generalRes] = await Promise.all([
        axios.get('/quiz-data/pilot-metars.json'),
        axios.get('/quiz-data/pilot-general.json')
      ]);
      setMetarsData(metarsRes.data);
      setGeneralData(generalRes.data);
    } catch (error) {
      console.error('Error loading study data:', error);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const StudyBox = ({ data, title, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-600/30 to-blue-400/20 rounded-2xl p-8 border border-blue-400/30 backdrop-blur-sm"
    >
      <div className="flex items-center space-x-3 mb-6">
        {Icon && <Icon className="w-6 h-6 text-blue-300" />}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="ml-auto text-sm text-blue-200 bg-blue-400/20 px-3 py-1 rounded-full">
          {data?.questions?.length || 0} items
        </span>
      </div>

      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar">
        {data?.questions?.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.id * 0.02 }}
            className="bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/40 rounded-lg p-4 transition-all duration-200"
          >
            <div className="flex-1">
              <div className="text-xs text-blue-300 font-semibold mb-2 uppercase tracking-wider">
                Q{item.id}:
              </div>
              <h3 className="text-base font-medium text-white leading-relaxed mb-4">
                {item.question_text}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2">
                    Answer
                  </p>
                  <p className="text-sm text-white/90 bg-blue-400/25 border border-blue-300/40 rounded px-3 py-2 font-medium">
                    {item.correct_answer}
                  </p>
                </div>

                {item.explanation && (
                  <div>
                    <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-2">
                      Explanation
                    </p>
                    <p className="text-sm text-white/75 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 container-custom">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
            <p className="text-white text-lg">Loading study materials...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 container-custom">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center space-x-3 mb-4">
          <BookOpenIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white">Study Materials</h1>
        </div>
        <p className="text-blue-200/60 text-lg">
          Select a study category to begin
        </p>
      </motion.div>

      {!selectedStudy ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto"
        >
          {metarsData && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStudy('metars')}
              className="group bg-gradient-to-br from-blue-600/40 to-blue-400/20 hover:from-blue-600/60 hover:to-blue-400/40 border border-blue-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
            >
              <BookOpenIcon className="w-12 h-12 text-blue-300 mb-4 group-hover:text-blue-200 transition-colors" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {metarsData.category_name || 'METAR Study'}
              </h2>
              <p className="text-blue-200 mb-4">
                {metarsData.questions?.length || 0} items
              </p>
              <span className="text-blue-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Start Studying →
              </span>
            </motion.button>
          )}

          {generalData && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStudy('general')}
              className="group bg-gradient-to-br from-blue-600/40 to-blue-400/20 hover:from-blue-600/60 hover:to-blue-400/40 border border-blue-400/40 rounded-2xl p-8 text-left transition-all duration-300 backdrop-blur-sm"
            >
              <BookOpenIcon className="w-12 h-12 text-blue-300 mb-4 group-hover:text-blue-200 transition-colors" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {generalData.category_name || 'General Knowledge'}
              </h2>
              <p className="text-blue-200 mb-4">
                {generalData.questions?.length || 0} items
              </p>
              <span className="text-blue-300 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Start Studying →
              </span>
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => setSelectedStudy(null)}
            className="mb-8 px-6 py-2 bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/40 rounded-lg text-blue-200 font-semibold transition-colors"
          >
            ← Back to Selection
          </motion.button>

          <StudyBox
            data={selectedStudy === 'metars' ? metarsData : generalData}
            title={selectedStudy === 'metars' ? metarsData.category_name : generalData.category_name}
            icon={BookOpenIcon}
          />
        </motion.div>
      )}
    </div>
  );
};

export default Study;
