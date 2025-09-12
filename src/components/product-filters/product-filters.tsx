"use client";

import { SizeFilter } from "@/components/filters/size/filter-size";
import { useFilterParams } from "@/hooks/use-filter-params";
import { createStrictClassSelector } from "@/lib/class-selectors";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import styles from "./product-filters.module.css";

const css = createStrictClassSelector(styles);

type ProductFiltersType = {
	search?: string;
	sizes?: string[];
};

type ProductFiltersProps = {
	initialFilters?: ProductFiltersType;
};

const fetchSizes = async (): Promise<string[]> => {
	const response = await fetch("/api/products?page=1");

	if (!response.ok) {
		throw new Error("Failed to fetch sizes");
	}

	const result = await response.json();

	return result.data.sizes || [];
};

export const ProductFilters = ({ initialFilters = {} }: ProductFiltersProps) => {
	const { filters, updateFilter } = useFilterParams(initialFilters);

	const { data: sizes = [], isLoading } = useQuery({
		queryKey: ["sizes"],
		queryFn: fetchSizes,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});

	const handleSizeChange = useCallback(
		(newSelectedSizes: string[]) => {
			updateFilter("sizes", newSelectedSizes);
		},
		[updateFilter]
	);

	if (isLoading) {
		return (
			<div className={css("container")}>
				<div className={css("loading")}>Loading filters...</div>
			</div>
		);
	}

	return (
		<div className={css("container")}>
			<SizeFilter sizes={sizes} selectedSizes={filters.sizes || []} onSizeChange={handleSizeChange} />
		</div>
	);
};
