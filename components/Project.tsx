"use client";

import { ProjectsData } from "@/public/ProjectData";
import { SingleProject } from "./SingleProject";
import ShinyText from "./ShinyText";

// export const Projects = () => {

//     console.log("ProjectData in Projects component:", ProjectData);

//   return (
//     <div className="flex flex-wrap justify-center gap-4">
//       {ProjectData.map((project: ProjectDetails, index: number) => (
//         <SingleProject
//           key={index}
//           title={project.title}
//           description={project.description}
//           image={project.image}
//           icons={project.icons}
//         />
//       ))}
//     </div>
//   );
// };

export const Projects = () => {
  return (
    <>
      <section id="projects" className=" dark:text-white">
          
    <div
        className="bg-neutral-800 shadow-2xl w-60 md:w-64 mx-auto rounded-xl mb-14 md:mb-20"
      >
     <div
          className={`bg-clip-text text-transparent text-5xl md:text-5xl font-extrabold py-2 md:py-4 text-center  text-black`}
          style={{ fontFamily: "Poppins" }}
        >
          <ShinyText text="Projects" disabled={false} speed={2} />
        </div>
      </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-center gap-10 container mx-auto">
          {ProjectsData.map((project) => (
            <SingleProject {...project} key={project.name} />
          ))}
        </div>
      </section>
    </>
  );
};
