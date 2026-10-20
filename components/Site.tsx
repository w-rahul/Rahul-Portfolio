import Image from "next/image";
import { localClips } from "@/lib/media";
import { connect, hobbies, principles, profile, receipts, rightNow, roles, sections, stack, work } from "@/content/profile";
import { Badminton } from "./Badminton";
import { Counter, RoleCycler, Year } from "./Bits";
import { Icon } from "./Icons";
import { Jp } from "./Jp";
import { Stretchy } from "./Stretchy";
import { MahoragaBanner } from "./MahoragaBanner";
import { BambooCut, Deadlift, PowerUp, ThunderbirdRide } from "./MiniGames";
import { Clock, CrtToggle, Header, PaletteHint } from "./Shell";
import { WorkList } from "./WorkList";

const ext = { target: "_blank", rel: "noreferrer" } as const;

type Tone = "accent" | "ai" | "kin" | "sakura" | "matcha";

function Section({
  id,
  title,
  tone,
  children,
}: {
  id: keyof typeof sections;
  title: string;
  tone: Tone;
  children: React.ReactNode;
}) {
  const s = sections[id];
  return (
    <section id={id} data-spy className="sl-top relative" style={{ "--tone": `var(--${tone})` } as React.CSSProperties}>
      <div className="sl-bottom relative flex items-baseline justify-between px-5 py-4 sm:px-6">
        <h2 className="sec-label sec-title text-[30px] leading-none text-fg">{title}</h2>
        <Jp en={s.en} className="sec-jp text-[16px]">
          {s.jp}
        </Jp>
      </div>
      <div data-reveal className="px-5 py-6 sm:px-6 sm:py-7">
        {children}
      </div>
    </section>
  );
}

const games: Record<string, React.ReactNode> = {
  games: <BambooCut />,
  anime: <PowerUp />,
  rides: <ThunderbirdRide />,
  gym: <Deadlift />,
};

