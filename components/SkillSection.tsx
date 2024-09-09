import { SkillGroups } from "./SkillData";
import { SkillGroup } from "./SkillGroup";


export const SkillsSection = () => {
  return <div className="p-4">
    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold dark:text-white text-center p-10">Technical Skills</h1>
      {SkillGroups.map((group, index) => (
        <SkillGroup key={index} heading={group.heading} Skills={group.Skills} />
      ))}
    </div>
};
