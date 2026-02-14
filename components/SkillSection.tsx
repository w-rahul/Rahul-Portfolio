"use client";

import ShinyText from "./ShinyText";
import { SkillGroups } from "./SkillData";
import { SkillGroup } from "./SkillGroup";

export const SkillsSection = () => {
  return (
    <div className="p-4 pb-8 md:pb-12">
      <div className="bg-neutral-800 shadow-2xl w-44 md:w-44 mx-auto rounded-xl mb-14 md:mb-20">
        <div
          className={`bg-clip-text text-transparent text-5xl md:text-6xl font-extrabold py-2 md:py-2 text-center  text-black`}
          style={{ fontFamily: "Poppins", fontWeight: "00" }}>
          <ShinyText text="Skills" disabled={false} speed={2} />
        </div>
      </div>
      {SkillGroups.map((group, index) => (
        <SkillGroup key={index} heading={group.heading} Skills={group.Skills} />
      ))}
    </div>
  );
};
