import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["pdfkit"],
	cacheComponents: true,
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
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "SAMEORIGIN",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
					},
				],
			},
		];
	},
};

export default nextConfig;
