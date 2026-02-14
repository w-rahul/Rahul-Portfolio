"use client";

import ShinyText from "./ShinyText";

export const About = () => {
  return (
    <div className="p-4 md:p-12 mt-72 md:mt-0 mb-16 md:mb-20">
      <div className="bg-neutral-800 shadow-2xl w-44 md:w-56 mx-auto rounded-xl mb-12 md:mb-16">
        <div
          className={`bg-clip-text text-transparent text-4xl md:text-5xl font-extrabold py-2 md:py-3 text-center text-black`}
          style={{ fontFamily: "Poppins", fontWeight: "900" }}>
          <ShinyText text="About" disabled={false} speed={2} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <div className="space-y-6 md:space-y-8">
          <p
            className="text-neutral-400 text-sm md:text-base leading-relaxed text-center"
            style={{ fontFamily: "Poppins" }}>
            Hey! I&apos;m Rahul Gupta, CS graduate from Delhi. Backend
            development is my jam—APIs, microservices, system design, all that
            good stuff.
          </p>

          <p
            className="text-neutral-400 text-sm md:text-base leading-relaxed text-center"
            style={{ fontFamily: "Poppins" }}>
            I&apos;m comfortable with the full stack, but backend is where I
            really vibe. I code with LLMs and believe in vibecoding. Let AI
            handle the boring parts while I focus on building the actual
            solution. It&apos;s about being productive and enjoying the process,
            not fighting with syntax.
          </p>

          <p
            className="text-neutral-400 text-sm md:text-base leading-relaxed text-center"
            style={{ fontFamily: "Poppins" }}>
            Love exploring new tech, breaking things to learn how they work, and
            shipping code that matters.
          </p>
        </div>
      </div>
    </div>
  );
};
