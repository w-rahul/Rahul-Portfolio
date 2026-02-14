import { SkillProp, iconMap } from "./SkillData";

export const Skills = ({ name }: SkillProp) => {
  return (
    <div className="m-1 flex items-center px-2.5 py-2 rounded-lg border-2 border-dotted border-white ">
      <div className="w-6 h-6 mr-2 flex items-center justify-center text-2xl">
        {iconMap[name]}
      </div>
      <p className="text-md font-medium">{name}</p>
    </div>
  );
};
