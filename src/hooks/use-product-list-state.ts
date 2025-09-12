"use client";

import { useFilterParams } from "@/hooks/use-filter-params";
import { useInfiniteProducts, usePrefetchNextPage } from "@/hooks/use-infinite-products";
import { Product } from "@/types/product";
import { useCallback } from "react";
import { useInfiniteScroll } from "./use-infinite-scroll";
import { usePrefetch } from "./use-prefetch";

type ProductFilters = {
	search?: string;
	sizes?: string[];
};

type UseProductListStateOptions = {
	initialFilters?: ProductFilters;
};

type UseProductListStateReturn = {
	products: Product[];
	totalCount: number;
	
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	isFetchingNextPage: boolean;
	hasNextPage: boolean;
	
	triggerRef: React.RefObject<HTMLDivElement | null>;
	prefetchRef: React.RefObject<HTMLDivElement | null>;
	
	retry: () => void;
};

export const useProductListState = ({ 
	initialFilters = {} 
}: UseProductListStateOptions): UseProductListStateReturn => {
	const { filters } = useFilterParams(initialFilters);
	
	const { 
		data, 
		hasNextPage, 
		fetchNextPage, 
		isFetchingNextPage, 
		isLoading, 
		isError, 
		error,
	} = useInfiniteProducts(filters);
	
	const prefetchNextPage = usePrefetchNextPage();
	
	const allProducts = data?.allProducts || [];
	const totalCount = data?.totalCount || 0;
	const currentPage = data?.pages?.length || 1;
	
	const handlePrefetch = useCallback(() => {
		prefetchNextPage(filters, currentPage);
	}, [prefetchNextPage, filters, currentPage]);
	
	const { triggerRef } = useInfiniteScroll({
		hasNextPage,
		isFetchingNextPage,
		onLoadMore: async () => {
			await fetchNextPage();
		},
	});
	
	const { prefetchRef } = usePrefetch({
		hasNextPage,
		onPrefetch: handlePrefetch,
		data: { filters, currentPage },
	});
	
	const retry = useCallback(() => {
		window.location.reload();
	}, []);
	
	return {
		products: allProducts,
		totalCount,
		isLoading,
		isError,
		error,
		isFetchingNextPage,
		hasNextPage,
		triggerRef,
		prefetchRef,
		retry,
	};
};