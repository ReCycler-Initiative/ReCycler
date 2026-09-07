const isDevelopment = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  distDir: isDevelopment ? ".next-dev" : ".next-runtime",
  output: "standalone",
  serverExternalPackages: ["knex"],
};

export default nextConfig;
