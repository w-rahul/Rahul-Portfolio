import { Landing } from "@/components/Landing"
import { Navbar } from "@/components/Navbar"
import { Projects } from "@/components/Project"


export default function Home() {
  return (
    <div className="text-white w-full min-h-screen bg-black bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]">
      <div>
        <Navbar />
      </div>
      <div id="home" className="h-screen">
        <Landing />
      </div>
      <div id="projects" className="h-screen">
        <Projects />
      </div>
      <div id="skills" className="h-screen">
        Skills
      </div>
      <div id="contact" className="h-screen">
        Contact
      </div>
    </div>
  )
}
