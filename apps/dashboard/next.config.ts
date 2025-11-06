/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],

  assetPrefix: "/dashboard-static",
};

export default nextConfig;
