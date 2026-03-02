'use client';

import { useMemo, useRef, useEffect, Suspense, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, PerspectiveCamera, Html, useProgress, useGLTF, Stars } from '@react-three/drei';
import { Group, Vector3, Box3, Color } from 'three';
import { Terrain } from './three/island/Terrain';
import { Trees } from './three/island/Trees';
import { Water } from './three/island/Water';
import { Clouds } from './three/island/Clouds';
import { Lighting } from './three/island/Lighting';
import { generateTerrain, TerrainConfig } from '@/lib/island/terrain';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SiteConfig } from "@/modules/site/site.types";
import { Profile } from "@/modules/profile/profile.types";
import { Project } from "@/modules/projects/projects.types";
import { Post } from "@/modules/posts/posts.types";
import { Experience } from "@/modules/experience/experience.types";
import { TechStack } from "@/modules/techstack/techstack.types";

// ============================================================
// AVATAR SHOWCASE COMPONENT (for Hero)
// ============================================================
function AvatarShowcase({ terrainHeight }: { terrainHeight: number }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/avatar.glb');
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const avatarModel = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();
    const box = new Box3().setFromObject(clone);
    const center = box.getCenter(new Vector3());
    clone.position.set(-center.x, -box.min.y, -center.z);

    clone.traverse((child) => {
      if ((child as any).isMesh) {
        (child as any).visible = true;
        (child as any).castShadow = true;
        if ((child as any).material) {
          const mat = (child as any).material.clone();
          mat.color = new Color(1, 0.85, 0.7);
          mat.emissive = new Color(0.1, 0.05, 0);
          mat.emissiveIntensity = 0.15;
          (child as any).material = mat;
        }
      }
    });
    return { mesh: clone, size: box.getSize(new Vector3()) };
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.1);
    const targetRot = mousePos.current.x * 0.8;
    groupRef.current.rotation.y += (targetRot - groupRef.current.rotation.y) * 4 * dt;
    const time = state.clock.elapsedTime;
    groupRef.current.position.y = terrainHeight + 0.8 + Math.sin(time * 1.5) * 0.05;
  });

  const scale = avatarModel ? Math.max(0.8, 1.2 / avatarModel.size.y) : 1;

  return (
    <group ref={groupRef} scale={scale}>
      {avatarModel ? (
        <primitive object={avatarModel.mesh} />
      ) : (
        <mesh>
          <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="black" opacity={0.2} transparent />
      </mesh>
    </group>
  );
}

// ============================================================
// AUTO-ROTATING CAMERA
// ============================================================
function AutoRotatingCamera() {
  const { camera } = useThree();
  const angle = useRef(0);
  const radius = 20;
  const height = 12;

  useFrame((state, delta) => {
    angle.current += delta * 0.15;
    camera.position.x = Math.sin(angle.current) * radius;
    camera.position.z = Math.cos(angle.current) * radius;
    camera.position.y = height + Math.sin(angle.current * 0.5) * 2;
    camera.lookAt(0, 2, 0);
  });

  return null;
}

// ============================================================
// LOADING SCREEN
// ============================================================
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-white text-sm">{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

// ============================================================
// HERO SCENE WITH ISLAND
// ============================================================
function HeroScene({ timeOfDay }: { timeOfDay: 'day' | 'sunset' | 'night' }) {
  const config = useMemo<Partial<TerrainConfig>>(() => ({
    width: 48,
    depth: 48,
    maxHeight: 10,
    waterLevel: 2,
    noiseScale: 0.06,
    islandRadius: 22,
  }), []);

  const terrainData = useMemo(() => generateTerrain(config), [config]);
  const centerHeight = terrainData.heightMap[24]?.[24] || 5;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={55} />
      <AutoRotatingCamera />
      {timeOfDay === 'night' ? (
        <>
          <color attach="background" args={['#0a0a1a']} />
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        </>
      ) : (
        <Sky
          distance={450000}
          sunPosition={timeOfDay === 'sunset' ? [30, 5, 20] : [100, 80, 50]}
          inclination={timeOfDay === 'sunset' ? 0.6 : 0.48}
          azimuth={0.25}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
          rayleigh={timeOfDay === 'sunset' ? 4 : 2}
          turbidity={timeOfDay === 'sunset' ? 8 : 10}
        />
      )}
      <Lighting timeOfDay={timeOfDay} />
      <ambientLight intensity={0.7} />

      <group position={[-24, -1, -24]}>
        <Terrain config={config} seed={12345} />
        <Trees heightMap={terrainData.heightMap} waterLevel={2} maxHeight={terrainData.maxHeight} count={25} />
        <Water width={48} depth={48} waterLevel={2} />
        <Clouds count={6} area={48} height={10} />

        <group position={[24, centerHeight, 24]}>
          <AvatarShowcase terrainHeight={0} />
        </group>
      </group>
    </>
  );
}

