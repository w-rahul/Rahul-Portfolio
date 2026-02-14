import { DiPython, DiNodejs, DiDocker, DiGit } from "react-icons/di";
import {
  SiTypescript,
  SiCplusplus,
  SiExpress,
  SiPrisma,
  SiZod,
  SiReact,
  SiTailwindcss,
  SiNextdotjs,
  SiPostgresql,
  SiMongodb,
  SiPostman,
  SiMysql,
  SiFastapi,
  SiFlask,
  SiTemporal,
  SiClerk,
} from "react-icons/si";
import { ReactNode } from "react";
import { RiJavascriptFill } from "react-icons/ri";

export interface SkillProp {
  name: string;
  color: string;
}

export interface SkillGroup {
  heading: string;
  Skills: SkillProp[];
}

export const iconMap: { [key: string]: ReactNode } = {
  Python: <DiPython className="text-blue-500" />,
  JavaScript: <RiJavascriptFill className="text-yellow-400" />,
  TypeScript: <SiTypescript className="text-blue-500" />,
  "C++": <SiCplusplus className="text-blue-600" />,
  express: <SiExpress className="text-gray-500" />,
  Prisma: <SiPrisma className="text-purple-400" />,
  Zod: <SiZod className="text-pink-400" />,
  FastAPI: <SiFastapi className="text-cyan-400" />,
  Flask: <SiFlask className="text-gray-500" />,
  react: <SiReact className="text-cyan-400" />,
  tailwindcss: <SiTailwindcss className="text-sky-400" />,
  nextjs: <SiNextdotjs className="text-gray-700" />,
  Postgres: <SiPostgresql className="text-blue-600" />,
  Mongodb: <SiMongodb className="text-green-600" />,
  Temporal: <SiTemporal className="text-purple-600" />,
  git: <DiGit className="text-orange-500" />,
  docker: <DiDocker className="text-sky-500" />,
  Nodejs: <DiNodejs className="text-green-600" />,
  Postman: <SiPostman className="text-amber-500" />,
  MySQL: <SiMysql className="text-sky-400" />,
  Celery: <SiClerk className="text-green-700" />,
};

export const SkillGroups: SkillGroup[] = [
  {
    heading: "Languages",
    Skills: [
      { name: "Python", color: "#3776AB" },
      { name: "JavaScript", color: "#F7DF1E" },
      { name: "TypeScript", color: "#3178C6" },
      { name: "C++", color: "#00599C" },
    ],
  },
  {
    heading: "Libraries and frameworks",
    Skills: [
      { name: "express", color: "#000000" },
      { name: "Prisma", color: "#2D3748" },
      { name: "Zod", color: "#3E67AC" },
      { name: "FastAPI", color: "#000000" },
      { name: "Flask", color: "#000000" },
      { name: "react", color: "#61DAFB" },
      { name: "tailwindcss", color: "#06B6D4" },
      { name: "nextjs", color: "#000000" },
    ],
  },
  {
    heading: "Databases",
    Skills: [
      { name: "Postgres", color: "#336791" },
      { name: "Mongodb", color: "#13AA52" },
      { name: "MySQL", color: "#00758F" },
    ],
  },
  {
    heading: "Tools and technologies",
    Skills: [
      { name: "git", color: "#F1502F" },
      { name: "docker", color: "#2496ED" },
      { name: "Nodejs", color: "#339933" },
      { name: "Postman", color: "#FF6C37" },
      { name: "Celery", color: "#000000" },
      { name: "Temporal", color: "#000000" },
    ],
  },
];
