import type { NextConfig } from "next";

const repositoryPath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: repositoryPath,
  assetPrefix: repositoryPath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
