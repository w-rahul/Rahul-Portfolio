"use client";

import {
  RiGithubFill,
  RiLinkedinBoxFill,
  RiTwitterXFill,
  RiInstagramLine,
} from "react-icons/ri";
import { Home } from "lucide-react";

export const Header = () => {
  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 backdrop-blur-md bg-neutral-900/70 border border-neutral-800 rounded-lg px-6 md:py-4.5 py-4 flex items-center gap-3 hover:gap-6 shadow-lg transition-all duration-300">
      <div className="flex justify-center items-center md:gap-4 gap-3">
        <a
          href="#"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-neutral-300 hover:text-white transition">
          <Home className="w-5 h-5" />
        </a>

        <span className="bg-neutral-500 h-5 w-[1px]"></span>

        <a
          href="https://github.com/w-rahul"
          target="_blank"
          className="text-neutral-300 hover:text-white transition">
          <RiGithubFill className="text-xl" />
        </a>

        <a
          href="https://www.linkedin.com/in/rahul-gupta-b9a003259/"
          target="_blank"
          className="text-neutral-300 hover:text-white transition">
          <RiLinkedinBoxFill className="text-xl" />
        </a>

        <a
          href="https://x.com/rxhxul"
          target="_blank"
          className="text-neutral-300 hover:text-white transition">
          <RiTwitterXFill className="text-xl" />
        </a>

        <a
          href="https://www.instagram.com/rxhulxg/"
          target="_blank"
          className="text-neutral-300 hover:text-white transition">
          <RiInstagramLine className="text-xl" />
        </a>
      </div>
    </div>
  );
};
