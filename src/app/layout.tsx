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
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
