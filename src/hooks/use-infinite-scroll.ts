"use client";

import { useCallback, useEffect, useRef } from "react";

type UseInfiniteScrollOptions = {
	hasNextPage: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => Promise<void> | void;
	rootMargin?: string;
	threshold?: number;
};

type UseInfiniteScrollReturn = {
	triggerRef: React.RefObject<HTMLDivElement | null>;
};

export const useInfiniteScroll = ({
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
	rootMargin = "200px",
	threshold = 0.1,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
	const triggerRef = useRef<HTMLDivElement | null>(null);

	const loadNextPage = useCallback(async () => {
		if (isFetchingNextPage || !hasNextPage) {
			return;
		}

		try {
			await onLoadMore();
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Failed to load more items:", error);
		}
	}, [isFetchingNextPage, hasNextPage, onLoadMore]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					loadNextPage();
				}
			},
			{
				threshold,
				rootMargin,
			}
		);

		const currentTarget = triggerRef.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [loadNextPage, threshold, rootMargin]);

	return { triggerRef };
};
