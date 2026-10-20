// Work facts come from public/rahul-resume.pdf. The personality copy is written in Rahul's voice for him to own.
export const profile = {
  name: "Rahul",
  email: "rahulguptaji1019@gmail.com",
  resume: "/rahul-resume.pdf",
  cal: "https://cal.com/rxhxul",
  site: "https://rxhxul.vercel.app",
  links: [
    { label: "github", href: "https://github.com/w-rahul" },
    { label: "linkedin", href: "https://www.linkedin.com/in/rahul-gupta-b9a003259/" },
    { label: "x", href: "https://x.com/rxhxul" },
  ],
};

export const rightNow = [
  "Shipping to prod",
  "On the badminton court",
  "Deep in an AAA story game",
  "One more episode",
  "Out on a ride",
  "At the gym",
];

export const sections = {
  about: { jp: "自己紹介", en: "self-introduction" },
  work: { jp: "仕事", en: "work" },
  how: { jp: "流儀", en: "my way of doing things" },
  stack: { jp: "技術", en: "skills" },
  play: { jp: "遊び", en: "play" },
  contact: { jp: "連絡", en: "get in touch" },
  connect: { jp: "連絡先", en: "where to find me" },
};

export const connect = [
  { icon: "github", label: "GitHub", handle: "w-rahul", href: "https://github.com/w-rahul" },
  { icon: "linkedin", label: "LinkedIn", handle: "rahul-gupta", href: "https://www.linkedin.com/in/rahul-gupta-b9a003259/" },
  { icon: "x", label: "X", handle: "@rxhxul", href: "https://x.com/rxhxul" },
  { icon: "mail", label: "Email", handle: "rahulguptaji1019@gmail.com", href: "mailto:rahulguptaji1019@gmail.com" },
  { icon: "calendar", label: "Book a call", handle: "cal.com/rxhxul", href: "https://cal.com/rxhxul" },
  { icon: "file", label: "Resume", handle: "rahul-resume.pdf", href: "/rahul-resume.pdf" },
];

export const roles = [
  {
    title: "SDE-2",
    when: "Jan 2026 → now",
    line: "I own the LLM document platform end to end, plus the workflow engine and billing. Leading a junior frontend dev.",
  },
  {
    title: "SDE-1",
    when: "Jan 2025 → Dec 2025",
    line: "E-signatures, verification APIs and the SureReach backend. Also an internal PDF RAG tool.",
  },
  { title: "Intern, Python", when: "Oct 2024 → Dec 2024", line: "Scraping and data extraction pipelines for SureReach." },
];

export const work = [
  {
    title: "SureParser",
    tag: "built it, run it",
    line: "LLM document platform. PDFs and images in, clean structured data out. Designed and built it, and I still run it pretty much solo.",
    preview: [
      "$ curl -F file=@invoice.pdf api/v1/parse",
      "> classify    invoice",
      "> split       3 docs",
      "> extract     42 fields",
      "ok callback   signed, 200",
    ],
  },
  {
    title: "Workflow engine",
    tag: "orchestration",
    line: "Customers chain split, extract, translate, routing, merge and human review into their own pipelines. Parallel steps, and the callback always lands.",
    preview: ["$ pipeline run kyc-onboarding", "> split", "> extract + translate   parallel", "> route > human review", "ok merge > callback"],
  },
  {
    title: "Billing rewrite",
    tag: "live migration",
    line: "Moved usage based billing to signed callbacks while traffic kept flowing. Zero clients broke. Tenant isolation and SSRF guards went in too.",
    preview: ["$ meter.usage +1 page", "> sign(callback)    hmac", "> tenant org_42     isolated", "ok clients broken  0"],
  },
  {
    title: "Verification APIs",
    tag: "integrations",
    line: "Identity, land record and credit checks. A pile of flaky upstream providers behind one clean endpoint with circuit breakers and retries.",
    preview: ["$ verify --identity", "> provider_a   timeout, retry", "> provider_b   503, breaker open", "ok provider_c   200 in 212ms"],
  },
  {
    title: "SureSign",
    tag: "Python + Java",
    line: "E-signatures with PFX certificates, face match and geo fencing, plus PDF tools that take heavy traffic every day.",
    preview: ["$ sign contract.pdf", "> pfx certificate    loaded", "> face_match         0.97", "> geo_fence          inside", "ok signed.pdf"],
  },
];

export const receipts = [
  { to: 40, suffix: "%", label: "Faster LLM responses", color: "text-kin" },
  { to: 30, prefix: "~", suffix: "%", label: "Fewer tokens", color: "text-ai" },
  { to: 0, label: "Clients broken in a live billing migration", color: "text-accent" },
  { to: 15, label: "Months from intern to SDE-2", color: "text-matcha" },
];

export const principles = [
  {
    kanji: "相棒",
    en: "partner",
    romaji: "aibo",
    color: "text-sakura",
    wide: true,
    title: "Agents write the first draft, I own the last one",
    body: "I built my own agent setup for work. Real tools, tight permissions, agents that dig through the code, draft the change and review each other before I even look. They do the work, I make them do it. It's how one dev runs a whole platform.",
  },
  {
    kanji: "引継",
    en: "handover",
    romaji: "hikitsugi",
    color: "text-accent",
    title: "Build it so anyone can take it over",
    body: "Good logs, written down decisions, nothing stuck in my head. If I take a week off, nothing waits on me.",
  },
  {
    kanji: "備え",
    en: "being prepared",
    romaji: "sonae",
    color: "text-ai",
    title: "Assume every API will fail",
    body: "Timeouts, retries and circuit breakers on every upstream. Providers go down all the time and our users never notice.",
  },
  {
    kanji: "地味",
    en: "plain on purpose",
    romaji: "jimi",
    color: "text-kin",
    title: "Boring stack, hard problems",
    body: "Postgres, Redis, Temporal. I spend my brain on the problem, not on whatever framework dropped this week.",
  },
  {
    kanji: "計測",
    en: "measurement",
    romaji: "keisoku",
    color: "text-matcha",
    title: "Measure before you argue",
    body: "Profile first, fix second. That's how our LLM responses got 40% faster on about 30% fewer tokens. No guessing.",
  },
];

export const stack = [
  { group: "languages", items: ["Python", "TypeScript", "JavaScript"] },
  { group: "backend", items: ["FastAPI", "Flask", "Node.js", "Express", "Next.js", "Prisma", "WebSocket"] },
  { group: "data", items: ["PostgreSQL", "MongoDB", "Redis", "S3"] },
  { group: "infra", items: ["Temporal", "Celery", "Docker", "CI/CD", "Git", "Zod"] },
  { group: "AI / LLM", items: ["LLM pipelines", "RAG", "Prompt design", "Latency tuning"] },
];

export const hobbies = [
  { id: "games", title: "Games", body: "Mostly AAA story games on my PC. This one's a Ghost of Tsushima style bamboo strike, minus the button prompts." },
  { id: "anime", title: "Anime", body: "JoJo is the reason my pfp looks like that." },
  { id: "rides", title: "Rides", body: "Royal Enfield Thunderbird. Weekend rides, no plan, just the thump." },
  { id: "gym", title: "Gym", body: "Lifting keeps me sane. Also helps with the smashes." },
];
