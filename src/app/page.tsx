import { ProductFilters } from "@/components/product-filters/product-filters";
import { ProductList } from "@/components/product-list/product-list";
import { Suspense } from "react";

// This makes the page SSR-friendly by accepting searchParams
type HomeProps = {
	searchParams?: Promise<{
		search?: string;
		sizes?: string;
	}>;
};

export default async function Home({ searchParams }: HomeProps) {
	// Await searchParams as required by Next.js
	const resolvedSearchParams = await (searchParams ||
		Promise.resolve({
			search: undefined,
			sizes: undefined,
		}));

	// Parse URL params for SSR
	const initialFilters = {
		search: resolvedSearchParams.search,
		sizes: resolvedSearchParams.sizes?.split(",").filter(Boolean) || [],
	};

	return (
		<div>
			<h1>Fake products</h1>

			{/* Filters component */}
			<Suspense fallback={<div>Loading filters...</div>}>
				<ProductFilters initialFilters={initialFilters} />
			</Suspense>

			{/* Products - Simplified client approach */}
			<Suspense fallback={<div>Loading products...</div>}>
				<ProductList initialFilters={initialFilters} />
			</Suspense>
		</div>
	);
}
