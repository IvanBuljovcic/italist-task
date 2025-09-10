import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type ProductsApiOptions = {
	page: number;
	limit: number;
	category?: string;
	brand?: string;
	color?: string;
	search?: string;
	enabled?: boolean;
};

export const useProducts = ({ page, limit, category, brand, color, search, enabled }: ProductsApiOptions) => {
	return useQuery({
		queryKey: ["products", { page, limit, category, brand, color }],
		queryFn: async () => {
			const params = new URLSearchParams();

			params.append("page", page.toString());
			params.append("limit", limit.toString());

			if (category) {
				params.append("category", category);
			}

			if (brand) {
				params.append("brand", brand);
			}

			if (color) {
				params.append("color", color);
			}

			if (search) {
				params.append("color", search);
			}

			const response = await fetch(`${API_BASE_URL}/api/products?${params}`);

			return response.json();
		},
		enabled,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
