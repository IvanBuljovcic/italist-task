import { Product } from "@/types/product";
import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(request: NextRequest) {
	try {
		// Get products from @/data/products.json
		// parse the file content and save it as a constant
		const filePath = path.join(process.cwd(), "src", "data", "products.json");
		const fileContent = readFileSync(filePath, "utf-8");
		const allProducts = JSON.parse(fileContent);

		// Query params
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search");
		const selectedSizes = searchParams.get("sizes")?.split(",").filter(Boolean) || [];

		// Paging setup
		const PRODUCTS_PER_PAGE = 20; // hardcoded but could be made as selectable on the UI
		const page = parseInt(searchParams.get("page") || "1");
		const offset = (page - 1) * PRODUCTS_PER_PAGE;

		let filteredProducts = allProducts;

		if (search) {
			filteredProducts = filteredProducts.filter(
				(product: Product) =>
					product.title.toLowerCase().includes(search.toLowerCase()) ||
					product.description.toLowerCase().includes(search.toLowerCase()) ||
					product.brand.toLowerCase().includes(search.toLowerCase())
			);
		}

		if (selectedSizes.length > 0) {
			filteredProducts = filteredProducts.filter((product: Product) => {
				if (!product.sizes) return false;
				const productSizes = product.sizes.split(",").map((size: string) => size.trim());
				return selectedSizes.some((selectedSize) => productSizes.includes(selectedSize));
			});
		}

		const totalCount = filteredProducts.length;
		const paginatedProducts = filteredProducts.slice(offset, offset + PRODUCTS_PER_PAGE);
		const hasNextPage = offset + PRODUCTS_PER_PAGE < totalCount;
		const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE);

		return NextResponse.json({
			success: true,
			data: paginatedProducts,
			pagination: {
				page,
				limit: PRODUCTS_PER_PAGE,
				totalCount,
				totalPages,
				hasNextPage,
				hasPrevPage: page > 1,
			},
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error(error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to load products",
			},
			{ status: 500 }
		);
	}
}
