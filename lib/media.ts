import fs from "node:fs";
import path from "node:path";

// The anime clips and the songs are local only (git-ignored), so a deploy ships without them.
// Server components read what's actually on disk, so nothing renders that would only play silence.
const list = (dir: string) => {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", dir))
      .filter((f) => f.endsWith(".mp3"))
      .map((f) => f.slice(0, -4));
  } catch {
    return [];
  }
};

export const localClips = () => list("voices");
export const localSongs = () => list("music");
