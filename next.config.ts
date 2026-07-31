import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.lingoost.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
