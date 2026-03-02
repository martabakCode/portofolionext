import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Use webpack explicitly for Three.js module resolution
  turbopack: {},
};

export default nextConfig;
