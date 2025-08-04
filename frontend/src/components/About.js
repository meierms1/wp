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
    { name: 'JavaScript', level: 90, icon: CodeBracketIcon },
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
                  <h2 className="text-3xl font-bold text-white">My Story</h2>
                </div>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Welcome to my digital space! I'm a software developer who found my passion at the 
                    intersection of technology and finance. My journey began with curiosity about how 
                    markets work and evolved into building tools that help people make better financial decisions.
                  </p>
                  <p>
                    What started as a hobby project to track my own investments has grown into a 
                    comprehensive platform featuring portfolio management, market analysis, and 
                    educational tools. I believe technology should democratize access to financial 
                    literacy and investment opportunities.
                  </p>
                  <p>
                    When I'm not coding, you'll find me analyzing market trends, reading about emerging 
                    technologies, or experimenting with new frameworks. I'm particularly excited about 
                    the potential of AI and machine learning in financial modeling.
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
                      Full-stack development with expertise in Python, JavaScript, and modern web frameworks. 
                      Specialized in building scalable financial applications and data visualization tools.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-400 pl-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Financial Technology</h3>
                    <p className="text-gray-300">
                      Deep understanding of financial markets, portfolio theory, and quantitative analysis. 
                      Experience with market data APIs and algorithmic trading concepts.
                    </p>
                  </div>
                  <div className="border-l-4 border-pink-400 pl-6">
                    <h3 className="text-xl font-semibold text-white mb-2">Data Science</h3>
                    <p className="text-gray-300">
                      Proficient in data analysis, machine learning, and statistical modeling. 
                      Applied these skills to financial forecasting and risk assessment.
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
