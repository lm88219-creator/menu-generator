import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ 允許用內網 IP / 主機名訪問 dev server
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.102:3000",
  ],
};

export default nextConfig;