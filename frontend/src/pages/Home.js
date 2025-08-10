import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TypeAnimation } from 'react-type-animation';
import {
  RocketLaunchIcon,
  CodeBracketIcon,
  ChartBarIcon,
  BeakerIcon,
  AcademicCapIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const Home = () => {
  const [heroRef, heroInView] = useInView({ threshold: 0.3, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true });

  const features = [
    {
      icon: AcademicCapIcon,
      title: 'PhD in Mechanical Engineering',
      description: 'Advanced research in computational mechanics and materials science from the University of Colorado.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: CodeBracketIcon,
      title: 'Software Development',
      description: 'Full-stack development with modern technologies including React, Flask, Python, and C++.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: ChartBarIcon,
      title: 'Data Science & Analytics',
      description: 'Machine learning, data visualization, and statistical analysis for engineering solutions.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BeakerIcon,
      title: 'Research & Innovation',
      description: 'Published researcher with open-source software used at universities and national labs.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    { number: '5+', label: 'Years of Experience', icon: RocketLaunchIcon },
    { number: '5+', label: 'Programming Languages', icon: CodeBracketIcon },
    { number: '3', label: 'Languages Spoken', icon: GlobeAltIcon },
    { number: '10+', label: 'Projects Completed', icon: BeakerIcon },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-secondary-900/90 to-accent-900/90" />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-accent-500/20 to-primary-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="hero-title">
              Hi, I'm{' '}
              <span className="text-gradient font-display">
                Maycon Meier
              </span>
            </h1>
            
            <div className="hero-subtitle">
              <TypeAnimation
                sequence={[
                  'PhD in Mechanical Engineering',
                  2000,
                  'Software Developer',
                  2000,
                  'Data Scientist',
                  2000,
                  'Research Engineer',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white"
              />
            </div>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
              Passionate about economy, computational mechanics, software development, and innovative solutions. 
              I specialize in building scalable applications and conducting cutting-edge research 
              that bridges engineering and technology.
            </p>

            

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/projects" className="btn-primary">
                View My Work
                <RocketLaunchIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/about" className="btn-secondary">
                Learn More About Me
              </Link>
            </div>
          </motion.div>
           <div style={{ flex: 5 }}></div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-4 right-1 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [3, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-white/70 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
     
      {/* Features Section */}
      <section
        ref={featuresRef}
        className="section-padding relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="section-title text-white">
              What I Do
            </h2>
            <p className="section-subtitle text-white/80">
              Combining engineering expertise with modern technology to create innovative solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ y: 50, opacity: 0 }}
                  animate={featuresInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card p-6 text-center group hover:transform hover:scale-105"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} p-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-800 mb-3 font-display">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="section-padding bg-gradient-to-r from-primary-800/20 to-accent-800/20"
      >
        <div className="container-custom">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={statsInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="section-title text-white mb-4">
              By the Numbers
            </h2>
            <p className="section-subtitle text-white/80">
              A glimpse into my professional journey and expertise
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={statsInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="glass-effect p-6 rounded-2xl">
                    <Icon className="w-8 h-8 text-accent-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-4xl font-bold text-white mb-2 font-display">
                      {stat.number}
                    </div>
                    <div className="text-white/80 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center glass-effect p-12 rounded-3xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-display">
              Ready to Work Together?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Whether you're looking for software development, data analysis, or research collaboration, 
              I'd love to hear about your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/projects" className="btn-primary">
                View Portfolio
              </Link>
              <a 
                href="mailto:m85830874@gmail.com" 
                className="btn-secondary"
              >
                Get In Touch
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
