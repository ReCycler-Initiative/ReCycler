/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["knex"],
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
