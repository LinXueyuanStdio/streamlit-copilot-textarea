/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/component/streamlit_copilot_textarea.streamlit_copilot_textarea",
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "streamlit-component-lib-react-hooks",
    "streamlit-component-lib",
  ],
};

module.exports = nextConfig;
