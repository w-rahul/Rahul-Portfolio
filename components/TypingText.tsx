
import React, { useEffect, useRef } from "react";
import Typed from "typed.js";

const TypingText = () => {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "Backend Developer .",
        "Full Stack Developer .",
        "Software Engineer .",

      ],
      typeSpeed: 50,
      backSpeed: 30,
      loop: false,
    });

    return () => {
      typed.destroy(); 
    };
  }, []);

  return (
    <div className="text-4xl text-center">
      <span>I am a </span>
      <span className="font-sharp text-violet-500 font-bold" ref={typedRef}></span>
    </div>
  );
};

export default TypingText;
