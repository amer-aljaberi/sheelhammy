import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  images: {
    domains: ["ibb.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "okenoisic5wgxte8.public.blob.vercel-storage.com",
      },
    ],
  },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
};

export default nextConfig;
