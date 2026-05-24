const nextConfig = {
  reactStrictMode: true,
  // Configure serverExternalPackages inside experimental to prevent bundling issues
  experimental: {
    serverComponentsExternalPackages: ['@google-cloud/storage', 'pdfjs-dist'],
  },
  webpack: (config) => {
    // pdfjs-dist contains canvas and other native modules that shouldn't be bundled client-side
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig;
