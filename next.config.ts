import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "fm91r3r9rr.ufs.sh",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
