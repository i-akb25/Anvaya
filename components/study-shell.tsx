"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon, ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
export function StudyShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    [open, setOpen] = useState(false),
    [dark, setDark] = useState(false);
  useEffect(() => {
    let value = false;
    try {
      value = localStorage.getItem("anvaya-theme") === "dark";
    } catch {}
    setDark(value);
    document.documentElement.dataset.theme = value ? "dark" : "light";
  }, []);
  function theme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("anvaya-theme", next ? "dark" : "light");
    } catch {}
  }
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const links = [
    ["/", "Classroom"],
    ["/classrooms", "Exam paths"],
    ["/courses", "Learn"],
    ["/lectures", "Lectures"],
    ["/syllabus", "Syllabus"],
    ["/assessments", "Practice"],
    ["/search", "Search"],
  ];
  return (
    <div className="site">
      <a className="skip-link" href="#study-main">
        Skip to learning
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={theme}
              aria-label={dark ? "Use light theme" : "Use dark theme"}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <Link className="workspace-link" href="/account">
              My account <ArrowUpRight size={15} />
            </Link>
            <button
              className="icon-button mobile-toggle"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close navigation" : "Open navigation"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            {links
              .concat([
                ["/ssc-cgl", "SSC CGL classroom"],
                ["/today", "Today"],
                ["/library", "Private PDFs"],
                ["/current-affairs", "Current affairs"],
                ["/mocks", "Sectional practice"],
                ["/tutor", "Optional tutor"],
                ["/coverage", "Content coverage"],
                ["/content-review", "Content preflight"],
                ["/notebook", "My notebook"],
                ["/my-practice", "My question desk"],
                ["/papers", "Official papers"],
                ["/exams", "Exam paths"],
                ["/planner", "Study planner"],
                ["/writing", "Answer writing"],
                ["/results", "Results & revision"],
                ["/recall", "Recall cards"],
                ["/account", "Private account"],
              ])
              .map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={path === href ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
          </nav>
        )}
      </header>
      <main id="study-main" className="study-main">
        {children}
      </main>
      <footer className="site-footer">
        <div className="footer-lead">
          <Brand />
          <h2>
            A little more understanding.
            <br />
            Every single day.
          </h2>
          <p>Your exam. Your pace. A place to bring it together.</p>
        </div>
        <div>
          <h3>Workspace</h3>
          <Link href="/ssc-cgl">SSC CGL classroom</Link>
          <Link href="/today">Today</Link>
          <Link href="/library">Private PDFs</Link>
          <Link href="/current-affairs">Current affairs</Link>
          <Link href="/mocks">Sectional practice</Link>
          <Link href="/tutor">Optional tutor</Link>
          <Link href="/coverage">Content coverage</Link>
          <Link href="/content-review">Content preflight</Link>
          <Link href="/search">Search everything</Link>
          <Link href="/notebook">My topic notebook</Link>
          <Link href="/my-practice">My question desk</Link>
          <Link href="/courses">Learning library</Link>
          <Link href="/lectures">Topic-wise lectures</Link>
          <Link href="/syllabus">Syllabus & paper rules</Link>
          <Link href="/assessments">Concept practice</Link>
          <Link href="/writing">Answer writing</Link>
          <Link href="/exams">Exam paths</Link>
          <Link href="/papers">Official paper library</Link>
          <Link href="/planner">Study planner</Link>
          <Link href="/results">Results & revision</Link>
          <Link href="/recall">Recall cards</Link>
          <Link href="/account">Account & backups</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <a href="mailto:akbsupportinfo@gmail.com">Contact support ↗</a>
          <p>
            Private workspace preview.
            <br />
            Notes and plans stay in this browser. Export backups regularly.
          </p>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Anvaya</span>
          <span>Built for focused preparation.</span>
        </div>
      </footer>
    </div>
  );
}
