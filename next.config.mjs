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

  // Phase 43.10 — switched from `react-filerobot-image-editor`
  // (Konva + react-reconciler) to `react-easy-crop` (canvas-only). The
  // old library's prebuilt bundle held its own React internals and
  // crashed at runtime with
  //   "Cannot read properties of undefined (reading 'ReactCurrentOwner')"
  // regardless of dep pinning or transpile workarounds. react-easy-crop
  // has no native peer-dep entanglements, so all the canvas / konva /
  // transpilePackages / serverExternalPackages workarounds are gone.
};
export default nextConfig;
