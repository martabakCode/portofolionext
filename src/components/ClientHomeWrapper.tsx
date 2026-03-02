"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "@/lib/constants";
import type { Post } from "@/modules/posts/posts.types";
import type { Project } from "@/modules/projects/projects.types";
import type { Profile } from "@/modules/profile/profile.types";
import type { Experience } from "@/modules/experience/experience.types";
import type { TechStack } from "@/modules/techstack/techstack.types";
import { SiteConfig } from "@/modules/site/site.types";

// ─── Props ────────────────────────────────────────────────────
interface ClientHomeWrapperProps {
  posts: Post[];
  projects: Project[];
  profile: Profile | null;
  experiences: Experience[];
  siteConfig: SiteConfig | null;
  techStacks: TechStack[];
}

// ============================================================
// KOMPONEN: Navbar minimal editorial
// ============================================================
function Navbar({
  siteConfig,
  scrolled,
}: {
  siteConfig: SiteConfig | null;
  scrolled: boolean;
}) {
  const accent = siteConfig?.primary_color ?? "#6366f1";

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 w-full z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(5,5,5,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        padding: scrolled ? "1rem 2rem" : "1.5rem 2rem",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-white font-black tracking-tighter text-xl select-none"
          style={{ letterSpacing: "-0.04em" }}
        >
          {siteConfig?.logo_text ?? siteConfig?.site_name ?? "Portfolio"}
          <span style={{ color: accent }}>.</span>
        </Link>

        {/* Nav links — minimal uppercase */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { label: "Work", href: ROUTES.PROJECTS },
            { label: "Blog", href: ROUTES.BLOG },
            { label: "About", href: ROUTES.ABOUT },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href={ROUTES.ADMIN.DASHBOARD}
            className="text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-full border border-zinc-700 text-zinc-400 hover:border-zinc-400 hover:text-white transition-all duration-200"
          >
            Admin
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ============================================================
// KOMPONEN: Hero Section
// ============================================================
function HeroSection({
  profile,
  siteConfig,
}: {
  profile: Profile | null;
  siteConfig: SiteConfig | null;
}) {
  const accent = siteConfig?.primary_color ?? "#6366f1";

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden px-6 md:px-16 lg:px-24">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Gradient orb */}
      <div
        className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 mb-10"
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: accent }}
          />
          <span
            className="text-xs font-bold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {profile?.headline ?? "Creative Developer"}
          </span>
        </motion.div>

        {/* Main headline — editorial split */}
        <div className="overflow-hidden mb-6">
          <motion.h1
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-black text-white leading-none"
            style={{
              fontSize: "clamp(3.5rem, 9vw, 8.5rem)",
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
            }}
          >
            {profile?.full_name?.split(" ")[0] ?? "Creative"}
            <br />
            <span
              className="inline-block"
              style={{
                WebkitTextStroke: `2px ${accent}`,
                color: "transparent",
              }}
            >
              {profile?.full_name?.split(" ").slice(1).join(" ") ?? "Developer"}
            </span>
          </motion.h1>
        </div>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-zinc-400 text-lg leading-relaxed max-w-lg mb-12"
        >
          {profile?.bio ??
            "Building digital experiences at the intersection of design and engineering."}
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-wrap items-center gap-6"
        >
          {/* Primary CTA */}
          <Link
            href={ROUTES.PROJECTS}
            className="group relative inline-flex items-center gap-3 px-8 py-4 text-sm font-bold rounded-full overflow-hidden transition-all duration-300 text-white"
            style={{ background: accent }}
          >
            <span>View Work</span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              →
            </motion.span>
          </Link>

          {/* Secondary CTA */}
          <Link
            href={ROUTES.ABOUT}
            className="text-sm font-bold text-zinc-500 hover:text-white transition-colors underline underline-offset-4 decoration-zinc-700 hover:decoration-white"
          >
            Get in touch
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-6 md:left-16 lg:left-24 flex items-center gap-3 text-zinc-600"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-px h-10 bg-zinc-700 mx-auto"
          />
          <span className="text-xs uppercase tracking-[0.15em] rotate-90 origin-left">Scroll</span>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// KOMPONEN: Projects — editorial grid
// ============================================================
function ProjectsSection({ projects, accent }: { projects: Project[]; accent: string }) {
  return (
    <section id="projects" className="py-32 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: accent }}
            >
              Selected Work
            </p>
            <h2
              className="font-black text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.04em" }}
            >
              Projects
            </h2>
          </div>
          <Link
            href={ROUTES.PROJECTS}
            className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors"
          >
            All Work →
          </Link>
        </div>

        {/* Project list — alternating layout */}
        <div className="space-y-2">
          {projects.slice(0, 6).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
            >
              <Link
                href={project.link ?? "#"}
                target={project.link ? "_blank" : undefined}
                className="group flex items-center justify-between py-6 border-b border-zinc-900 hover:border-zinc-700 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-6">
                  {/* Index */}
                  <span className="text-xs font-bold text-zinc-700 w-8 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Thumbnail */}
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xs font-bold"
                        style={{ color: accent, background: `${accent}15` }}
                      >
                        {project.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="font-black text-zinc-300 group-hover:text-white transition-colors duration-300"
                    style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)", letterSpacing: "-0.02em" }}
                  >
                    {project.title}
                  </h3>
                </div>

                {/* Right: tags + arrow */}
                <div className="flex items-center gap-6">
                  <div className="hidden md:flex flex-wrap gap-2">
                    {project.tech_stack?.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-zinc-800 text-zinc-600 group-hover:border-zinc-700 group-hover:text-zinc-400 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <motion.span
                    animate={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    className="text-zinc-700 group-hover:text-white transition-colors text-xl"
                  >
                    ↗
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// KOMPONEN: Tech Stack — minimal grid
// ============================================================
function TechStackSection({ techStacks, accent }: { techStacks: TechStack[]; accent: string }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = ["all", ...Array.from(new Set(techStacks.map((t) => t.category)))];
  const filtered =
    activeCategory === "all"
      ? techStacks
      : techStacks.filter((t) => t.category === activeCategory);

  return (
    <section className="py-32 px-6 md:px-16 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: accent }}
          >
            Tech Stack
          </p>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <h2
              className="font-black text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.04em" }}
            >
              Tools & Technologies
            </h2>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="text-xs font-bold uppercase tracking-[0.12em] px-4 py-2 rounded-full border transition-all duration-200"
                  style={{
                    borderColor: activeCategory === cat ? accent : "rgba(255,255,255,0.08)",
                    color: activeCategory === cat ? accent : "#52525b",
                    background: activeCategory === cat ? `${accent}10` : "transparent",
                  }}
                >
                  {cat === "all" ? "All" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-zinc-900/50"
            style={{ border: "1px solid rgba(255,255,255,0.04)" }}
          >
            {filtered.map((tech, i) => (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="group flex flex-col items-center justify-center gap-3 p-6 bg-zinc-950 hover:bg-zinc-900 transition-colors duration-200 cursor-default"
              >
                <i
                  className={`${tech.icon_class} text-3xl transition-transform duration-200 group-hover:scale-110`}
                  style={{ color: tech.color }}
                />
                <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors text-center">
                  {tech.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap gap-16">
          {[
            { value: `${techStacks.length}+`, label: "Technologies" },
            { value: `${categories.length - 1}`, label: "Categories" },
            { value: "∞", label: "Possibilities" },
          ].map((stat) => (
            <div key={stat.label}>
              <p
                className="font-black text-white text-4xl mb-1"
                style={{ letterSpacing: "-0.04em" }}
              >
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// KOMPONEN: Experience — timeline ala editorial
// ============================================================
function ExperienceSection({ experiences, accent }: { experiences: Experience[]; accent: string }) {
  if (!experiences.length) return null;

  return (
    <section className="py-32 px-6 md:px-16 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: accent }}
          >
            Career
          </p>
          <h2
            className="font-black text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.04em" }}
          >
            Experience
          </h2>
        </div>

        <div className="space-y-0">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group grid grid-cols-12 gap-6 py-8 border-b border-zinc-900 hover:border-zinc-800 transition-colors"
            >
              {/* Date */}
              <div className="col-span-12 md:col-span-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-600">
                  {new Date(exp.start_date).getFullYear()} —{" "}
                  {exp.current ? "Present" : exp.end_date ? new Date(exp.end_date).getFullYear() : ""}
                </p>
                {exp.current && (
                  <span
                    className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: accent }}
                    />
                    Current
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="col-span-12 md:col-span-9">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3
                      className="font-black text-white group-hover:text-white/90 transition-colors"
                      style={{ fontSize: "1.25rem", letterSpacing: "-0.02em" }}
                    >
                      {exp.role}
                    </h3>
                    <p className="text-zinc-500 font-medium mt-1">{exp.company}</p>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// KOMPONEN: Blog — editorial cards
// ============================================================
function BlogSection({ posts, accent }: { posts: Post[]; accent: string }) {
  if (!posts.length) return null;

  return (
    <section className="py-32 px-6 md:px-16 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: accent }}
            >
              Writing
            </p>
            <h2
              className="font-black text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)", letterSpacing: "-0.04em" }}
            >
              Latest Posts
            </h2>
          </div>
          <Link
            href={ROUTES.BLOG}
            className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors"
          >
            All Posts →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-zinc-900">
          {posts.slice(0, 3).map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col h-full bg-zinc-950 p-8 hover:bg-zinc-900 transition-colors duration-300"
              >
                {/* Image */}
                {post.image_url && (
                  <div className="aspect-[16/9] rounded-lg overflow-hidden mb-6 bg-zinc-900">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Date */}
                <time className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-600 mb-4 block">
                  {new Date(post.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>

                {/* Title */}
                <h3
                  className="font-black text-zinc-300 group-hover:text-white transition-colors leading-tight mb-4 flex-1"
                  style={{ fontSize: "1.2rem", letterSpacing: "-0.02em" }}
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-zinc-600 text-sm leading-relaxed line-clamp-2 group-hover:text-zinc-500 transition-colors">
                  {post.content?.replace(/[#*_`\[\]]/g, "").slice(0, 120)}...
                </p>

                {/* Read more */}
                <div
                  className="flex items-center gap-2 mt-6 text-xs font-bold uppercase tracking-[0.12em] transition-colors duration-200"
                  style={{ color: accent }}
                >
                  Read more
                  <motion.span
                    animate={{ x: 0 }}
                    whileHover={{ x: 3 }}
                  >
                    →
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// KOMPONEN: About / Contact CTA
// ============================================================
function AboutSection({
  profile,
  accent,
}: {
  profile: Profile | null;
  accent: string;
}) {
  return (
    <section className="py-40 px-6 md:px-16 lg:px-24 border-t border-zinc-900 relative overflow-hidden">
      {/* Background text */}
      <p
        className="absolute inset-0 flex items-center justify-center font-black text-zinc-950 select-none pointer-events-none"
        style={{ fontSize: "clamp(6rem, 18vw, 20rem)", letterSpacing: "-0.06em", opacity: 0.8 }}
        aria-hidden
      >
        HELLO
      </p>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-8"
            style={{ color: accent }}
          >
            Let&apos;s Connect
          </p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white font-black leading-tight mb-12"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", letterSpacing: "-0.04em" }}
          >
            Have a project in mind? Let&apos;s build something great together.
          </motion.p>

          <div className="flex flex-wrap items-center gap-6">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 text-sm"
                style={{ background: accent }}
              >
                Say Hello
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  →
                </motion.span>
              </a>
            )}

            {/* Social links */}
            <div className="flex items-center gap-5">
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              )}
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {profile?.twitter_url && (
                <a
                  href={profile.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500 hover:text-white transition-colors"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// KOMPONEN: Footer
// ============================================================
function Footer({ siteConfig, accent }: { siteConfig: SiteConfig | null; accent: string }) {
  return (
    <footer className="py-10 px-6 md:px-16 lg:px-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs text-zinc-700">
          © {new Date().getFullYear()} {siteConfig?.site_name ?? "Portfolio"}. Built with Next.js.
        </p>
        <Link
          href={ROUTES.ADMIN.DASHBOARD}
          className="text-xs font-bold uppercase tracking-[0.15em] transition-colors"
          style={{ color: accent }}
        >
          Admin ↗
        </Link>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ClientHomeWrapper({
  posts,
  projects,
  profile,
  experiences,
  siteConfig,
  techStacks,
}: ClientHomeWrapperProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const accent = siteConfig?.primary_color ?? "#6366f1";

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-primary-custom/30"
      style={{ background: "#050505", color: "#f4f4f4" }}
    >
      {/* Navbar */}
      <Navbar siteConfig={siteConfig} scrolled={hasScrolled} />

      {/* Hero */}
      <HeroSection
        profile={profile}
        siteConfig={siteConfig}
      />

      {/* Projects */}
      <ProjectsSection projects={projects} accent={accent} />

      {/* Tech Stack */}
      <TechStackSection techStacks={techStacks} accent={accent} />

      {/* Experience */}
      <ExperienceSection experiences={experiences} accent={accent} />

      {/* Blog */}
      <BlogSection posts={posts} accent={accent} />

      {/* About / Contact */}
      <AboutSection profile={profile} accent={accent} />

      {/* Footer */}
      <Footer siteConfig={siteConfig} accent={accent} />
    </div>
  );
}
