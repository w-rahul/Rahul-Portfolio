"use client";

import { FileText } from "lucide-react";
import { motion } from "motion/react";
import { HiExternalLink } from "react-icons/hi";

export const Landing = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full text-center px-4">
      <div className="flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut", delay: 0.1 }}>
          <p
            className="text-2xl sm:text-xl md:text-4xl text-neutral-400 mb-4"
            style={{ fontFamily: "Poppins" }}>
            Hey there 👋
          </p>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1 }}
          className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600"
          style={{ fontFamily: "Poppins" }}>
          I&apos;m Rahul
        </motion.h2>
        <div className="flex justify-between items-center gap-6 md:gap-8">
          <a
            href="/rahul-gupta-resume.docx"
            download
            className="mt-16 flex justify-center items-center px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-300">
            <p
              className="text-lg text-neutral-300 font-medium"
              style={{ fontFamily: "Poppins" }}>
              Resume
            </p>
            <div className="flex justify-between items-center">
              <p>
                <FileText className="ml-2 text-neutral-300 size-5" />
              </p>
            </div>
          </a>
          <button
            onClick={() => window.open("https://cal.com/rxhxul")}
            className="mt-16 flex justify-center items-center px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-300">
            <p
              className="text-lg text-neutral-300 font-medium"
              style={{ fontFamily: "Poppins" }}>
              Book a meet
            </p>
            <HiExternalLink className="ml-2 text-neutral-200 size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
