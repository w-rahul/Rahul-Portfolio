// import { ProjectData } from "@/public/utils/ProjectData";
// import { ProjectDetails, SingleProject } from "./SingleProject";

import { ProjectsData } from "@/public/ProjectData";
import { SingleProject } from "./SingleProject";

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
      <section id="projects" className=" dark:text-white py-32">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold dark:text-white text-center p-10">
          My Projects
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-center gap-10 container mx-auto">
          {ProjectsData.map((project) => (
            <SingleProject {...project} key={project.name} />
          ))}
        </div>
      </section>
    </>
  );
};