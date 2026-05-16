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

  // Phase 43.8 — the editor's prebuilt CJS bundle holds its own copy of
  // React's internals (`__SECRET_INTERNALS_…`), which goes stale when
  // Next.js webpack-tree-shakes the project's React. The crash is
  //   "Cannot read properties of undefined (reading 'ReactCurrentOwner')"
  // at the `<FilerobotImageEditor>` render point. Listing the package +
  // its peers under `transpilePackages` makes Next.js re-compile them
  // through SWC against the SAME React instance the rest of the app
  // uses, which restores the shared internals lookup.
  transpilePackages: [
    'react-filerobot-image-editor',
    'react-konva',
    'konva',
    'react-reconciler',
  ],

  // `serverExternalPackages` is for app-router server components only.
  // We still want it so any server-side touchpoint avoids the package,
  // but transpilePackages is what fixes the runtime React error.
  serverExternalPackages: [
    'react-filerobot-image-editor',
    'react-konva',
    'konva',
  ],
};
export default nextConfig;
