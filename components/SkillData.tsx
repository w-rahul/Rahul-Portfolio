
export interface SkillProp {
    name : string
    logo : string
}

export interface SkillGroup {
    heading : string
    Skills : SkillProp[]
}

export const SkillGroups : SkillGroup[] = [
    {
        heading : "Languages",
        Skills : [
            {name : "JavaScript" , logo : "/ICONS/javascript.svg"},
            {name : "TypeScript" , logo : "/ICONS/typescript.svg"},
            {name : "C++" , logo : "/ICONS/cplusplus.svg"}
        ]
    },
    {
        heading : "Libraries and frameworks",
        Skills : [
            {name : "express", logo : "/ICONS/express.svg"},
            {name : "Prisma", logo : "/ICONS/prisma.svg"},
            {name : "Zod", logo : "/ICONS/zod.svg"},
            {name : "react", logo : "/ICONS/react.svg"},
            {name : "tailwindcss", logo : "/ICONS/tailwindcss.svg"},
            {name : "nextjs", logo : "/ICONS/nextdotjs.svg"},
        ]
    },
    {
        heading : "Databases",
        Skills : [
            {name : "Postgres", logo : "/ICONS/postgresql.svg"},
            {name : "Mongodb", logo : "/ICONS/mongodb.svg"}

        ]
    },
    {
        heading : "Tools and technologies",
        Skills : [
            {name : "git", logo : "/ICONS/git.svg"},
            {name : "docker", logo : "/ICONS/docker.svg"},
            {name : "Nodejs", logo : "/ICONS/nodedotjs.svg"},
            {name : "Postman", logo : "/ICONS/postman.svg"}
        ]
    }
]