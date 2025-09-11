"use client";

import { Product } from "@/types/product";
import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";

type SizesContextProps = {
	allSizes: string[];
	selectedSizes: string[];
	setSelectedSizes: (sizes: string[]) => void;
	toggleSize: (size: string) => void;
	clearSelectedSizes: () => void;
};

const SizesContext = createContext<SizesContextProps | undefined>(undefined);

export const useSizes = () => {
	const context = useContext(SizesContext);

	if (!context) {
		throw new Error("useSizes must be used within a SizesProvider");
	}

	return context;
};

type SizesProviderProps = PropsWithChildren & {
	products: Product[];
};

export const SizesProvider = ({ products, children }: SizesProviderProps) => {
	const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

	const allSizes = useMemo(() => {
		const sizeSet = new Set<string>();

		products.forEach((product) => {
			if (product.sizes?.trim()) {
				product.sizes
					.split(",") // didnt see any in the data but this is a wild guess that it should be comma or ';' separated
					.map((size) => size.trim())
					.forEach((size) => {
						if (size) sizeSet.add(size);
					});
			}
		});

		return Array.from(sizeSet).sort();
	}, [products]);

	const toggleSize = (size: string) => {
		setSelectedSizes((prevState) => {
			if (prevState.includes(size)) {
				return prevState.filter((s) => s !== size);
			}

			return [...prevState, size];
		});
	};

	const clearSelectedSizes = () => {
		setSelectedSizes([]);
	};

	const value: SizesContextProps = {
		allSizes,
		selectedSizes,
		setSelectedSizes,
		toggleSize,
		clearSelectedSizes,
	};

	return <SizesContext.Provider value={value}>{children}</SizesContext.Provider>;
};
