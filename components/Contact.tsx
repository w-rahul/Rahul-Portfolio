// import { GithubIcon, MailIcon } from "lucide-react"

// export const Contactme = ()=>{
//     return <div className="flex flex-col justify-center">
//         <div className="text-center border rounded-full bg-zinc-950">
//             <div className="flex font-bold text-xl">
//                 <div className="p-10 w-1/2 ">
//                 <p> I do check emails regulary</p>
//                     rahulguptaji1019@gmail.com
//                     <span> <MailIcon /></span>
//                 </div>
//                 <div className="p-10 w-1/2 ">
//                 <p>The place which has all my work</p>
//                     github.com/w-rahul
//                     <span> <GithubIcon /> </span>
//                 </div>
//             </div>
//         </div>
//     </div>
// }
import { GithubIcon, MailIcon } from "lucide-react";

export const Contactme = () => {
  return (
    <div className="min-h-screen flex flex-col justify-end">
      <div className="text-center border rounded-full bg-zinc-950 m-4">
        <div className="flex font-bold text-xl">
          <div className="p-10 w-1/2 flex flex-col items-center">
            <p>I do check emails regularly</p>
            <span className="flex items-center space-x-2">
              <MailIcon />
              <span>rahulguptaji1019@gmail.com</span>
            </span>
          </div>
          <div className="p-10 w-1/2 flex flex-col items-center">
            <p>The place which has all my work</p>
            <span className="flex items-center space-x-2">
              <GithubIcon />
              <span>github.com/w-rahul</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
