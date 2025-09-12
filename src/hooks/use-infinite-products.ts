import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

type ProductFilters = {
	search?: string;
	sizes?: string[];
};

const fetchProducts = async (filters: ProductFilters = {}, page: number = 1) => {
	const params = new URLSearchParams();

	params.append("page", page.toString());

	Object.entries(filters).forEach(([key, value]) => {
		if (value) {
			if (Array.isArray(value)) {
				if (value.length > 0) {
					params.append(key, value.join(","));
				}
			} else if (typeof value === "string" && value.trim() !== "") {
				params.append(key, value);
			}
		}
	});

	const url = `/api/products?${params.toString()}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const productKeys = {
	all: ["products"] as const,
	infinite: (filters?: ProductFilters) => [...productKeys.all, "infinite", filters] as const,
	list: (filters?: ProductFilters) => [...productKeys.all, "list", filters] as const,
};

export const useInfiniteProducts = (filters: ProductFilters = {}) => {
	return useInfiniteQuery({
		queryKey: productKeys.infinite(filters),
		queryFn: ({ pageParam }) => fetchProducts(filters, pageParam),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		select: (data) => ({
			pages: data.pages,
			pageParams: data.pageParams,
			allProducts: data.pages.flatMap((page) => page.data.products),
			allSizes: data.pages.flatMap((page) => page.data.sizes),
			totalCount: data.pages[data.pages.length - 1]?.pagination.totalCount || 0,
			hasNextPage: data.pages[data.pages.length - 1]?.pagination.hasNextPage || false,
		}),
	});
};

export const usePrefetchNextPage = () => {
	const queryClient = useQueryClient();

	const prefetchNextPage = (filters: ProductFilters, currentPage: number) => {
		queryClient.prefetchInfiniteQuery({
			queryKey: productKeys.infinite(filters),
			queryFn: ({ pageParam }) => fetchProducts(filters, pageParam),
			initialPageParam: 1,
			getNextPageParam: (lastPage) => {
				return lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined;
			},
			pages: currentPage + 1,
		});
	};

	return prefetchNextPage;
};
