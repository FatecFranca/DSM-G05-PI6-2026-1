import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera .next/standalone para Dockerfile enxuto (sem node_modules na imagem final)
  output: "standalone",
};

export default nextConfig;
