"use client";

import { ProductCard } from "@/components/product-card/product-card";
import { useInfiniteProducts, usePrefetchNextPage } from "@/hooks/infinite-products";
import { createStrictClassSelector } from "@/lib/class-selectors";
import { useCallback, useEffect, useRef } from "react";
import styles from "./product-list.module.css";

const css = createStrictClassSelector(styles);

type ProductFilters = {
	search?: string;
	sizes?: string[];
};

type ProductListProps = {
	filters?: ProductFilters;
};

export const ProductList = ({ filters = {} }: ProductListProps) => {
	const observerTarget = useRef<HTMLDivElement>(null);
	const prefetchTarget = useRef<HTMLDivElement>(null);

	const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading, isError, error } =
		useInfiniteProducts(filters);

	const prefetchNextPage = usePrefetchNextPage();

	const allProducts = data?.allProducts || [];
	const totalCount = data?.totalCount || 0;
	const currentPage = data?.pages?.length || 1;

	const handlePrefetch = useCallback(() => {
		if (hasNextPage) {
			prefetchNextPage(filters, currentPage);
		}
	}, [hasNextPage, prefetchNextPage, filters, currentPage]);

	const loadNextPage = useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage) {
			return;
		}

		try {
			await fetchNextPage();
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Failed to load more products:", error);
		}
	}, [isFetchingNextPage, hasNextPage, fetchNextPage]);

	useEffect(() => {
		const prefetchObserver = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					handlePrefetch();
				}
			},
			{
				threshold: 0.1,
				rootMargin: "400px", // Larger margin for prefetching
			}
		);

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					loadNextPage();
				}
			},
			{
				threshold: 0.1,
				rootMargin: "200px",
			}
		);

		const prefetchCurrent = prefetchTarget.current;
		if (prefetchCurrent) {
			prefetchObserver.observe(prefetchCurrent);
		}

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (prefetchCurrent) {
				prefetchObserver.unobserve(prefetchCurrent);
			}

			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [loadNextPage, handlePrefetch]);

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
					<button onClick={() => window.location.reload()} type="button" className={css("try-again")}>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={css("container")}>
			{allProducts.map((product) => (
				<ProductCard {...product} key={product.id} />
			))}

			{allProducts.length === 0 && !isLoading && <div>No products found matching your criteria.</div>}

			{hasNextPage && (
				<div ref={observerTarget} className={css("load-trigger")}>
					{isFetchingNextPage && <div className={css("loading-indicator")}>Loading more products...</div>}
				</div>
			)}

			<div>
				Showing {allProducts.length} of {totalCount} products
				{!hasNextPage && allProducts.length > 0 && <span>All products loaded</span>}
			</div>
		</div>
	);
};
