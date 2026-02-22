"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "@/lib/constants";
import type { Post } from "@/modules/posts/posts.types";
import type { Project } from "@/modules/projects/projects.types";
import type { Profile } from "@/modules/profile/profile.types";
import type { Experience } from "@/modules/experience/experience.types";
import type { TechStack } from "@/modules/techstack/techstack.types";
import { SiteConfig } from "@/modules/site/site.types";
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import GameProvider from '@/core/GameProvider';
import Terrain from '@/world/Terrain';
import Ocean from '@/world/Ocean';
import Beach from '@/world/Beach';
import Mountain from '@/world/Mountain';
import AdvancedLighting from '@/world/AdvancedLighting';
import SkyEnvironment from '@/world/SkyEnvironment';
import Vegetation from '@/world/Vegetation';
import Player, { PlayerRef } from '@/player/Player';
import CameraRig from '@/player/CameraRig';
import CoastalOffice from '@/buildings/CoastalOffice';
import GameUI from '@/ui/GameUI';
import { BazaarManager } from '@/world/bazaar/BazaarManager';

const HeroScene = dynamic(() => import("./3d/HeroScene"), { ssr: false });

// Keyboard control mapping for game
const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'sprint', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'interact', keys: ['KeyE'] },
  { name: 'jump', keys: ['Space'] },
];

interface ClientHomeWrapperProps {
  posts: Post[];
  projects: Project[];
  profile: Profile | null;
  experiences: Experience[];
  siteConfig: SiteConfig | null;
  techStacks: TechStack[];
}

// Tech Stack Tabs Component
function TechStackTabs({ techStacks }: { techStacks: TechStack[] }) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const categories = ["all", ...Array.from(new Set(techStacks.map(t => t.category)))];
  const filteredTechs = activeTab === "all" ? techStacks : techStacks.filter(t => t.category === activeTab);

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === category
              ? "bg-primary-custom text-white shadow-lg shadow-primary-custom/30"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
              }`}
          >
            {category === "all" ? "All Stack" : category}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        >
          {filteredTechs.map((tech, index) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="group relative flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${tech.color}15` }}>
                <i className={`${tech.icon_class} text-2xl`} style={{ color: tech.color }}></i>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-zinc-200 font-semibold text-sm truncate">{tech.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{tech.category}</span>
              </div>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: `0 0 20px ${tech.color}15` }} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 flex flex-wrap justify-center gap-8">
        <div className="text-center">
          <span className="text-3xl font-black text-white">{techStacks.length}+</span>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Technologies</p>
        </div>
        <div className="text-center">
          <span className="text-3xl font-black text-white">{categories.length - 1}</span>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Categories</p>
        </div>
        <div className="text-center">
          <span className="text-3xl font-black text-white">∞</span>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Possibilities</p>
        </div>
      </div>
    </div>
  );
}

