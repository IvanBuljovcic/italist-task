import { ProductFilters } from "@/components/product-filters/product-filters";
import { ProductList } from "@/components/product-list/product-list";
import { Suspense } from "react";

type HomeProps = {
	searchParams?: {
		search?: string;
		sizes?: string;
	};
};

export default function Home({ searchParams }: HomeProps) {
	const initialFilters = {
		search: searchParams?.search,
		sizes: searchParams?.sizes?.split(",").filter(Boolean) || [],
	};

	return (
		<div>
			<h1>Fake products</h1>
			<Suspense fallback={<div>Loading filters...</div>}>
				<ProductFilters initialFilters={initialFilters} />
			</Suspense>
			<Suspense fallback={<div>Loading products...</div>}>
				<ProductList initialFilters={initialFilters} />
			</Suspense>
		</div>
	);
}
