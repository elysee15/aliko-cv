/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@aliko-cv/auth", "@aliko-cv/db"],
}

export default nextConfig
