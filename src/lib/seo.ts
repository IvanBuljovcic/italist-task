// src/lib/seo.ts
import { ProductFiltersType } from "@/components/product-filters/product-filters";
import { Product } from "@/types/product";
import type { Metadata } from "next";

type SEOParams = {
	search?: string;
	sizes?: string[];
	page?: number;
	category?: string;
};

const SITE_NAME = "Italist Fashion Store";
const SITE_DESCRIPTION =
	"Discover premium fashion products from top brands. Shop clothing, accessories, and bags with fast shipping.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Generates dynamic metadata based on current filters and search parameters
 */
export function generateProductPageMetadata(params: SEOParams): Metadata {
	const { search, sizes, page = 1, category } = params;

	// Build dynamic title
	let title = SITE_NAME;
	let description = SITE_DESCRIPTION;

	if (search) {
		title = `"${search}" - Search Results | ${SITE_NAME}`;
		description = `Find products matching "${search}". Browse our collection of premium fashion items.`;
	}

	if (category) {
		title = `${category} Collection | ${SITE_NAME}`;
		description = `Shop our ${category.toLowerCase()} collection. Premium quality, latest trends.`;
	}

	if (sizes && sizes.length > 0) {
		const sizeText = sizes.length === 1 ? `Size ${sizes[0]}` : `Sizes ${sizes.join(", ")}`;
		title = search ? `"${search}" in ${sizeText} | ${SITE_NAME}` : `${sizeText} Products | ${SITE_NAME}`;
		description = `Find products in ${sizeText.toLowerCase()}. ${description}`;
	}

	if (page > 1) {
		title = `${title} - Page ${page}`;
	}

	// Build canonical URL
	const url = new URL(SITE_URL);
	if (search) url.searchParams.set("search", search);
	if (sizes && sizes.length > 0) url.searchParams.set("sizes", sizes.join(","));
	if (page > 1) url.searchParams.set("page", page.toString());

	// Generate keywords
	const keywords = [
		"fashion",
		"clothing",
		"accessories",
		"bags",
		"premium",
		"designer",
		...(search ? [search] : []),
		...(sizes || []),
		...(category ? [category] : []),
	];

	return {
		title,
		description,
		keywords: keywords.join(", "),

		// Canonical URL
		alternates: {
			canonical: url.toString(),
		},

		// Open Graph
		openGraph: {
			title,
			description,
			url: url.toString(),
			siteName: SITE_NAME,
			type: "website",
			images: [
				{
					url: `${SITE_URL}/og-image.jpg`,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
			locale: "en_US",
		},

		// Twitter Card
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`${SITE_URL}/og-image.jpg`],
			creator: "@yourbrand",
			site: "@yourbrand",
		},

		// Additional meta tags
		other: {
			"product-count": "dynamic", // Will be replaced with actual count
			"filter-applied": search || sizes?.length ? "true" : "false",
		},

		// Robots
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
	};
}

/**
 * Generates JSON-LD structured data for the product catalog
 */
