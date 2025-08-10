import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt, FaFilePdf } from 'react-icons/fa';
import {
  RocketLaunchIcon,
  BeakerIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Projects = () => {
  const projects = [
    {
      title: "Hydrogen-Based Iron Reduction for Clean Production",
      subtitle: "Computer vision method for dynamics tracking",
      description: "The reduction of hematite to metallic iron using hydrogen (H2) as a reducing agent presents a promising pathway for decarbonizing steel production. In this study, we employ a combination of in situ confocal scanning laser microscopy (CSLM) and advanced computer vision techniques to quantitatively analyze dendritic growth of ferrite during H2-based reduction of iron oxide at high temperatures.",
      details: [
        "A detailed analysis of the results can be found in the published paper currently undergoing peer-review by the Materials Characterization Journal.",
        "This work applied image segmentation techniques to track the dendritic growth during the transformation of hematite to alpha-iron in a hydrogen induced reduction."
      ],
      media: [
        {
          type: "gif",
          src: `${process.env.PUBLIC_URL}/static/section8.gif`,
          caption: "Segmentation Methods"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/CVplot.png`,
          caption: "Volume fraction over time"
        }
      ],
      links: [
        {
          type: "paper",
          url: "https://doi.org/10.26434/chemrxiv-2025-1dg68",
          label: "Research Paper"
        }
      ],
      collaborators: [
        { name: "Dr. Ram Mohanta", url: "https://www.linkedin.com/in/rammohanta21" },
        { name: "Dr. Sridhar Seetharaman", url: "https://search.asu.edu/profile/3858630" },
        { name: "Dr. Yuri Korobeinikov", url: "https://search.asu.edu/profile/3946734" },
        { name: "Dr. Noemi Leick", url: "https://research-hub.nrel.gov/en/persons/noemi-leick" },
        { name: "Dr. Hari Sitaraman", url: "https://research-hub.nrel.gov/en/persons/hariswaran-sitaraman" },
        { name: "Dr. Kumar Ankit", url: "https://search.asu.edu/profile/3173066" },
      ],
      funding: "This material is based upon work supported by the U.S. Department of Energy (DOE), Office of Science, Office of Basic Energy Sciences (BES), Materials Sciences and Engineering Division under Award DE-SC0024724 'Fundamental Studies of Hydrogen Arc Plasmas for High-efficiency and Carbon-free Steelmaking'.",
      icon: BeakerIcon,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Rocket Propellant Burn Simulation",
      subtitle: "Diffuse interface method for parallel computation and adaptive mesh refinement",
      description: "Solid Composite Propellants (SCPs) are extensively used in the field of propulsion for their chemical and mechanical stability in long-term storage, and for having simple production and operation processes. Computational modeling enables cost reduction, increased efficiency, and greater coverage of the configuration space in the SCP design process.",
      details: [
        "This work presents a phase-field model for the regression of the burn interface during ignition and deflagration of an SCP with arbitrary morphology.",
        "It is an extension to Alamo open-source software, which is built with focus on parallel processing, and utilizes AMReX Framework for adaptive refinement."
      ],
      media: [
        {
          type: "video",
          src: `${process.env.PUBLIC_URL}/static/gcolors3.webm`,
          caption: "Mesoscale 3D simulations of composite solid propellant regression"
        }, {}, {},
        {
          type: "gif",
          src: `${process.env.PUBLIC_URL}/static/vm-crop.gif`,
          caption: "VonMises stress during regression"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/maximum2.png`,
          caption: "Maximum stress spots"
        }, {},
        {
          type: "gif",
          src: `${process.env.PUBLIC_URL}/static/rodandtube_temp.gif`,
          caption: "Thermal Diffusion"
        },
        {
          type: "gif",
          src: `${process.env.PUBLIC_URL}/static/rodandtube_vm.gif`,
          caption: "VonMises Stress"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/doublecircle.png`,
          caption: "Total interface over time"
        },
        {
          type: "gif",
          src: `${process.env.PUBLIC_URL}/static/anchor_temp.gif`,
          caption: "Thermal Diffusion"
        },
        {
          type: "gif",
          src: `${process.env.PUBLIC_URL}/static/anchor_vm.gif`,
          caption: "VonMises Stress"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/anchor.png`,
          caption: "Total interface over time"
        }
      ],
      links: [
        {
          type: "github",
          url: "https://github.com/solidsgroup/alamo.git",
          label: "GitHub Repository (flame branch)"
        },
        {
          type: "paper",
          url: "https://doi.org/10.1016/j.combustflame.2023.113120",
          label: "Published in Combustion and Flame"
        }
      ],
      collaborators: [
        { name: "Dr. Brandon Runnels", url: "https://www.engineering.iastate.edu/people/profile/brunnels/" },
        { name: "Dr. Emma Boyd", url: "https://scholar.google.com/citations?user=WN-qmqgAAAAJ&hl=en" },
        { name: "Dr. Matt Quinlan", url: "https://eas.uccs.edu/departments/mechanical-and-aerospace-engineering/directory/faculty/matt-quinlan" },
        { name: "Dr. Vinamra Agrawal", url: "https://vinagr.github.io/" },
        { name: "Dr. Brian Bojko", url: "https://scholar.google.com/citations?user=mepqCdIAAAAJ&hl=en" },
        { name: "Dr. Joseph Kalman", url: "https://www.csulb.edu/college-of-engineering/dr-joseph-kalman" },
        { name: "Patrick Martinez", url: "https://gocaltech.com/sports/track-and-field/roster/patrick-martinez/5540" }],
      funding: "This work is sponsored by the Department of Defense - Office of Naval Research grant #N00014-21-1-2113.",
      icon: RocketLaunchIcon,
      color: "from-red-500 to-orange-500"
    },
    {
      title: "Warfare Gas Classification",
      subtitle: "Machine Learning - Dimension Reduction",
      description: "Photonic crystals have demonstrated optical sensitivity that allows for accurate detection and identification of vapor. In brief, natural photonic crystals contain a polarity gradient within their periodic nanoarchitecture. Light moving through this nanoarchitecture is sensitive to changes in the refractive index of the system caused by the presence of a vapor.",
      details: [
        "In this work, five different dimension reduction methods were applied to reflectance data generated from exposing the wings of a Morpho Didius Butterfly to different Warfare gases.",
        "The original dataset is composed by 438 wavelength dimensions, and good classification results were found after reducing the dimensionality to 2."
      ],
      media: [
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/kittle.jpeg`,
          caption: "Morpho Didius Butterfly wing structure"
        }, {}, {},
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/PCA7.webp`,
          caption: "Principal Component Analysis (PCA)"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/SPCA7.webp`,
          caption: "Supervised PCA (SPCA)"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/PLS7.webp`,
          caption: "Partial Least Square (PLS)"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/LSR-PCA7.webp`,
          caption: "Least Square Regression PCA (LSR-PCA)"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/LDA7.webp`,
          caption: "Linear Discriminant Analysis (LDA)"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/data2.webp`,
          caption: "K-nearest neighbor classification accuracy"
        }
      ],
      links: [
        {
          type: "github",
          url: "https://github.com/meierms1/Supervised-Dimension-Reduction-For-Optical-Vapor-Sensing.git",
          label: "GitHub Repository"
        },
        {
          type: "paper",
          url: "https://doi.org/10.1039/D1RA08774F",
          label: "Published in RSC Advances"
        }
      ],
      collaborators: [
        { name: "Dr. Xin (Cindy) Yee", url: "https://eas.uccs.edu/departments/mechanical-and-aerospace-engineering/directory/faculty/xin-cindy-yee" },
        { name: "Dr. Joshua Kittle", url: "https://sciprofiles.com/profile/joshdkittle" }],
      icon: ChartBarIcon,
      color: "from-purple-500 to-pink-500",
      funding: "This work was supported by the University of Colorado at Colorado Springs.",
    },

    {
      title: "Air Chilling for Poultry Processing: Enhancing Quality and Safety",
      subtitle: "Comparative study of air vs. water chilling methods",
      description: "This project investigates the use of air chilling in comparison to traditional water chilling in poultry processing. The study evaluates the impact of air chilling on meat quality, microbial safety, environmental sustainability, and operational efficiency, providing insights into its advantages and challenges for modern food production.",
      details: [
        "A comprehensive analysis of air chilling's effects on poultry carcass quality, including texture, flavor, and microbial growth, is presented in the published paper.",
        "The research compares air chilling and water chilling, highlighting reduced water usage, lower cross-contamination risk, and potential improvements in product quality.",
        "The study also analyzes the impact of multistage air chilling processes."
      ],
      media: [
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/AirFig1.webp`,
          caption: "Micrographs of turkey meat refrigerated in the air chilling system with two stages (air/water spray+air)"
        },
        {
          type: "image",
          src: `${process.env.PUBLIC_URL}/static/AirFig2.webp`,
          caption: "Micrographs of turkey meat refrigerated in the air chilling system with a single stage (air/water spray)"
        }
      ], 
      links: [
        {
          type: "paper",
          url: "https://doi.org/10.1007/s13197-022-05391-7",
          label: "Research Paper"
        }
      ],
      collaborators: [
        { name: "Rosemar Frigotto, MSc, DVM", url: "https://www.linkedin.com/in/rosemar-frigotto-saggin-31a13425/?originalSubdomain=br" },
        { name: "Dr. Alexandre da Trindade Alfaro", url: "https://scholar.google.com/citations?user=US90TFAAAAAJ&hl=pt-BR" },
        { name: "Dr. Naimara Vieira do Prado", url: "https://orcid.org/0000-0001-8952-7092" },
        { name: "Dr. Evellin Balbinot-Alfaro", url: "https://www.researchgate.net/profile/Evellin-Balbinot-Alfaro" }
      ],
      funding: "This research was supported by the Federal University of Technology - Parana and BRF Brasil Foods.",
      icon: BeakerIcon,
      color: "from-green-500 to-blue-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-20">
      {/* Add JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Maycon Meier",
            "jobTitle": "Computational Engineer",
            "affiliation": {
              "@type": "Organization",
              "name": "University Research"
            },
            "sameAs": projects.flatMap(p => p.links.map(l => l.url)),
            "hasCredential": projects.map(project => ({
              "@type": "EducationalOccupationalCredential",
              "name": project.title,
              "description": project.description,
              "url": project.links.find(l => l.type === 'paper')?.url
            })),
            "colleague": projects.flatMap(p =>
              p.collaborators?.map(c => ({
                "@type": "Person",
                "name": c.name,
                "url": c.url
              })) || []
            )
          })
        }}
      />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Research Projects
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Computational Engineering & Scientific Computing
            </p>
          </div>

          {/* Projects */}
          <div className="space-y-16">
            {projects.map((project, index) => {
              const Icon = project.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* Project Header */}
                  <div className={`bg-gradient-to-r ${project.color} px-8 py-6 text-white`}>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold">{project.title}</h2>
                        <p className="text-white/90 text-lg">{project.subtitle}</p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3">
                      {project.links.map((link, linkIndex) => (
                        <a
                          key={linkIndex}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                        >
                          {link.type === 'github' && <FaGithub className="h-4 w-4" />}
                          {link.type === 'paper' && <FaFilePdf className="h-4 w-4" />}
                          {link.type === 'demo' && <FaExternalLinkAlt className="h-4 w-4" />}
                          <span className="text-sm font-medium">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-8">
                    <div className="mb-8">
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
                        {project.description}
                      </p>
                      <ul className="space-y-2">
                        {project.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="text-gray-600 dark:text-gray-400">
                            • {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Media Gallery */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {project.media.map((media, mediaIndex) => (
                        <div key={mediaIndex} className="space-y-2">
                          {media.type === 'image' && (
                            <img
                              src={media.src}
                              alt={media.caption}
                              className="w-full h-auto rounded-lg shadow-lg"
                            />
                          )}
                          {media.type === 'gif' && (
                            <img
                              src={media.src}
                              alt={media.caption}
                              className="w-full h-auto rounded-lg shadow-lg"
                            />
                          )}
                          {media.type === 'video' && (
                            <video
                              loop
                              muted
                              controls
                              playsInline
                              preload="metadata"
                              className="w-full h-auto rounded-lg shadow-lg"
                            >
                              <source src={media.src} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            {media.caption}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Funding Information */}
                    {project.funding && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Funding & Support
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {project.funding}
                        </p>
                      </div>
                    )}

                    {/*Project Colaborators */}
                    {project.collaborators && project.collaborators.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                          Collaborators
                        </h4>
                        <ul className="space-y-1">
                          {project.collaborators.map((collaborator) => (
                            <a
                              href={collaborator.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                            >
                              {collaborator.name}{";   "}
                            </a>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Projects;
