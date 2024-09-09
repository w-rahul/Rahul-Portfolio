"use client"

import TypingText from "./TypingText"

export const Landing = () =>{
    return <div className="flex flex-col justify-center h-screen text-center">
        <div className="flex justify-center">
             <div>
                <div className="text-3xl">
                    Hello, I am
                </div>
                <div className="pb-2 text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-600 to-purple-600"> 
                    Rahul Gupta 
                </div>
                <div className="">
                    <TypingText />
                </div>
             </div>
        </div>
    </div>
}