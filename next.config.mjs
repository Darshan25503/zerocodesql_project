/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
      serverComponentsExternalPackages: ['knex'],
      instrumentationHook: true
  },
  
};

export default nextConfig;
