import SmartErrorBoundary from "@/components/error-boundary/error-boundary";
import { QueryProvider } from "@/providers/QueryProvider";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		template: "%s | Italist Fashion Store",
		default: "Italist Fashion Store - Premium Fashion & Accessories",
	},
	description:
		"Discover premium fashion products from top brands. Shop clothing, accessories, and bags with fast shipping and authentic quality guarantee.",

	keywords: [
		"fashion",
		"clothing",
		"accessories",
		"bags",
		"premium",
		"designer",
		"women's fashion",
		"men's fashion",
		"luxury brands",
		"authentic products",
	].join(", "),

	authors: [{ name: "Ivan Buljovcic" }],
	creator: "Italist Fashion Store",
	publisher: "Italist Fashion Store",
	applicationName: "Italist Fashion Store",
	referrer: "origin-when-cross-origin",
	robots: {
		index: true,
		follow: true,
		nocache: false,
		googleBot: {
			index: true,
			follow: true,
			noimageindex: false,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	category: "shopping",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				{/* Preconnect to external domains for performance */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			</head>

			<body>
				<SmartErrorBoundary context="Application Root" level="app" enableNavigation={true} maxRetries={2}>
					<QueryProvider>{children}</QueryProvider>
				</SmartErrorBoundary>
			</body>
		</html>
	);
}
