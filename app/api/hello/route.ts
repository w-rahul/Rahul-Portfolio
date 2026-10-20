import { NextResponse } from "next/server";
import { profile } from "@/content/profile";

// Easter egg for people who read the console. Nothing is stored or forwarded.
const card = {
  name: profile.name,
  role: "Backend Engineer, SDE-2 @ Surepass Technologies",
  email: profile.email,
  calendar: profile.cal,
  github: profile.links[0].href,
  linkedin: profile.links[1].href,
};

export function GET() {
  return NextResponse.json({ ok: true, ...card, hint: "POST {name, message} here to say hi" });
}

export async function POST(req: Request) {
  let body: { name?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body must be json" }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ ok: false, error: "message is required" }, { status: 422 });
  if (message.length > 1000 || name.length > 80) {
    return NextResponse.json({ ok: false, error: "payload too large" }, { status: 413 });
  }
  return NextResponse.json(
    { ok: true, status: "accepted", from: name || "anonymous", next: `email me: ${profile.email}` },
    { status: 202 },
  );
}
