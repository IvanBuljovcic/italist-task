"use client";

import { useCallback, useEffect, useRef } from "react";

type UsePrefetchOptions<T> = {
	hasNextPage: boolean;
	onPrefetch: (data: T) => void;
	data: T;
	rootMargin?: string;
	threshold?: number;
};

type UsePrefetchReturn = {
	prefetchRef: React.RefObject<HTMLDivElement | null>;
};

export const usePrefetch = <T>({
	hasNextPage,
	onPrefetch,
	data,
	rootMargin = "400px",
	threshold = 0.1,
}: UsePrefetchOptions<T>): UsePrefetchReturn => {
	const prefetchRef = useRef<HTMLDivElement>(null);

	const handlePrefetch = useCallback(() => {
		if (hasNextPage) {
			onPrefetch(data);
		}
	}, [hasNextPage, onPrefetch, data]);

	useEffect(() => {
		const prefetchObserver = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					handlePrefetch();
				}
			},
			{
				threshold,
				rootMargin,
			}
		);

		const prefetchCurrent = prefetchRef.current;
		if (prefetchCurrent) {
			prefetchObserver.observe(prefetchCurrent);
		}

		return () => {
			if (prefetchCurrent) {
				prefetchObserver.unobserve(prefetchCurrent);
			}
		};
	}, [handlePrefetch, threshold, rootMargin]);

	return { prefetchRef };
};
