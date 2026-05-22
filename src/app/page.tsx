import Link from "next/link";

const testimonials = [
  {
    quote:
      "ProfConnect helped me find three exceptional undergraduates for my computational biology lab in under a week. The quality of applicants is unlike anything I've seen on other platforms.",
    name: "Dr. Amelia Chen",
    title: "Associate Professor of Computational Biology",
    institution: "Stanford University",
    role: "Professor",
  },
  {
    quote:
      "As an international student, I worried I'd never break into research. I applied to a project on ProfConnect and now I co-author papers with a professor in Zurich. It changed my trajectory.",
    name: "Rahul Mehta",
    title: "MSc Computer Science",
    institution: "ETH Zürich",
    role: "Student",
  },
  {
    quote:
      "I run a small lab and don't have a recruiting budget. ProfConnect surfaces motivated students who actually read the project description before applying — that alone is worth it.",
    name: "Prof. Dr. Lukas Berger",
    title: "Principal Investigator, Materials Science",
    institution: "TU Munich",
    role: "Professor",
  },
  {
    quote:
      "I matched with my advisor here during my sophomore year. Two years later I'm starting my PhD at the same university. None of that happens without ProfConnect.",
    name: "Sofia Alvarez",
    title: "Incoming PhD, Neuroscience",
    institution: "University of Toronto",
    role: "Student",
  },
  {
    quote:
      "What I appreciate is the focus. It's not a job board, it's not LinkedIn — it's specifically built for the professor-student research relationship, and it shows in every interaction.",
    name: "Prof. Hiroshi Tanaka",
    title: "Chair of Robotics",
    institution: "University of Tokyo",
    role: "Professor",
  },
  {
    quote:
      "I went from sending cold emails that never got replies to having three professors interview me in the same month. The application format makes you stand out for the right reasons.",
    name: "Emma O'Sullivan",
    title: "Final-year BSc Mathematics",
    institution: "Trinity College Dublin",
    role: "Student",
  },
];

const stats = [
  { value: "12,400+", label: "Professors" },
  { value: "85,000+", label: "Students" },
  { value: "640+", label: "Universities" },
  { value: "70+", label: "Countries" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            <span className="text-blue-600">Prof</span>Connect
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          Used by professors in 70+ countries
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
          Where professors and students{" "}
          <span className="text-blue-600">find each other.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          ProfConnect is the global platform for academic collaboration.
          Professors post research projects and assistantships; students apply
          to the ones that match their ambitions.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register/student"
            className="rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            I'm a student
          </Link>
          <Link
            href="/register/professor"
            className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
          >
            I'm a professor
          </Link>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-semibold text-gray-900">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for the way research actually works
          </h2>
          <p className="mt-4 text-gray-600">
            Cold emails and PDF CVs aren't a search engine. ProfConnect is.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Real research projects</h3>
            <p className="mt-2 text-sm text-gray-600">
              Professors list active research projects with concrete scope,
              expected commitment, and required background — no guesswork.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Structured applications</h3>
            <p className="mt-2 text-sm text-gray-600">
              Students apply with a focused profile and project-specific
              answers. Professors review in minutes, not hours.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Global by default</h3>
            <p className="mt-2 text-sm text-gray-600">
              Professors from over 640 universities in 70+ countries post here.
              Geography stops being a barrier to the right opportunity.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Trusted by professors and students worldwide
            </h2>
            <p className="mt-4 text-gray-600">
              Real stories from the people using ProfConnect every day.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex w-fit items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {t.role}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-gray-700">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-gray-100 pt-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-500">{t.title}</div>
                  <div className="text-xs text-gray-500">{t.institution}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl bg-blue-600 px-8 py-16 text-center text-white">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Start your next research chapter today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Join thousands of professors and students already collaborating on
            ProfConnect. Free for students, free for professors.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register/student"
              className="rounded-md bg-white px-5 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
            >
              Sign up as a student
            </Link>
            <Link
              href="/register/professor"
              className="rounded-md border border-white/40 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Sign up as a professor
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-gray-500">
          <div>
            <span className="font-semibold text-gray-900">
              <span className="text-blue-600">Prof</span>Connect
            </span>
            <span className="ml-2">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-gray-900">
              Log in
            </Link>
            <Link href="/register" className="hover:text-gray-900">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
