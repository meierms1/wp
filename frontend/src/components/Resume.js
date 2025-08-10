import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentArrowDownIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  TrophyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const Resume = () => {
  const [activeTab, setActiveTab] = useState('experience');

  const tabs = [
    { id: 'experience', label: 'Work Experience', icon: BriefcaseIcon },
    { id: 'skills', label: 'Skills', icon: TrophyIcon },
    { id: 'education', label: 'Education', icon: AcademicCapIcon },
    { id: 'extracurricular', label: 'Extracurricular', icon: GlobeAltIcon },
    { id: 'publications', label: 'Publications', icon: DocumentTextIcon }
  ];

  const experiences = [
    {
      title: "PD Researcher - Software Development",
      company: "Arizona State University",
      website: "https://www.asu.edu",
      period: "July 2024 - July 2025",
      responsibilities: [
        "Computational modeling of hydrogen-based direct reduction of Iron leveraging Finite Element Analysis (FEA) using C++.",
        "Developing innovative computational methods for natural experiments accounting for geospatial and mechanical response.",
        "Applying deep learning to uncover system dynamics and develop industrial scaling processes."
      ]
    },
    {
      title: "Graduate Research - Software Development",
      company: "University of Colorado",
      website: "https://www.uccs.edu",
      period: "March 2020 - June 2024",
      responsibilities: [
        "Implemented open-source C++ software for Computer-Aided Engineering Design (CAE) of solid composite propellants. Designed and managed ETL pipelines for continuous integration and development (CI/CD). The software is now operated at several universities and national labs.",
        "Developed a new mathematical formulation using phase-fields to perform regression simulations, accounting for heat diffusion, and stress strain material response to body forces and thermal expansion.",
        "Applied machine learning models to warfare gas detection and classification. Applied data analysis to SQL databases using Python."
      ]
    },
    {
      title: "Financial Advisor",
      company: "XP Inc.",
      website: "https://www.xpi.com.br/",
      period: "June 2019 - May 2020",
      responsibilities: [
        "Created investment portfolios for a diverse range of clients, such as farmers, doctors, and corporate directors.",
        "Performed client prospection by running events with educational seminars and using local agencies to create client prospect lists.",
        "Converted over 1 million dollars from low-quality investments into XP high-quality products."
      ]
    },
    {
      title: "Supervisor (Trainee)",
      company: "BRF - Brasil Foods",
      website: "https://www.brf-global.com/en/",
      period: "January 2017 - January 2018",
      responsibilities: [
        "Led a team of over 140 employees in a production line, with a high focus on production efficiency by optimizing an understaffed workforce, reducing stop times, and food safety by enforcing regulatory codes such as HACCP.",
        "Applied evidence-based methods to reduce Salmonella cross-contamination, resulting in a 15% reduction in contamination.",
        "Worked as a support staff for internal utilities management, overseeing a large boiler facility, and pre and postproduction water treatment. Conducted a case study on energy control and utilization."
      ]
    },
    {
      title: "Mechanical Engineering Intern",
      company: "ECS House Industries",
      website: "https://www.houseindustriesinc.com/",
      period: "June 2015 - August 2015",
      responsibilities: [
        "Supported the company transition from old CAD software into SolidWorks.",
        "Performed design evaluation, critical design review, and created a material issue usage list.",
        "Provided customer support and production quality control."
      ]
    }
  ];

  const skills = {
    programming: ["Python", "C++", "JavaScript", "HTML", "CSS", "GIT", "SQL", "LaTeX"],
    frameworks: ["Flask", ".NET", "React"],
    tools: ["Github", "AWS", "Inkscape"],
    engineering: ["SolidWorks", "Comsol", "MS Excel", "ISO 9000"],
    languages: ["English", "Portuguese", "Spanish"],
    softSkills: ["Team Management and Team work", "Accountability", "Empathy", "Problem Solving", "Interpersonal Communication", "Work Ethics"]
  };

  const education = [
    {
      degree: "PhD in Mechanical and Aerospace Engineering",
      institution: "University of Colorado",
      website: "https://www.uccs.edu",
      period: "2020 - 2024",
      emphasis: "Emphasis in Computational Solid Mechanics."
    },
    {
      degree: "MSc in Industrial Mechanical Engineering",
      institution: "Polytechnic Institute of Braganca",
      website: "https://portal3.ipb.pt/index.php/en/",
      period: "2018 - 2019",
      emphasis: "Emphasis in numerical problems and data science."
    },
    {
      degree: "BSc in Mechanical Engineering",
      institution: "Federal University of Technology - Parana",
      website: "http://www.utfpr.edu.br/",
      period: "2012 - 2017"
    },
    {
      degree: "Associate degree in Business Administration",
      institution: "Mario de Andrade School",
      website: "http://www.fnbmarioandrade.seed.pr.gov.br/modules/noticias/",
      period: "2008 - 2011"
    }
  ];

  const extracurricular = [
    {
      organization: "Rotary Club - District 4640",
      website: "https://www.rotary.org/en",
      description: "Rotary is an organization of business and professional people united worldwide who provide humanitarian service, encourage high ethical standards in all vocations, and help build goodwill and peace in the world."
    },
    {
      organization: "Volunteer in Sammatz - Germany",
      website: "https://michaelshof-sammatz.de/blog/en/volunteer/volunteering-in-germany/",
      description: "Sammatz is a small community focused on community growth with sustainability."
    },
    {
      organization: "Director of the Academic Athletic Association for Engineers",
      website: "https://www.instagram.com/atleticapatobranco/",
      description: "The Athletic Association is responsible for organizing all the athletic activities on campus and to represent the university in the state competitions."
    },
    {
      organization: "UTech Performance research group",
      website: "https://www.pb.utfpr.edu.br/utech/",
      description: "UTech is an automotive project focused on converting a passenger car into a racing car while observing efficiency, safety, and performance parameters"
    }
  ];

  const publications = [
    {
      citation: "Meier M, Mohanta RK, Korobeinikov Y, Leick N, Sitaraman H, Seetharaman S, Ankit K; Tracking dendritic growth in hydrogen-based hematite reduction via computer vision. ChemRxiv (2025).",
      link: "https://doi.org/10.26434/chemrxiv-2025-1dg68"
    },
    {
      citation: "B Runnels, V Agrawal, M Meier; The Alamo multiphysics solver for phase field simulations with strong-form mechanics and block structured adaptive mesh refinement. arXiv preprint (2025) arXiv:2503.08917",
      link: "https://arxiv.org/abs/2503.08917"
    },
    {
      citation: "EM Boyd, E Sandall, M Meier, JM Quinlan, B Runnels; A diffuse boundary method for phase boundaries in viscous compressible flow. arXiv preprint (2025) arXiv:2502.16053.",
      link: "https://doi.org/10.48550/arXiv.2502.16053"
    },
    {
      citation: "Meier, M.; Schmidt, E.; Quinlan, J.; Runnels, B: Anisotropy of burn rates in solid composite propellants with phase field modeling. AIAA SciTech (2024):0214.",
      link: "https://doi.org/10.2514/6.2024-0214"
    },
    {
      citation: "Meier, M.; Runnels, B: A fully-coupled mechanics and regression model for deflagration of solid composite propellants with realistic microstructure. Submitted to CMAME (2024).",
      link: "https://doi.org/10.31224/3413"
    },
    {
      citation: "Meier, M.; Schmidt, E.; Quinlan, J.; Runnels, B: Diffuse interface method for solid composite propellant ignition and regression. Combustion and Flame 259 (2024), 113120, ISSN: 0010-2180.",
      link: "https://doi.org/10.1016/j.combustflame.2023.113120"
    },
    {
      citation: "Meier, M; Kittle, J. D.; Yee, X. C.: Supervised Dimension Reduction for Optical Vapor Sensing. RSC advances 12.16 (2022): 9579-9586.",
      link: "https://pubs.rsc.org/en/content/articlehtml/2022/ra/d1ra08774f"
    },
    {
      citation: "Saggin, R. F., Prado, N. V. D., Meier, M., Balbinot-Alfaro, E., & da Trindade Alfaro, A. (2022). Air chilling of Turkey carcasses: process efficiency and impact in the meat quality traits. Journal of Food Science and Technology, 59(9), 3683-3692.",
      link: "https://link.springer.com/article/10.1007/s13197-022-05391-7"
    },
    {
      citation: "Meier, M.; Balsa, C.; Veiga, C. R.: Reconstitution of weather time series with an analog ensemble model. Master's Degree Thesis. Polytechnic Institute of Braganca (2019).",
      link: "https://bibliotecadigital.ipb.pt/handle/10198/19762"
    },
    {
      citation: "Meier, M.; Lafay, J. S. : Structured energy management methodology applied to the poultry industry. Bachelor's Degree Thesis. Parana Federal University of Technology. ROCA DAMEC. Pato Branco, Parana, (2017).",
      link: "https://repositorio.utfpr.edu.br/jspui/handle/1/15231"
    },
    {
      citation: "Goffi, A. S. ; Meier, M. ; Lafay, J. S. . Brazilian poultry industry: challenges to the implementation of energy efficiency policies. in: (conbrepro 2016), 2016. v. vi",
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=DsWpAHMAAAAJ&authuser=1&citation_for_view=DsWpAHMAAAAJ:9yKSN-GCB0IC"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Resume
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Computational Engineer & Software Developer
            </p>
            
            {/* Quick Links */}
            <div className="flex justify-center space-x-6 mb-8">
              <a
                href="https://www.linkedin.com/in/maycon-meier/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-white dark:bg-white-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <FaLinkedin className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">LinkedIn</span>
              </a>
              <a
                href="/static/resume.pdf"
                download="Maycon_Meier_Resume.pdf"
                target="_blank"
                className="flex items-center space-x-2 bg-white dark:bg-white-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <DocumentArrowDownIcon className="h-6 w-6 text-indigo-600" />
                <span className="font-semibold">Download PDF</span>
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="hidden md:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'experience' && (
                    <div className="space-y-8">
                      {experiences.map((exp, index) => (
                        <div key={index} className="border-l-4 border-indigo-200 pl-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {exp.title}
                          </h3>
                          <a
                            href={exp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {exp.company}
                          </a>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {exp.period}
                          </p>
                          <ul className="space-y-2">
                            {exp.responsibilities.map((resp, idx) => (
                              <li key={idx} className="text-gray-700 dark:text-gray-300">
                                • {resp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'skills' && (
                    <div className="space-y-6">
                      {Object.entries(skills).map(([category, skillList]) => (
                        <div key={category}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                            {category.replace(/([A-Z])/g, ' $1').trim()}:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {skillList.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'education' && (
                    <div className="space-y-6">
                      {education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-green-200 pl-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {edu.degree}
                          </h3>
                          <a
                            href={edu.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 hover:underline"
                          >
                            {edu.institution}
                          </a>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {edu.period}
                          </p>
                          {edu.emphasis && (
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                              {edu.emphasis}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'extracurricular' && (
                    <div className="space-y-6">
                      {extracurricular.map((activity, index) => (
                        <div key={index} className="border-l-4 border-yellow-200 pl-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            <a
                              href={activity.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-yellow-600 dark:text-yellow-400 hover:underline"
                            >
                              {activity.organization}
                            </a>
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-2">
                            {activity.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'publications' && (
                    <div className="space-y-4">
                      {publications.map((pub, index) => (
                        <div key={index} className="border-l-4 border-purple-200 pl-6">
                          <p className="text-gray-700 dark:text-gray-300">
                            {pub.citation}{' '}
                            <a
                              href={pub.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 dark:text-purple-400 hover:underline"
                            >
                              [link]
                            </a>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Resume;
