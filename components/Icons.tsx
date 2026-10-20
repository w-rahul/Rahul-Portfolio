"use client";

import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import {
  LuArrowUpRight,
  LuBrain,
  LuCalendar,
  LuClock,
  LuCloud,
  LuFileText,
  LuMail,
  LuMapPin,
  LuRadio,
  LuSparkles,
  LuWorkflow,
  LuZap,
} from "react-icons/lu";
import {
  SiCelery,
  SiDocker,
  SiExpress,
  SiFastapi,
  SiFlask,
  SiGit,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiRedis,
  SiTemporal,
  SiTypescript,
  SiZod,
} from "react-icons/si";
import type { IconType } from "react-icons";

// icon + the color it shows in (brand colors, nudged brighter where needed to read on black)
const ICONS: Record<string, [IconType, string?]> = {
  github: [FaGithub, "#f0f0f0"],
  linkedin: [FaLinkedin, "#3b8fe6"],
  x: [FaXTwitter, "#f0f0f0"],
  mail: [LuMail, "rgb(var(--sakura))"],
  calendar: [LuCalendar, "rgb(var(--matcha))"],
  file: [LuFileText, "rgb(var(--kin))"],
  pin: [LuMapPin],
  clock: [LuClock],
  arrow: [LuArrowUpRight],
  python: [SiPython, "#4b8bbe"],
  typescript: [SiTypescript, "#3178c6"],
  javascript: [SiJavascript, "#f7df1e"],
  fastapi: [SiFastapi, "#05a493"],
  flask: [SiFlask, "#f0f0f0"],
  "node.js": [SiNodedotjs, "#5fa04e"],
  express: [SiExpress, "#f0f0f0"],
  "next.js": [SiNextdotjs, "#f0f0f0"],
  prisma: [SiPrisma, "#7d87e8"],
  websocket: [LuRadio, "rgb(var(--sakura))"],
  postgresql: [SiPostgresql, "#5b8def"],
  mongodb: [SiMongodb, "#47a248"],
  redis: [SiRedis, "#e8483d"],
  s3: [LuCloud, "#ff9900"],
  temporal: [SiTemporal, "#f0f0f0"],
  celery: [SiCelery, "#62b35f"],
  docker: [SiDocker, "#2496ed"],
  "ci/cd": [LuWorkflow, "rgb(var(--kin))"],
  git: [SiGit, "#f05032"],
  zod: [SiZod, "#6b8fe0"],
  "llm pipelines": [LuSparkles, "rgb(var(--sakura))"],
  rag: [LuBrain, "rgb(var(--ai))"],
  "prompt design": [LuZap, "rgb(var(--kin))"],
  "latency tuning": [LuClock, "rgb(var(--matcha))"],
};

export function Icon({ name, className = "", colored = false }: { name: string; className?: string; colored?: boolean }) {
  const entry = ICONS[name.toLowerCase()];
  if (!entry) return null;
  const [Cmp, color] = entry;
  return <Cmp aria-hidden className={className} style={colored && color ? { color } : undefined} />;
}