export default function ClientHomeWrapper({ posts, projects, profile, experiences, siteConfig, techStacks }: ClientHomeWrapperProps) {
  const [is3D, setIs3D] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && is3D) {
        setIs3D(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [is3D]);

  const featuredProjects = projects.slice(0, 6);
  const latestPosts = posts.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Floating Toggle Button - Bottom Right */}
      <AnimatePresence>
        {!is3D && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <button
              onClick={() => setIs3D(true)}
              className="group relative flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 overflow-hidden bg-primary-custom border border-primary-custom text-white hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <div className="relative flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-bold tracking-tight uppercase">Enter 3D Experience</span>
                <svg className="w-5 h-5 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {is3D ? (
        <main className="relative w-screen h-screen overflow-hidden bg-slate-900">
          {/* Exit Button */}
          <button
            onClick={() => setIs3D(false)}
            className="absolute top-4 right-4 z-40 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit 3D Experience
          </button>

          <GameUI />

          {/* Instructions */}
          <div className="absolute bottom-4 left-4 z-30 pointer-events-none select-none">
            <div className="bg-black/50 backdrop-blur text-white/80 px-4 py-3 rounded-lg text-sm space-y-1">
              <p className="font-semibold text-white">🌊 Coastal World Explorer</p>
              <p><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">WASD</kbd> to move</p>
              <p><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">SPACE</kbd> to jump</p>
              <p><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">SHIFT</kbd> to sprint</p>
              <p><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">E</kbd> to interact</p>
              <p><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">T</kbd> toggle time</p>
              <p><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">ESC</kbd> exit</p>
            </div>
          </div>

          <KeyboardControls map={keyboardMap}>
            <Canvas
              shadows
              camera={{ position: [0, 10, 25], fov: 60, near: 0.1, far: 1000 }}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              style={{ width: '100%', height: '100%' }}
            >
              <GameProvider>
                {/* Lighting */}
                <AdvancedLighting />
                <SkyEnvironment />

                {/* World Elements */}
                <Terrain size={200} />

                {/* Layer Logic: Ocean -2, Beach -0.2 (transition), Terrain follows noise */}
                <Beach size={200} waterLevel={-0.2} />
                <Ocean />

                {/* Mountain placed at requested position */}
                <Mountain position={[0, 4, -60]} />

                {/* Buildings - Elevated Office */}
                <group position={[0, 5, -10]}>
                  <CoastalOffice />
                </group>

                {/* Bazaar Area - Flat area */}
                <group position={[0, 3, 25]}>
                  <BazaarManager projects={projects} />
                </group>

                {/* Vegetation - Using count only to avoid typing error if size not supported */}
                <Vegetation count={50} />

                {/* Player */}
                <Player ref={playerRef} />
                <CameraRig
                  target={playerRef}
                  minDistance={5}
                  maxDistance={30}
                  defaultDistance={15}
                  height={4}
                  sensitivity={0.005}
                />
              </GameProvider>
            </Canvas>
          </KeyboardControls>
        </main>
      ) : (
        <div className="min-h-screen bg-zinc-950 flex flex-col font-sans selection:bg-primary-custom/30">
          {/* Navigation */}
          <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${hasScrolled ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 py-4" : "bg-transparent py-6"}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
              <Link href="/" className="text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-custom flex items-center justify-center">
                  <span className="text-base">M</span>
                </div>
                MartabakCode
              </Link>
              <div className="hidden md:flex items-center gap-8">
                {[
                  { name: "Blog", href: ROUTES.BLOG },
                  { name: "Projects", href: ROUTES.PROJECTS },
                  { name: "About", href: ROUTES.ABOUT },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-custom transition-all group-hover:w-full" />
                  </Link>
                ))}
                <Link
                  href={ROUTES.ADMIN.DASHBOARD}
                  className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="relative pt-32 pb-20 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-primary-custom text-xs font-bold mb-6">
                      <span className="w-2 h-2 rounded-full bg-primary-custom animate-pulse" />
                      AVAILABLE FOR FREELANCE
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
                      Crafting <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-custom to-purple-500">Digital</span> Experiences
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed max-w-xl">
                      {profile?.bio || "Full-stack developer specializing in building exceptional digital experiences. Currently focused on building accessible, human-centered products."}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link
                      href={ROUTES.PROJECTS}
                      className="px-8 py-4 bg-primary-custom text-white font-bold rounded-xl hover:bg-primary-custom/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-custom/25"
                    >
                      View Projects
                    </Link>
                    <Link
                      href={ROUTES.ABOUT}
                      className="px-8 py-4 bg-zinc-900 text-white font-bold rounded-xl border border-zinc-800 hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
                    >
                      Contact Me
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex items-center gap-6 pt-4"
                  >
                    <div className="flex -space-x-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">
                          U{i}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-zinc-400">
                      <span className="text-white font-bold">50+</span> Satisfied Clients
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="relative h-[600px] hidden lg:block"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-custom/20 to-purple-500/20 rounded-full blur-3xl opacity-30" />
                  <HeroScene />
                </motion.div>
              </div>
            </div>
          </section>

          {/* Tech Stack Section */}
          <section className="py-24 bg-zinc-950 relative">
            <div className="container mx-auto px-6">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="space-y-12"
              >
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
                    Technologies & Tools
                  </h2>
                  <p className="text-zinc-400">
                    My preferred weapons of choice for building robust and scalable applications.
                  </p>
                </div>
                <TechStackTabs techStacks={techStacks} />
              </motion.div>
            </div>
          </section>

          {/* Featured Projects */}
          <section className="py-24 bg-zinc-900/30">
            <div className="container mx-auto px-6">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">Featured Work</h2>
                  <p className="text-zinc-400">Selected projects that showcase my expertise.</p>
                </div>
                <Link href={ROUTES.PROJECTS} className="text-primary-custom font-bold hover:underline">
                  View All Projects →
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-video relative overflow-hidden bg-zinc-800">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <Link
                          href={project.link || "#"}
                          target="_blank"
                          className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                        >
                          View Live
                        </Link>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                      <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack?.slice(0, 3).map((tech: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold px-2 py-1 bg-zinc-800 text-zinc-300 rounded uppercase">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest Posts */}
          <section className="py-24 bg-zinc-950">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl lg:text-4xl font-black text-white mb-12 text-center">Latest Insights</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {latestPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800 group-hover:border-zinc-700 transition-colors"
                    >
                      <time className="text-xs font-bold text-primary-custom mb-4 block">
                        {new Date(post.created_at).toLocaleDateString('en-GB')}
                      </time>
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary-custom transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                        {post.content?.replace(/[#*_`]/g, '').slice(0, 150)}...
                      </p>
                    </motion.article>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 bg-zinc-950 border-t border-zinc-900">
            <div className="container mx-auto px-6 text-center">
              <p className="text-zinc-500 text-sm">
                © {new Date().getFullYear()} MartabakCode. Built with Next.js, Three.js & Tailwind.
              </p>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