export async function generateStructuredData(filters: { search?: string; sizes?: string[] }) {
	try {
		// Fetch products for structured data (first page only for SEO)
		const products = await fetchProductsForSEO(filters);

		const baseStructuredData = {
			"@context": "https://schema.org",
			"@graph": [
				// Website schema
				{
					"@type": "WebSite",
					"@id": `${SITE_URL}/#website`,
					url: SITE_URL,
					name: SITE_NAME,
					description: SITE_DESCRIPTION,
					potentialAction: [
						{
							"@type": "SearchAction",
							target: {
								"@type": "EntryPoint",
								urlTemplate: `${SITE_URL}/?search={search_term_string}`,
							},
							"query-input": "required name=search_term_string",
						},
					],
				},

				// WebPage schema
				{
					"@type": "WebPage",
					"@id": `${SITE_URL}/#webpage`,
					url: SITE_URL,
					name: filters.search ? `Search Results for "${filters.search}"` : "Product Catalog",
					isPartOf: { "@id": `${SITE_URL}/#website` },
					description: SITE_DESCRIPTION,
				},

				// ItemList schema for products
				{
					"@type": "ItemList",
					"@id": `${SITE_URL}/#productlist`,
					name: filters.search ? `Products matching "${filters.search}"` : "All Products",
					description: `Browse our collection of premium fashion products`,
					numberOfItems: products.length,
					itemListElement: products.map((product, index) => ({
						"@type": "ListItem",
						position: index + 1,
						item: {
							"@type": "Product",
							"@id": `${SITE_URL}/product/${product.id}`,
							name: product.title,
							description: product.description,
							image: product.image_link,
							brand: {
								"@type": "Brand",
								name: product.brand,
							},
							category: product.category,
							offers: {
								"@type": "Offer",
								price: parseFloat(product.sale_price || product.list_price),
								priceCurrency: "USD",
								availability:
									product.availability === "In stock"
										? "https://schema.org/InStock"
										: "https://schema.org/OutOfStock",
								condition: "https://schema.org/NewCondition",
							},
							sku: product.gtin || product.mpn,
							gtin: product.gtin,
						},
					})),
				},

				// BreadcrumbList schema
				{
					"@type": "BreadcrumbList",
					"@id": `${SITE_URL}/#breadcrumb`,
					itemListElement: [
						{
							"@type": "ListItem",
							position: 1,
							name: "Home",
							item: SITE_URL,
						},
						...(filters.search
							? [
									{
										"@type": "ListItem",
										position: 2,
										name: `Search: ${filters.search}`,
										item: `${SITE_URL}/?search=${encodeURIComponent(filters.search)}`,
									},
								]
							: []),
					],
				},
			],
		};

		return baseStructuredData;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Error generating structured data:", error);
		// Return minimal structured data on error
		return {
			"@context": "https://schema.org",
			"@type": "WebSite",
			url: SITE_URL,
			name: SITE_NAME,
			description: SITE_DESCRIPTION,
		};
	}
}

/**
 * Fetch products specifically for SEO structured data (server-side only)
 */
async function fetchProductsForSEO(filters: ProductFiltersType = {}): Promise<Product[]> {
	try {
		const params = new URLSearchParams();
		params.append("page", "1");
		params.append("limit", "10"); // Limit for SEO performance

		if (filters.search) {
			params.append("search", filters.search);
		}

		if (filters.sizes && filters.sizes.length > 0) {
			params.append("sizes", filters.sizes.join(","));
		}

		// Use internal API endpoint
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/products?${params.toString()}`, {
			// Add cache headers for performance
			next: { revalidate: 300 }, // 5 minutes
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const result = await response.json();
		return result.data.products || [];
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Error fetching products for SEO:", error);
		return [];
	}
}

/**
 * Generate meta tags for individual product pages (if you add them later)
 */
export function generateProductMetadata(product: Product): Metadata {
	const title = `${product.title} - ${product.brand} | ${SITE_NAME}`;
	const description = `${product.description} Available in ${product.sizes || "various sizes"}. Premium quality from ${product.brand}.`;
	const price = product.sale_price || product.list_price;

	return {
		title,
		description,
		keywords: `${product.title}, ${product.brand}, ${product.category}, fashion, ${product.color}`,

		openGraph: {
			title,
			description,
			type: "website",
			images: [
				{
					url: product.image_link,
					width: 800,
					height: 600,
					alt: product.title,
				},
			],
		},

		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [product.image_link],
		},

		// Product-specific meta
		other: {
			"product:price:amount": price,
			"product:price:currency": "USD",
			"product:availability": product.availability,
			"product:brand": product.brand,
			"product:category": product.category,
		},
	};
}

/**
 * Generate canonical URLs for different filter combinations
 */
export function generateCanonicalUrl(params: SEOParams): string {
	const url = new URL(SITE_URL);

	// Only add significant parameters to canonical URL
	if (params.search) {
		url.searchParams.set("search", params.search);
	}

	if (params.sizes && params.sizes.length > 0) {
		url.searchParams.set("sizes", params.sizes.join(","));
	}

	if (params.category) {
		url.searchParams.set("category", params.category);
	}

	// Don't include page parameter in canonical for better SEO
	// Each page should be treated as unique content

	return url.toString();
}
