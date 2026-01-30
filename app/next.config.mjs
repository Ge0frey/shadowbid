/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
    };
    
    // Ignore pino-pretty warning from WalletConnect
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino-pretty': false,
      };
    }
    
    // Externalize pino-pretty for server-side
    config.externals = config.externals || [];
    config.externals.push('pino-pretty');
    
    return config;
  },
};

export default nextConfig;