export function Site() {
  // the power-up only shows where its clips exist, they're local only
  const clips = localClips().length > 0;
  return (
    <>
      <Header />
      <main id="top" className="col">
        <section className="relative">
          <div className="sl-bottom relative h-[200px] overflow-hidden sm:h-[240px]">
            <MahoragaBanner />
          </div>
          <div className="relative px-5 pb-7 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div className="avatar -mt-12">
                <Image src="/rahul.jpg" alt="Rahul" width={104} height={104} priority />
                <span className="avatar-go go-a" aria-hidden>
                  ゴ
                </span>
                <span className="avatar-go go-b" aria-hidden>
                  ゴ
                </span>
              </div>
              <div className="hero-now">
                <p className="flex items-center justify-end gap-2 text-[13px] text-fg">
                  <span className="now-dot" aria-hidden />
                  Currently at Surepass
                </p>
                <p className="mt-1 text-[12px] text-muted">
                  {roles[0].title} · since {roles[0].when.split(" → ")[0]}
                </p>
              </div>
            </div>
            <h1 data-reveal className="mt-4 flex items-baseline gap-3 font-serif text-[44px] leading-none text-fg">
              Rahul
              <Jp en="rahul" className="text-[16px] text-sakura">
                ラフル
              </Jp>
            </h1>
            <p data-reveal className="mt-3 text-[15px] text-fg/85">
              Backend engineer · SDE-2 at Surepass
            </p>
            <p data-reveal className="mt-1 font-serif text-[20px] italic text-muted">
              I go <span className="text-accent">all in</span>. At work, in game, on court.
            </p>
            <p data-reveal className="label mt-4">
              rn <span className="text-dim">/</span> <RoleCycler words={rightNow} />
            </p>
            <p data-reveal className="info mt-5 text-[14px] text-muted">
              <Icon name="pin" />
              Delhi, India · <Clock /> IST
            </p>
            <div data-reveal className="mt-6 flex flex-wrap gap-2">
              <a href={profile.cal} {...ext} className="btn btn-primary">
                <Icon name="calendar" /> Book a call
              </a>
              <a href={profile.resume} {...ext} className="btn">
                <Icon name="file" colored /> Resume
              </a>
            </div>
          </div>
        </section>

        <Section id="about" title="About" tone="sakura">
          <div className="space-y-4 text-[15px] leading-[1.75] text-muted">
            <p>
              I got into code through games. First it was tweaking settings and breaking mods on my PC, and somewhere along the
              way I cared more about how things worked than about playing them.
            </p>
            <p>
              At Surepass I went from intern to <span className="text-fg">SDE-2 in 15 months</span>. I like owning things end to
              end, and I build everything so anyone could take it over tomorrow without calling me.
            </p>
            <p>
              Outside work it&apos;s <span className="text-fg">AAA games, anime, long rides, the gym</span>, and a lot of
              badminton.
            </p>
          </div>
        </Section>

        <Section id="work" title="Work" tone="accent">
          <div className="flex gap-4">
            <div className="logo" aria-hidden>
              <Image src="/logos/surepass.png" alt="" width={40} height={40} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-[16px] text-fg">Surepass Technologies</p>
                <p className="label text-dim">Delhi · Oct 2024 → now</p>
              </div>
              <ol className="timeline mt-4">
                {roles.map((r, i) => (
                  <li key={r.title} className={i === 0 ? "current" : ""}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <p className="text-[15px] text-fg">{r.title}</p>
                      <p className="label text-dim">{r.when}</p>
                    </div>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted">{r.line}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="receipts mt-8">
            {receipts.map((r) => (
              <div key={r.label}>
                <p className={`font-serif text-[34px] leading-none ${r.color}`}>
                  <Counter to={r.to} prefix={r.prefix} suffix={r.suffix} />
                </p>
                <p className="mt-2 text-[12px] leading-snug text-muted">{r.label}</p>
              </div>
            ))}
          </div>

          <p className="label mb-1 mt-9 text-dim">Things I built · hover a row</p>
          <WorkList items={work} />
        </Section>

        <Section id="how" title="How I work" tone="kin">
          <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {principles.map((p, i) => (
              <li key={p.title} className={`kcard bg-bg ${p.wide ? "sm:col-span-2" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <Jp en={p.en} className={`kanji tip-right ${p.color}`}>
                    {p.kanji}
                  </Jp>
                  <span className="label text-dim">
                    0{i + 1} · {p.romaji}
                  </span>
                </div>
                <h3 className="mt-3 text-[15px] font-medium text-fg">{p.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{p.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="stack" title="Stack" tone="ai">
          <p className="label mb-4 text-dim">grab any skill and pull it. it snaps back</p>
          <Stretchy>
          <div className="space-y-4">
            {stack.map((g) => (
              <div key={g.group} className="grid gap-2 sm:grid-cols-[100px_1fr] sm:items-start">
                <p className="label pt-1.5 text-dim">{g.group}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {g.items.map((item) => (
                    <li key={item} className="chip">
                      <Icon name={item} colored />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          </Stretchy>
        </Section>

        <Section id="play" title="Off the clock" tone="matcha">
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line">
            <div className="bg-bg p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[15px] text-fg">Badminton</p>
                <p className="label text-dim">I&apos;m really good. Take one point off me.</p>
              </div>
              <div className="mt-4">
                <Badminton />
              </div>
            </div>
            <div className="grid gap-px bg-line sm:grid-cols-2">
              {hobbies.map((h) => (
                <div key={h.id} className="flex flex-col bg-bg p-5">
                  <p className="text-[15px] text-fg">{h.title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{h.body}</p>
                  {(h.id !== "anime" || clips) && <div className="flex flex-1 flex-col justify-end pt-4">{games[h.id]}</div>}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="contact" title="Contact" tone="accent">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-serif text-[40px] leading-none text-fg">
                Say hi<span className="text-accent">.</span>
              </p>
              <p className="mt-3 max-w-[32rem] text-[15px] leading-relaxed text-muted">
                Open to remote roles, and to moving for the right team. Founders, recruiters, devs, whoever. I actually reply.
              </p>
            </div>
            <Jp en="rahul's seal" vertical className="hanko">
              ラフル
            </Jp>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <a href={`mailto:${profile.email}`} className="btn btn-primary">
              <Icon name="mail" /> {profile.email}
            </a>
            <a href={profile.cal} {...ext} className="btn">
              <Icon name="calendar" colored /> Book a call
            </a>
          </div>
        </Section>

        <Section id="connect" title="Connect" tone="ai">
          <ul className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {connect.map((c) => (
              <li key={c.label} className="bg-bg">
                <a href={c.href} {...(c.href.startsWith("http") ? ext : {})} className="link-row">
                  <span className="link-ico">
                    <Icon name={c.icon} colored />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] text-fg">{c.label}</span>
                    <span className="block truncate text-[13px] text-muted">{c.handle}</span>
                  </span>
                  <Icon name="arrow" className="link-arr" />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <div className="sl-top relative flex items-baseline gap-3 px-5 py-5 sm:px-6">
          <Jp en="made by hand" className="flex-none text-[15px] text-accent">
            自作
          </Jp>
          <p className="text-[13px] leading-relaxed text-muted">
            I designed and built this whole thing from scratch, from the ASCII Mahoraga to the Thunderbird&apos;s exhaust note. No
            templates, no UI kit.
          </p>
        </div>

        <footer className="sl-top relative flex flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-6">
          <p className="label text-dim">
            © <Year built={new Date().getFullYear()} /> Rahul{" "}
            <Jp en="rahul" className="normal-case">
              ラフル
            </Jp>
          </p>
          <div className="label flex items-center gap-4">
            <CrtToggle />
            <PaletteHint />
          </div>
        </footer>
      </main>
    </>
  );
}
