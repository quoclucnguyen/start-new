import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // src/pages/** is this app's domain folder, not Next's Pages Router.
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  // React Compiler runs through babel-plugin-react-compiler (already a dependency).
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
