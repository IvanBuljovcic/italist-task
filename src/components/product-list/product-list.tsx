"use client";

import { ProductCard } from "@/components/product-card/product-card";
import { useProductListState } from "@/hooks/use-product-list-state";
import { createStrictClassSelector } from "@/lib/class-selectors";
import styles from "./product-list.module.css";

const css = createStrictClassSelector(styles);

type ProductFilters = {
	search?: string;
	sizes?: string[];
};

type ProductListProps = {
	initialFilters?: ProductFilters;
};

export const ProductList = ({ initialFilters = {} }: ProductListProps) => {
	const {
		products,
		totalCount,
		isLoading,
		isError,
		error,
		isFetchingNextPage,
		hasNextPage,
		triggerRef,
		prefetchRef,
		retry,
	} = useProductListState({ initialFilters });

	if (isLoading) {
		return (
			<div className={css("container")}>
				<div className={css("loading-indicator")}>Loading products...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className={css("container")}>
				<div className={css("error")}>
					<div>Failed to load products: {error?.message}</div>
					<button onClick={retry} type="button" className={css("try-again")}>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={css("container")}>
			{products.map((product) => (
				<ProductCard {...product} key={product.id} />
			))}

			{products.length === 0 && <div>No products found matching your criteria.</div>}

			{hasNextPage && (
				<div ref={triggerRef} className={css("load-trigger")}>
					{isFetchingNextPage && <div className={css("loading-indicator")}>Loading more products...</div>}
				</div>
			)}

			<div ref={prefetchRef} className={css("prefetch-target")} />

			<div>
				Showing {products.length} of {totalCount} products
				{!hasNextPage && products.length > 0 && <span> - All products loaded</span>}
			</div>
		</div>
	);
};
