
export interface Skill {
    name : string
    logo : string
}

export interface SkillGroup {
    heading : string
    Skills : Skill[]
}

export const SkillGroups : SkillGroup[] = [
    {
        heading : "Languages",
        Skills : [
            {name : "JavaScript" , logo : "./components/assests/Logo-icons/javascript-js-seeklogo.svg"},
            {name : "TypeScript" , logo : "./components/assests/Logo-icons/typescript-seeklogo.svg"},
            {name : "C++" , logo : "./components/assests/Logo-icons/c-seeklogo.svg"}
        ]
    },
    {
        heading : "Libraries and frameworks",
        Skills : [
            {name : "express", logo : "./components/assests/Logo-icons/icons8-express-js.svg"},
            {name : "Prisma", logo : "./components/assests/Logo-icons/prisma-seeklogo.svg"},
            {name : "Zod", logo : "./components/assests/Logo-icons/zod-seeklogo.svg"},
            {name : "react", logo : "./components/assests/Logo-icons/react-seeklogo.svg"},
            {name : "tailwindcss", logo : "./components/assests/Logo-icons/tailwind-css-seeklogo.svg"},
            {name : "nextjs", logo : "./components/assests/Logo-icons/next-js-seeklogo.svg"},
        ]
    },
    {
        heading : "Databases",
        Skills : [
            {name : "Postgres", logo : "./components/assests/Logo-icons/postqresql-seeklogo.svg"},
            {name : "Mongodb", logo : "./components/assests/Logo-icons/mongodb-seeklogo.svg"}

        ]
    },
    {
        heading : "Tools and technologies",
        Skills : [
            {name : "git", logo : "./components/assests/Logo-icons/git-seeklogo.svg"},
            {name : "docker", logo : "./components/assests/Logo-icons/mongodb-seeklogo.svg"},
            {name : "Nodejs", logo : "./components/assests/Logo-icons/node-js-seeklogo.svg"},
            {name : "Postman", logo : "./components/assests/Logo-icons/postman-seeklogo.svg"}
        ]
    }
]