// ============================================================
// MAIN LANDING PAGE
// ============================================================
interface LandingExperienceProps {
  siteConfig: SiteConfig | null;
  profile: Profile | null;
  projects: Project[];
  posts: Post[];
  experiences: Experience[];
  techStacks: TechStack[];
}

export function LandingExperience({
  siteConfig,
  profile,
  projects,
  posts,
  experiences,
  techStacks,
}: LandingExperienceProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const primaryColor = siteConfig?.primary_color || '#0ea5e9';
  const accentColor = siteConfig?.accent_color || '#fbbf24';
  const siteName = siteConfig?.site_name || profile?.full_name?.split(' ')[0] || 'Portfolio';
  const headline = profile?.headline || 'Creative Developer';
  const bio = profile?.bio || 'Building digital experiences with code and creativity.';
  const fullName = profile?.full_name || 'Developer';

  const themeMode = siteConfig?.theme_mode || 'pagi';
  const timeOfDay = themeMode === 'sore' ? 'sunset' : 'day';

  const isDarkMode = themeMode === 'sore';

  // Dynamic classes based on theme
  const bgGradient = isDarkMode
    ? "from-slate-900 via-indigo-950 to-slate-900"
    : "from-sky-400 via-sky-300 to-blue-200";

  const sectionBgClass = isDarkMode ? "bg-slate-900 text-white" : "bg-white text-gray-800";
  const sectionAltBgClass = isDarkMode ? "bg-slate-800 text-white" : "bg-gray-50 text-gray-800";
  const cardBgClass = isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-transparent";
  const cardHoverClass = isDarkMode ? "hover:bg-slate-700" : "hover:bg-gray-50";
  const textMutedClass = isDarkMode ? "text-slate-400" : "text-gray-600";
  const headingClass = isDarkMode ? "text-white" : "text-gray-800";

  return (
    <div className="relative">
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient}`}>
          <Canvas
            shadows
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            onCreated={() => setIsLoaded(true)}
          >
            <Suspense fallback={<Loader />}>
              <HeroScene timeOfDay={timeOfDay} />
            </Suspense>
            <fog attach="fog" args={[timeOfDay === 'sunset' ? 0xffd4a3 : 0xa8d5e5, 25, 90]} />
          </Canvas>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pointer-events-auto px-4"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-lg mb-2 font-medium"
            >
              {headline}
            </motion.p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
              Hi, I&apos;m <span style={{ color: accentColor }}>{fullName.split(' ')[0]}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 font-medium drop-shadow-md max-w-2xl mx-auto">
              {bio}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="#projects"
                className="px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                style={{ backgroundColor: 'white', color: primaryColor }}
              >
                View Projects
              </Link>
              <Link
                href="#contact"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all duration-300"
              >
                Contact Me
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm flex flex-col items-center gap-2"
        >
          <span className="bg-black/20 backdrop-blur px-4 py-2 rounded-full">
            👋 Move mouse to interact with avatar
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* TECH STACK SECTION */}
      {techStacks.length > 0 && (
        <section className={`py-16 px-6 ${sectionBgClass} transition-colors duration-500`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className={`text-3xl font-bold mb-4 ${headingClass}`}>Tech Stack</h2>
              <p className={textMutedClass}>Technologies I work with</p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-6">
              {techStacks.slice(0, 12).map((tech, i) => (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors border ${cardBgClass} ${cardHoverClass}`}
                >
                  <i
                    className={`${tech.icon_class} text-4xl`}
                    style={{ color: tech.color }}
                  />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PROJECTS SECTION */}
      {projects.length > 0 && (
        <section id="projects" className={`py-20 px-6 ${sectionAltBgClass} transition-colors duration-500`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl font-bold mb-4 ${headingClass}`}>Featured Projects</h2>
              <p className={textMutedClass}>Some of my recent work</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.slice(0, 6).map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${cardBgClass}`}
                >
                  <div className={`h-48 flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-br from-sky-100 to-blue-100'}`}>
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">📁</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${headingClass}`}>{project.title}</h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${textMutedClass}`}>{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.tech_stack?.slice(0, 3).map((tech, j) => (
                        <span key={j} className={`text-xs px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700 text-sky-400' : 'bg-sky-100 text-sky-700'}`}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {projects.length > 6 && (
              <div className="text-center mt-12">
                <Link
                  href="/projects"
                  className="inline-block px-8 py-3 rounded-full font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  View All Projects
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* EXPERIENCE SECTION WITH PROFILE CARD */}
      {experiences.length > 0 && (
        <section className={`py-20 px-6 transition-colors duration-500 ${sectionBgClass}`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl font-bold mb-4 ${headingClass}`}>Experience</h2>
              <p className={textMutedClass}>My professional journey</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Profile Photo Card on the left */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:w-2/5 w-full"
              >
                <div className={`relative rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'}`}>
                  {/* Photo */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-br from-sky-100 to-blue-100'}`}>
                        <span className="text-8xl">👤</span>
                      </div>
                    )}
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1">{profile?.full_name || 'Developer'}</h3>
                    <p className="text-white/80 text-sm">{profile?.headline || 'Creative Developer'}</p>
                    
                    {/* Social links */}
                    <div className="flex gap-3 mt-4">
                      {profile?.github_url && (
                        <a 
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      {profile?.linkedin_url && (
                        <a 
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      )}
                      {profile?.email && (
                        <a 
                          href={`mailto:${profile.email}`}
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Decorative corner accent */}
                  <div 
                    className="absolute top-4 right-4 w-16 h-16 rounded-full blur-2xl opacity-60"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </motion.div>

              {/* Experience list on the right */}
              <div className="lg:w-3/5 w-full space-y-4">
                {experiences.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex gap-4 p-6 rounded-2xl transition-all border ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:shadow-md'}`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        💼
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${headingClass}`}>{exp.role}</h3>
                      <p className="font-medium" style={{ color: primaryColor }}>{exp.company}</p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        {new Date(exp.start_date).getFullYear()} - {exp.current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : ''}
                      </p>
                      <p className={`mt-2 text-sm ${textMutedClass}`}>{exp.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LATEST POSTS */}
      {posts.length > 0 && (
        <section className={`py-20 px-6 transition-colors duration-500 ${sectionAltBgClass}`}>
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-4xl font-bold mb-4 ${headingClass}`}>Latest Posts</h2>
              <p className={textMutedClass}>Thoughts and insights</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border ${cardBgClass}`}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className={`h-40 flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-gradient-to-br from-purple-100 to-pink-100'}`}>
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">📝</span>
                      )}
                    </div>
                    <div className="p-6">
                      <time className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                      <h3 className={`text-lg font-bold mt-2 line-clamp-2 ${headingClass}`}>{post.title}</h3>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT / FOOTER */}
      <section id="contact" className="py-20 px-6 text-white" style={{ backgroundColor: '#1f2937' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Let&apos;s Work Together</h2>
          <p className="text-gray-400 text-lg mb-8">
            Have a project in mind? I&apos;d love to hear about it.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="inline-block px-8 py-4 rounded-full font-bold text-lg transition-all hover:shadow-lg transform hover:-translate-y-1"
                style={{ backgroundColor: primaryColor }}
              >
                📧 Email Me
              </a>
            )}
            {profile?.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gray-800 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-700 transition-all"
              >
                🐙 GitHub
              </a>
            )}
            {profile?.linkedin_url && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-700 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all"
              >
                💼 LinkedIn
              </a>
            )}
          </div>

          <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500">© {new Date().getFullYear()} {siteName || fullName}. All rights reserved.</p>
            <div className="flex gap-6">
              {siteConfig?.logo_text && (
                <span className="font-bold" style={{ color: accentColor }}>
                  {siteConfig.logo_text}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
