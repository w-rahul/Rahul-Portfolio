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

// import { GithubIcon, MailIcon } from "lucide-react"
// import Link from 'next/link'

// export const Contactme = () => {
//   return <div className=" flex flex-col justify-end">
//       <div className="text-center border rounded-full bg-zinc-950 m-4">
//         <div className="flex font-bold text-xl">
//           <div className="p-10 w-1/2 flex flex-col items-center">
//             <Link
//             target="_blank"
//             href={"mailto:rahulguptaji1019@gmail.com"}>
//                 <p>I do check emails regularly</p>
//                 <span className="flex items-center space-x-2">
//                   <MailIcon />
//                   <span>rahulguptaji1019@gmail.com</span>
//                 </span>
//             </Link>
//           </div>
//           <div className="p-10 w-1/2 flex flex-col items-center">
//             <Link 
//             target="blank"
//             href={"https://github.com/w-rahul"}>
//               <p>The place which has all my work</p>
//               <span className="flex items-center space-x-2">
//                 <GithubIcon />
//                 <span>github.com/w-rahul</span>
//               </span>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
// }

import { GithubIcon, MailIcon } from "lucide-react";
import Link from 'next/link';

export const Contactme = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white py-8">
      <div className="text-center border rounded-sm md:rounded-full bg-zinc-950 mx-4 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
          <div className="flex flex-col items-center w-full md:w-1/2 p-4">
            <Link
              target="_blank"
              href={"mailto:rahulguptaji1019@gmail.com"}
              className="flex flex-col items-center text-center"
            >
              <p className="text-lg md:text-xl font-medium">I do check emails regularly</p>
              <span className="flex items-center space-x-2 text-sm md:text-base">
                <MailIcon />
                <span>rahulguptaji1019@gmail.com</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/2 p-4">
            <Link
              target="_blank"
              href={"https://github.com/w-rahul"}
              className="flex flex-col items-center text-center"
            >
              <p className="text-lg md:text-xl font-medium">The place which has all my work</p>
              <span className="flex items-center space-x-2 text-sm md:text-base">
                <GithubIcon />
                <span>github.com/w-rahul</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
