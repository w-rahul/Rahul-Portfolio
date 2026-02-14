import { Skills } from "./Skill"
import { SkillGroup as SkillGroupType } from "./SkillData"

export const SkillGroup = ({ heading, Skills: skills }: SkillGroupType) => {
  return <div className="mb-7">
      <h2 className="text-md text-neutral-300 md:text-xl font-normal text-center mb-2" 
      style={{ fontFamily: "Poppins"}}>{heading}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {skills.map((skill, index) => (
          <Skills key={index} name={skill.name} color={skill.color} />
        ))}
      </div>
    </div>
}