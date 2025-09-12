import SmartErrorBoundary from "@/components/error-boundary/error-boundary";
import { QueryProvider } from "@/providers/QueryProvider";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Italist - Fake store",
	description: "An amazing store for all your shopping needs. If your needs are for fake products.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<SmartErrorBoundary
					context="Application Root"
					level="app"
					enableNavigation={true}
					maxRetries={2}
				>
					<QueryProvider>{children}</QueryProvider>
				</SmartErrorBoundary>
			</body>
		</html>
	);
}
