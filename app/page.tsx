import { Landing } from "@/components/Landing";
import { Header } from "@/components/Navbar";
import { Projects } from "@/components/Project";
import { SkillsSection } from "@/components/SkillSection";
import { WorkSection } from "@/components/WorkExperience";
import { About } from "@/components/AboutMe";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <div className="text-white w-full min-h-screen bg-black ">
      <div>
        <Header />
      </div>
      <div id="home" className="h-screen">
        <Landing />
      </div>
      <div>
        <WorkSection />
      </div>
      <div id="skills" className="h-screen">
        <SkillsSection />
      </div>
      <div className="mt-20 md:mt-32">
        <About />
      </div>
      <div id="projects" className="mt-28 sm:mt-0">
        <Projects />
      </div>
      <div id="contact">
        <Contact />
      </div>
    </div>
  );
}
