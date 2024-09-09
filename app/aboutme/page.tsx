import { Navbar } from "@/components/Navbar";

export default function aboutme  () {
    return <div className=" flex flex-col justify-center text-white w-full h-screen bg-black bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] overflow-auto">
        <Navbar />
        <div className="flex flex-col items-center justify-start pt-48 pb-10">
        <div className="text-7xl py-6 font-semibold">
            About me
        </div>
        <div className="w-4/12 flex justify-center border rounded-3xl mx-auto px-10 py-6">
            <div className="text-2xl font-thin">
                <p className="pb-4"> Hi! I am Rahul Gupta, a CS graduate. I currently live in America and was raised here as well.</p> 
               <p className="pb-4"> While being comfortable with frontend work, my real passion lies in backend development. </p>  
               <p className="pb-4"> I love creating and improving the systems that drive applications from behind the scenes.</p> 
               <p className="pb-4"> Currently, looking for new opportunities to dive deeper into Full-stack/backend projects and collaborate on exciting challenges.</p> 
               <p className="pb-4"> If you are interested in working together or just want to chat about tech, feel free to reach out! </p> 
            </div>
        </div>
    </div>
</div>

}