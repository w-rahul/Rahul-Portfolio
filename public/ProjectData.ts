
// import Image from 'next/image';
// import GatherHub from "./Images/Gatherhub.png"

// export const ProjectData : ProjectDetails[] = [
//     {
//         title : "GatherHub",
//         description : "Something about Gatherhub",
//         image : GatherHub,
//         icons : [GatherHub,GatherHub],
//     }
// ]

// console.log(ProjectData);

export const ProjectsData = [
    {
        name: 'Gatherhub',
        desc: "GatherHub project, a community event management application. This backend provides APIs for creating, managing, and registering for events, using a variety of modern technologies.",
        liveLink: 'https://rxhxul-gatherhub.vercel.app/login',
        githubLink: 'https://github.com/w-rahul/gather-hub.git',
        coverImg: '/Images/Gatherhub.png',
        imgs: [],
        tech: ["/ICONS/typescript.svg","/ICONS/prisma.svg","/ICONS/postgresql.svg","/ICONS/zod.svg", "/ICONS/react.svg", "/ICONS/tailwindcss.svg", ],
      },
      {
        name: 'Portfolio',
        desc: "The website you are currently on. A showcase of my full stack development skills with a focus on backend technologies.",
        githubLink: 'https://github.com/w-rahul/Rahul-Portfolio.git',
        coverImg: '/Images/Portfolio.png',
        imgs: [],
        tech: [ "/ICONS/typescript.svg","/ICONS/nextdotjs.svg","/ICONS/react.svg", "/ICONS/tailwindcss.svg", ],
      },
      {
        name: 'API-proxy-server',
        desc: "This project implements an API proxy server built with Express.js. It provides several key functionalities: API Proxying, Rate Limiting and Caching",
        githubLink: 'https://github.com/w-rahul/API-proxy-server.git',
        coverImg: '/Images/Api-proxy.png',
        imgs: [],
        tech: [ "/ICONS/typescript.svg","/ICONS/express.svg","/ICONS/nodedotjs.svg","/ICONS/postman.svg"],
      },{
        name: 'EchoInk',
        desc: "Full-stack blog platform built with modern web technologies. The backend is deployed on Cloudflare Workers using Hono.js and Accelerator for database connection pooling, with Prisma as the ORM and PostgreSQL for the database. The frontend is developed using React and Vite, styled with Tailwind CSS. Zod is used for data validation across both backend and frontend, and Wrangler is utilized for managing Cloudflare Workers.",
        liveLink: 'https://rxhxul-blog-app.vercel.app/',
        githubLink: 'https://github.com/w-rahul/Blog-app.gitt',
        coverImg: '/Images/Blog.png',
        imgs: [],
        tech:  ["/ICONS/typescript.svg","/ICONS/prisma.svg","/ICONS/postgresql.svg","/ICONS/zod.svg", "/ICONS/react.svg", "/ICONS/tailwindcss.svg", ],
      },
      {
        name: 'Payment-App',
        desc: "This project is designed to provide a simple payment system where users can create accounts, view other users, and send money",
        githubLink: 'https://github.com/w-rahul/Payment-app.git',
        coverImg: '/Images/Paytm.png',
        imgs: [],
        tech:  ["/ICONS/javascript.svg","/ICONS/mongodb.svg","/ICONS/zod.svg", "/ICONS/react.svg", "/ICONS/tailwindcss.svg" ],
      },
      {
        name: 'FreshSales-CRM-App',
        desc: "A project designed to implement CRUD operations for FreshSales CRM APIs. This application enables users to manage and modify customer contacts, allowing for efficient data handling and interaction management within the CRM system.",
        githubLink: 'https://github.com/w-rahul/Payment-app.git',
        coverImg: '/Images/FreshsalesCRM.png',
        imgs: [],
        tech:  ["/ICONS/typescript.svg","/ICONS/postman.svg", "/ICONS/nodedotjs.svg", "/ICONS/express.svg", "/ICONS/postgresql.svg" ],
      },
]