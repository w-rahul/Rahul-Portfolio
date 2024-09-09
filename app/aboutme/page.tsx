import { Navbar } from "@/components/Navbar";

export default function AboutMe() {
  return (
    <div className="text-center flex flex-col justify-center text-white w-full min-h-screen bg-black bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] overflow-auto">
      <Navbar />
      <div className="flex flex-col items-center justify-center pt-16 pb-10 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-center py-6">
          About Me
        </div>
        <div className="w-full max-w-4xl flex flex-col md:flex-row justify-center border rounded-3xl mx-auto px-4 py-6 sm:px-6 lg:px-10">
          <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-light">
            <p className="pb-4">Hi! I am Rahul Gupta, a CS graduate. I currently live in America and was raised here as well.</p>
            <p className="pb-4">While being comfortable with frontend work, my real passion lies in backend development. I love creating and improving the systems that drive applications from behind the scenes.</p>
            <p className="pb-4">Currently, looking for new opportunities to dive deeper into Full-stack/backend projects and collaborate on exciting challenges.</p>
            <p className="pb-4">If you are interested in working together or just want to chat about tech, feel free to reach out!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
