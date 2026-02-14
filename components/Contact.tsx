"use client";

import ShinyText from "./ShinyText";

export const Contact = () => {
  return (
    <div className="p-10 md:p-20">
      <div className="bg-neutral-800 shadow-2xl w-56 md:w-64 mx-auto rounded-xl mb-8 md:mb-14">
        <div
          className={`bg-clip-text text-transparent text-4xl md:text-5xl font-extrabold py-2.5 md:py-3 text-center text-black`}
          style={{ fontFamily: "Poppins", fontWeight: "900" }}>
          <ShinyText text="Contact" disabled={false} speed={2} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto text-center space-y-2">
        <p
          className="text-neutral-400 text-sm md:text-base"
          style={{ fontFamily: "Poppins" }}>
          Reach me via email
        </p>

        <a
          href="mailto:rahulguptaji1019@gmail.com"
          className="inline-block text-neutral-200 hover:text-neutral-400 transition text-base md:text-lg font-medium"
          style={{ fontFamily: "Poppins" }}>
          rahulguptaji1019@gmail.com
        </a>
      </div>
    </div>
  );
};
