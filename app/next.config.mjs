/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  serverExternalPackages: ["knex"],
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
