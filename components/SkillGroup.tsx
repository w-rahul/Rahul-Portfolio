import { Skills } from "./Skill"
import { SkillGroup as SkillGroupType } from "./SkillData"

export const SkillGroup = ({ heading, Skills: skills }: SkillGroupType) => {
  return <div className="mb-5">
      <h2 className="text-2xl font-bold text-center mb-2">{heading}</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {skills.map((skill, index) => (
          <Skills key={index} name={skill.name} logo={skill.logo} />
        ))}
      </div>
    </div>
}