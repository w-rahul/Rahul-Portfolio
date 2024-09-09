import { SkillProp } from "./SkillData";
import  Image from "next/image"

export const Skills = ({ name, logo }: SkillProp) => {
  return <div className="m-1 flex items-center px-4 py-2 border rounded-lg  shadow-[0px_3px_1px_rgba(221,_221,_221,_1)]">
      <Image src={logo} alt={name} width={36} height={36}  className="w-9 h-9 mr-2 svg-white" />
      <p className="text-lg font-medium">{name}</p>
    </div>
}
