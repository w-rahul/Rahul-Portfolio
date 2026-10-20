import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { CommandPalette, Motion } from "@/components/Shell";
import { AsciiCursor } from "@/components/AsciiCursor";
import { GutterAscii } from "@/components/GutterAscii";
import { Jukebox } from "@/components/Jukebox";
import { profile } from "@/content/profile";
import { localClips, localSongs } from "@/lib/media";
import "./globals.css";

const sans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-sans", weight: "100 900", display: "swap" });
const mono = localFont({ src: "./fonts/DepartureMono-Regular.woff2", variable: "--font-mono", display: "swap" });
const serif = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", style: "normal", weight: "400" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", style: "italic", weight: "400" },
  ],
  variable: "--font-serif",
  display: "swap",
});
// subset to just the japanese characters the site uses, so each is a few kb
const jp = localFont({ src: "./fonts/ShipporiMincho-jp.woff2", variable: "--font-jp", weight: "700", display: "swap" });
const jpHeavy = localFont({ src: "./fonts/DelaGothicOne-jp.woff2", variable: "--font-jp-heavy", display: "swap" });
// comic lettering for the english lines in the anime moments
const bang = localFont({ src: "./fonts/Bangers-latin.woff2", variable: "--font-bang", display: "swap" });

const title = "Rahul · Backend Engineer";
const description = "backend engineer from delhi. sde-2 at surepass. all in, at work and off the clock.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.site),
  title,
  description,
  openGraph: { title, description, url: "/", siteName: "rahul", type: "website" },
  twitter: { card: "summary_large_image", title, description, creator: "@rxhxul" },
};

export const viewport: Viewport = { themeColor: "#0a0a0a" };

// Runs before paint: marks js and restores crt mode.
const preload = `try{var d=document.documentElement;d.classList.add('js');if(localStorage.getItem('crt')==='1')d.classList.add('crt')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // clips and songs are local only, so the page only offers what's on disk
  const clips = localClips();
  const songs = localSongs();
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${serif.variable} ${jp.variable} ${jpHeavy.variable} ${bang.variable}`}
      data-clips={clips.join(" ")}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: preload }} />
      </head>
      <body>
        <GutterAscii />
        <div id="shake-root">{children}</div>
        <Motion />
        <CommandPalette anime={clips.length > 0} />
        <AsciiCursor />
        {songs.length > 0 && <Jukebox songs={songs} />}
        <div className="crt-fx" aria-hidden />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
