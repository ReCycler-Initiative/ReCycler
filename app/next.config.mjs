/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  distDir: ".next-runtime",
  output: "standalone",
  serverExternalPackages: ["knex"],
};

export default nextConfig;
