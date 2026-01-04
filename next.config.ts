import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["pdfkit"],
	images: {
		remotePatterns: [
			{
				hostname: "avatar.vercel.sh",
			},
			{
				protocol: "https",
				//https://nextjs.org/docs/messages/next-image-unconfigured-host
				hostname: "*.public.blob.vercel-storage.com",
			},
		],
	},
	typescript: {
		// specific check is disabled to improve build time
		// type checking should be done in a separate CI step
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
