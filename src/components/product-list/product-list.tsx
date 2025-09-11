"use client";

import { ProductCard } from "@/components/product-card/product-card";
import { createStrictClassSelector } from "@/lib/class-selectors";
import { Product } from "@/types/product";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./product-list.module.css";

const css = createStrictClassSelector(styles);

type ProductListProps = {
	products: Product[];
};

export const ProductList = ({ products }: ProductListProps) => {
	const ITEMS_PER_LOAD = 20;
	const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const observerTarget = useRef(null);

	// const { allSizes } = useSizes();

	const hasMoreProducts = visibleCount < products.length;
	const visibleProducts = products.slice(0, visibleCount);

	const loadMoreProducts = useCallback(async () => {
		if (isLoading || !hasMoreProducts) {
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await new Promise((resolve) => setTimeout(resolve, 300)); // adding timeout to mimic an API request load time

			setVisibleCount((prev) => Math.min(prev + ITEMS_PER_LOAD, products.length));
		} catch (error) {
			setError("Failed to load more products");
			// eslint-disable-next-line no-console
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	}, [isLoading, hasMoreProducts, products.length]);

	const listWrapper = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;

				if (entry.isIntersecting) {
					loadMoreProducts();
				}
			},
			{
				threshold: 0.1,
				rootMargin: "200px",
			}
		);

		const currentTarget = observerTarget.current;

		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [loadMoreProducts]);

	return (
		<div ref={listWrapper} className={css("container")}>
			{visibleProducts.map((product) => (
				<ProductCard {...(product as Product)} key={product.id} />
			))}

			{hasMoreProducts && (
				<div ref={observerTarget} className={css("load-trigger")}>
					{isLoading && <div className={css("loading-indicator")}>Loading more products...</div>}

					{error && (
						<div className={css("error")}>
							<div>{error}</div>

							<button onClick={loadMoreProducts} type="button" className={css("try-again")}>
								Try Again
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
