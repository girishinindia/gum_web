/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.b-cdn.net' },
      { protocol: 'https', hostname: 'iframe.mediadelivery.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },

  // Phase 39.1 fix — `react-filerobot-image-editor` imports `react-konva`,
  // which pulls in `konva/lib/index-node.js` at MODULE-RESOLUTION time
  // (before `ssr:false` has a chance to skip the actual import). That
  // node-only file does `require('canvas')`, the optional native dep we
  // don't install on web. Two-step fix:
  //
  //   1. Tell Webpack to treat `canvas` as a no-op module on both server
  //      and client builds. This is the official konva-on-Next.js
  //      workaround — see https://github.com/konvajs/react-konva#usage-with-nextjs
  //
  //   2. Mark the editor package as a server-external so Next.js doesn't
  //      try to bundle / pre-render it on the server at all. Belt and
  //      braces — `ssr: false` already prevents rendering, but excluding
  //      it from the server bundle keeps the import trace clean if
  //      anything ever touches it from a server component by mistake.
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      canvas: false,
    };
    return config;
  },
  serverExternalPackages: [
    'react-filerobot-image-editor',
    'react-konva',
    'konva',
  ],
};
export default nextConfig;
