"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type FilterParams = {
	search?: string;
	sizes?: string[];
};

type UseFilterParamsReturn = {
	filters: FilterParams;
	updateFilter: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
	clearFilter: (key: keyof FilterParams) => void;
	clearAllFilters: () => void;
};

export const useFilterParams = (initialFilters: FilterParams = {}): UseFilterParamsReturn => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [filters, setFilters] = useState<FilterParams>(() => {
		const urlFilters: FilterParams = {};

		const search = searchParams.get("search");
		if (search) {
			urlFilters.search = search;
		}

		const sizes = searchParams.get("sizes");
		if (sizes) {
			urlFilters.sizes = sizes.split(",").filter(Boolean);
		}

		return { ...initialFilters, ...urlFilters };
	});

	const updateURL = useCallback(
		(newFilters: FilterParams) => {
			const params = new URLSearchParams();

			if (newFilters.search) {
				params.set("search", newFilters.search);
			}

			if (newFilters.sizes && newFilters.sizes.length > 0) {
				params.set("sizes", newFilters.sizes.join(","));
			}

			const newUrl = params.toString() ? `?${params.toString()}` : "/";
			router.push(newUrl, { scroll: false });
		},
		[router]
	);

	const updateFilter = useCallback(
		<K extends keyof FilterParams>(key: K, value: FilterParams[K]) => {
			const newFilters = { ...filters, [key]: value };

			setFilters(newFilters);
			updateURL(newFilters);
		},
		[filters, updateURL]
	);

	const clearFilter = useCallback(
		(key: keyof FilterParams) => {
			const newFilters = { ...filters };

			delete newFilters[key];

			setFilters(newFilters);
			updateURL(newFilters);
		},
		[filters, updateURL]
	);

	const clearAllFilters = useCallback(() => {
		setFilters({});

		router.push("/", { scroll: false });
	}, [router]);

	useEffect(() => {
		const urlFilters: FilterParams = {};

		const search = searchParams.get("search");

		if (search) {
			urlFilters.search = search;
		}

		const sizes = searchParams.get("sizes");

		if (sizes) {
			urlFilters.sizes = sizes.split(",").filter(Boolean);
		}

		const currentSizes = filters.sizes || [];
		const urlSizes = urlFilters.sizes || [];
		const currentSearch = filters.search || "";
		const urlSearch = urlFilters.search || "";

		const sizesChanged = JSON.stringify(currentSizes.sort()) !== JSON.stringify(urlSizes.sort());
		const searchChanged = currentSearch !== urlSearch;

		if (sizesChanged || searchChanged) {
			setFilters(urlFilters);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	return {
		filters,
		updateFilter,
		clearFilter,
		clearAllFilters,
	};
};
