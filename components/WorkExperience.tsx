"use client";

import ShinyText from "./ShinyText";
import "@fontsource/poppins";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/400-italic.css";
import { motion } from "motion/react";
import { FaSuitcase } from "react-icons/fa6";
import { useState } from "react";
import { IoChevronDown } from "react-icons/io5";

const blinkingStyle = `
  @keyframes slowBlink {
    0%, 49%, 100% {
      opacity: 1;
    }
    50%, 99% {
      opacity: 0.3;
    }
  }
  .blinking-light {
    animation: slowBlink 2s infinite;
  }
`;

const experiences = [
  {
    company: "Surepass Technologies Private Limited",
    role: "Software Development Engineer - I",
    duration: "Oct 2024 - Present",
    description: "Promoted from Intern to Full-Time in 3 Months",
    technologies: [
      "Python",
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "PDF Processing",
      "AI/ML",
      "RAG",
      "LLM",
      "CI/CD",
    ],
    responsibilities: [
      "Built from scratch & deployed end-to-end: Architected SureParser, an AI-powered PDF parsing platform with intelligent schema generation, multi-class document classification, and automated data extraction; owned complete CI/CD pipeline, configured auto-scaling infrastructure, and established monitoring for production stability",
      "RAG implementation: Developed production-grade Retrieval-Augmented Generation system for conversational PDF interactions, enabling global semantic search across document repositories with fast response times and high relevancy",
      "eSign platform expansion: Extended digital signature capabilities with PFX certificate-based signing support ensuring compliance with industry standards; created comprehensive PDF utility API suite (merge, split, page manipulation, compression) handling significant daily traffic",
      "API development & integration: Engineered scalable microservice wrappers for third-party verification services (Credit Reports, Land Records, Identity Verification); implemented resilient patterns including circuit breakers, exponential backoff, and retry logic for high availability",
      "AI-augmented productivity: Leveraged LLM-assisted development (GitHub Copilot, GPT-4) for rapid prototyping and boilerplate generation while maintaining production code quality through systematic code review, refactoring, and performance optimization",
      "System maintenance & reliability: Maintained SureReach lead intelligence platform with zero critical incidents; delivered high-impact features including email notification system with templating engine, intelligent fallback mechanisms, and monitoring dashboards for faster incident resolution",
    ],
  },
];

export const WorkSection = () => {
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  const toggleExpand = (index: number) => {
    setExpanded((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="p-4">
      <style>{blinkingStyle}</style>
      <div className="bg-neutral-800 shadow-2xl w-[285px] sm:w-56 md:w-[440px] mx-auto rounded-xl mb-8 md:mb-14 px-4 sm:px-0">
        <div
          className={`bg-clip-text flex text-transparent justify-center items-center text-3xl sm:text-4xl md:text-5xl font-extrabold py-2.5 md:py-4 text-center text-black`}
          style={{ fontFamily: "Poppins" }}>
          <ShinyText text="Work Experience" disabled={false} speed={4} />
        </div>
      </div>

      <div className="relative py-6 md:py-12 px-3 mb-8 md:px-10">
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeInOut",
              }}
              viewport={{ once: true }}
              className="bg-neutral-900/40 border-neutral-800 backdrop-blur-md border rounded-xl p-3 md:p-6 transition-all duration-500">
              <div className="flex flex-row justify-between items-start mb-2 md:mb-3">
                <div>
                  <p className="text-neutral-100 text-sm md:text-2xl font-medium mb-1 md:mb-2 tracking-tight">
                    {exp.company}
                  </p>
                  <h3
                    className="text-neutral-400 flex gap-1 md:gap-2 items-center text-xs md:text-base tracking-tight"
                    style={{ fontFamily: "Poppins" }}>
                    <FaSuitcase className="text-gray-500 text-[10px] md:text-base" />
                    {exp.role}
                  </h3>
                </div>
                <span className="text-neutral-400 flex justify-center items-center text-[9px] md:text-sm px-1.5 md:px-3 py-[2px] md:py-1 rounded-full whitespace-nowrap ml-2  items-center">
                  {exp.duration}
                  {exp.duration.includes("Present") && (
                    <span className="blinking-light flex justify-center items-center inline-block w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full ml-1 md:ml-1.5"></span>
                  )}
                </span>
              </div>

              <p
                className="text-neutral-500 text-[11px] md:text-base mb-2 md:mb-4 leading-relaxed"
                style={{ fontFamily: "Poppins" }}>
                <span className="text-neutral-300">{exp.description}</span>
              </p>

              <button
                onClick={() => toggleExpand(index)}
                className="flex items-center gap-2 text-neutral-300 hover:text-blue-400 transition mb-3 text-sm md:text-base">
                <IoChevronDown
                  className={`transition-transform ${
                    expanded[index] ? "rotate-180" : ""
                  }`}
                />
                {expanded[index] ? "Hide Details" : "View Details"}
              </button>

              {expanded[index] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}>
                  <ul className="list-disc list-inside space-y-1 md:space-y-2 mb-3 md:mb-4">
                    {exp.responsibilities.map((resp, respIndex) => (
                      <li
                        key={respIndex}
                        className="text-neutral-400 text-[10px] md:text-sm leading-relaxed"
                        style={{ fontFamily: "Poppins" }}>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              <div className="flex flex-wrap gap-1 md:gap-2">
                {exp.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="text-[9px] md:text-sm px-1.5 md:px-3 py-[2px] md:py-1 bg-neutral-800/50 text-neutral-300 border-neutral-700 rounded-lg border">
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
