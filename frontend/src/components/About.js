import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CodeBracketIcon, 
  AcademicCapIcon, 
  GlobeAltIcon,
  ChartBarIcon,
  CpuChipIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const skills = [
    { name: 'Python', level: 95, icon: CodeBracketIcon },
    { name: 'C++', level: 85, icon: CodeBracketIcon },
    { name: 'SQL', level: 80, icon: CodeBracketIcon },
    { name: 'Git', level: 95, icon: CpuChipIcon },
    { name: 'Tableu', level: 80, icon: ChartBarIcon },
    { name: 'React', level: 88, icon: GlobeAltIcon },
    { name: 'Flask', level: 92, icon: CodeBracketIcon },
    { name: 'Data Science', level: 85, icon: ChartBarIcon },
    { name: 'Machine Learning', level: 80, icon: CpuChipIcon },
  ];

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

  const skillVariants = {
    hidden: { width: 0 },
    visible: (level) => ({
      width: `${level}%`,
      transition: {
        duration: 1.5,
        ease: "easeOut",
        delay: 0.2
      }
    })
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
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              About Me
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Passionate developer with a love for creating innovative solutions and exploring the intersection of technology and finance.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Story & Education */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Personal Story */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-center mb-6">
                  <UserIcon className="w-8 h-8 text-blue-400 mr-4" />
                  <h2 className="text-3xl font-bold text-white">Summary</h2>
                </div>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                   Welcome to my digital space! I specialize in computational modeling, data science,                  
                   and Finite Element Analysis, with hands-on experience in C++, Python, and SQL. 
                   My journey has taken me from leading large teams in the food industry to developing
                    open-source engineering software now used at universities and national labs. 
                    I hold a Doctor of Engineering from the University of Colorado, and my work blends 
                    deep technical expertise with creative problem-solving.
                  </p>
                  <p>
                    Whether it's building scalable data pipelines, applying machine learning to real-world challenges, 
                    or optimizing production systems, I thrive in cross-functional environments and enjoy collaborating 
                    with people from all backgrounds. My career includes roles as a postdoctoral researcher, financial advisor, 
                    and production supervisor, always with a focus on efficiency and innovation.
                  </p>
                  <p>
                    Fluent in English, Portuguese, and Spanish, I bring a global perspective to every project. Outside of work, 
                    you'll find me hiking desert trails, skiing mountain slopes, or exploring new places with friends. 
                    This webpage is built with Flask and serves as a showcase for my technical and creative work.
                  </p>
                </div>
              </div>

              {/* Education & Experience */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-center mb-6">
                  <AcademicCapIcon className="w-8 h-8 text-purple-400 mr-4" />
                  <h2 className="text-3xl font-bold text-white">Background</h2>
                </div>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-400 pl-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Software Development</h3>
                    <p className="text-gray-300">
                      Full-stack development with expertise in Python, C++, and modern frameworks. 
                      Specialized in building scalable software applications and data visualization tools.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Computer-aided Engineering (CAE)</h3>
                    <p className="text-gray-300">
                      Deep understanding of mathematical modeling for CAE, including all three discretization schemes (finite difference, finite element, and finite volume),
                      and both explicity and implicity implementations. Particularly, I specialize in evolving interface tracked through phase-field modeling.
                    </p>
                  </div>
                  <div className="border-l-4 border-pink-400 pl-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Data Science</h3>
                    <p className="text-gray-300">
                      Proficient in data analysis, machine learning, and statistical modeling. 
                      Applied these skills to forecasting and classification problems.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Skills & Values */}
            <motion.div variants={itemVariants} className="space-y-8">
              {/* Skills */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-3xl font-bold text-white mb-8">Skills & Expertise</h2>
                <div className="space-y-6">
                  {skills.map((skill, index) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <skill.icon className="w-5 h-5 text-blue-400 mr-3" />
                          <span className="text-white font-medium">{skill.name}</span>
                        </div>
                        <span className="text-gray-300 text-sm">{skill.level}%</span>
                      </div>
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          variants={skillVariants}
                          initial="hidden"
                          animate="visible"
                          custom={skill.level}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Values & Philosophy */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <div className="flex items-center mb-6">
                  <HeartIcon className="w-8 h-8 text-pink-400 mr-4" />
                  <h2 className="text-3xl font-bold text-white">Values & Philosophy</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <span className="text-white font-semibold">Innovation:</span> Always exploring new 
                      technologies and methodologies to solve complex problems.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <span className="text-white font-semibold">Education:</span> Committed to sharing 
                      knowledge and making financial literacy accessible to everyone.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <span className="text-white font-semibold">Quality:</span> Believing in clean, 
                      maintainable code and user-centered design principles.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <p className="text-gray-300">
                      <span className="text-white font-semibold">Continuous Learning:</span> Staying 
                      curious and adapting to the ever-evolving tech landscape.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fun Facts */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-bold text-white mb-6">Fun Facts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">5+</div>
                    <div className="text-gray-300 text-sm">Years Coding</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">50+</div>
                    <div className="text-gray-300 text-sm">Projects Built</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-400">∞</div>
                    <div className="text-gray-300 text-sm">Coffee Consumed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">24/7</div>
                    <div className="text-gray-300 text-sm">Learning Mode</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div 
            variants={itemVariants}
            className="text-center mt-16"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Let's Connect!</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Interested in collaborating on a project, discussing market trends, or just want to chat about tech? 
              I'd love to hear from you.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get In Touch
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
