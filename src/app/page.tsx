import SmartErrorBoundary from "@/components/error-boundary/error-boundary";
import { ProductFilters } from "@/components/product-filters/product-filters";
import { ProductList } from "@/components/product-list/product-list";
import { createStrictClassSelector } from "@/lib/class-selectors";
import { Suspense } from "react";
import styles from "./page.module.css";

const css = createStrictClassSelector(styles);

type HomeProps = {
	searchParams?: Promise<{
		search?: string;
		sizes?: string;
	}>;
};

export default async function Home({ searchParams }: HomeProps) {
	const resolvedSearchParams = await (searchParams ||
		Promise.resolve({
			search: undefined,
			sizes: undefined,
		}));

	const initialFilters = {
		search: resolvedSearchParams.search,
		sizes: resolvedSearchParams.sizes?.split(",").filter(Boolean) || [],
	};

	return (
		<main className={css("container")}>
			<h1 className={css("title")}>Fake products</h1>

			<SmartErrorBoundary
				context="Product Filters"
				level="component"
				maxRetries={3}
			>
				<Suspense fallback={<div>Loading filters...</div>}>
					<ProductFilters initialFilters={initialFilters} />
				</Suspense>
			</SmartErrorBoundary>

			<SmartErrorBoundary
				context="Product List"
				level="component"
				maxRetries={3}
			>
				<Suspense fallback={<div>Loading products...</div>}>
					<ProductList initialFilters={initialFilters} />
				</Suspense>
			</SmartErrorBoundary>
		</main>
	);
}
