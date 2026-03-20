/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  transpilePackages: ["@workspace/ui", "@aliko-cv/auth", "@aliko-cv/db"],
}

export default nextConfig
