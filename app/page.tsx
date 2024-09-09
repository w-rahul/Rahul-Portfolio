import { Contactme } from "@/components/Contact"
import { Landing } from "@/components/Landing"
import { Navbar } from "@/components/Navbar"
import { Projects } from "@/components/Project"
import { SkillsSection } from "@/components/SkillSection"


export default function Home() {
  return (
    <div className="text-white w-full min-h-screen bg-black bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]">
      <div>
        <Navbar />
      </div>
      <div id="home" className="h-screen">
        <Landing />
      </div>
      <div id="skills" className="h-screen">
      <SkillsSection />
      </div>
      <div id="projects" >
        <Projects />
      </div>
      <div id="contact" >
        <Contactme />
      </div>
    </div>
  )
}
