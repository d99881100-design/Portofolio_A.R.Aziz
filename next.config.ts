// Tipe konfigurasi memastikan opsi yang digunakan sesuai dengan Next.js.
import type { NextConfig } from "next";

// Konfigurasi framework, termasuk React Compiler dan sumber gambar remote.
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thumb.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
    ],
  },
};

export default nextConfig;
