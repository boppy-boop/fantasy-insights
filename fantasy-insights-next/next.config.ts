import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        port: "",
        pathname: "/i/headshots/**",
      },
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        port: "",
        pathname: "/combiner/**",
      },
    ],
    // Or use the simpler form instead:
    // domains: ["a.espncdn.com"],
  },
};

export default nextConfig;
