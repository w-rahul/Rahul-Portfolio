import { Landing } from "@/components/Landing";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="text-white w-full h-screen bg-black bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]">
    <div>
    <div>
      <Navbar />
    </div>
    <div>
      <Landing />
    </div>
    </div>
  </div>
  )
}
