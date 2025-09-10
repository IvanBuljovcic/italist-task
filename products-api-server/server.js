const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Load product data first
let productsData = [];

const loadProductData = () => {
	try {
		const dataPath = path.join(__dirname, "products.json");
		const rawData = fs.readFileSync(dataPath, "utf8");
		productsData = JSON.parse(rawData);
		console.log(`✅ Loaded ${productsData.length} products from data file`);
	} catch (error) {
		console.error("❌ Error loading products.json:", error.message);
		console.log("Please ensure products.json exists in the server directory");
	}
};

// Initialize data
loadProductData();

// Middleware setup
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request timing and logging middleware
app.use((req, res, next) => {
	req.startTime = Date.now();
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, req.query);
	next();
});

// API Routes

// Home route - API documentation
app.get("/", (req, res) => {
	res.json({
		message: "Products API Server",
		version: "1.0.0",
		express_version: "5.x",
		endpoints: {
			products: "/api/products",
			singleProduct: "/api/products/:id",
			filters: "/api/filters",
			health: "/health",
		},
		totalProducts: productsData.length,
	});
});

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({
		success: true,
		status: "healthy",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		environment: process.env.NODE_ENV || "development",
		nodeVersion: process.version,
		totalProducts: productsData.length,
		memoryUsage: process.memoryUsage(),
	});
});

// Get available filter options
app.get("/api/filters", (req, res) => {
	try {
		const categories = [...new Set(productsData.map((item) => item.category).filter(Boolean))].sort();

		const brands = [...new Set(productsData.map((item) => item.brand).filter(Boolean))].sort();

		const colors = [...new Set(productsData.map((item) => item.color).filter(Boolean))].sort();

		const prices = productsData.map((item) => parseFloat(item.sale_price)).filter((price) => !isNaN(price));

		const priceRange =
			prices.length > 0
				? {
						min: Math.min(...prices),
						max: Math.max(...prices),
					}
				: { min: 0, max: 0 };

		res.json({
			success: true,
			data: {
				categories,
				brands,
				colors,
				priceRange,
				totalProducts: productsData.length,
			},
			meta: {
				requestTime: new Date().toISOString(),
				categoriesCount: categories.length,
				brandsCount: brands.length,
				colorsCount: colors.length,
			},
		});
	} catch (error) {
		console.error("Error in /api/filters:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
			message: error.message,
		});
	}
});

// Get products with pagination and filtering
app.get("/api/products", (req, res) => {
	try {
		// Extract and validate pagination parameters
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
		const offset = (page - 1) * limit;

		// Extract filter parameters
		const filters = {
			category: req.query.category ? req.query.category.trim() : "",
			brand: req.query.brand ? req.query.brand.trim() : "",
			color: req.query.color ? req.query.color.trim() : "",
			search: req.query.search ? req.query.search.trim() : "",
			minPrice: parseFloat(req.query.minPrice) || 0,
			maxPrice: parseFloat(req.query.maxPrice) || Infinity,
		};

		// Apply filters
		let filteredProducts = productsData.filter((product) => {
			// Category filter
			if (filters.category) {
				if (!product.category || !product.category.toLowerCase().includes(filters.category.toLowerCase())) {
					return false;
				}
			}

			// Brand filter
			if (filters.brand) {
				if (!product.brand || !product.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
					return false;
				}
			}

			// Color filter
			if (filters.color) {
				if (!product.color || !product.color.toLowerCase().includes(filters.color.toLowerCase())) {
					return false;
				}
			}

			// Search filter
			if (filters.search) {
				const searchTerm = filters.search.toLowerCase();
				const searchableFields = [product.title, product.description, product.brand];
				const searchableText = searchableFields.filter(Boolean).join(" ").toLowerCase();

				if (!searchableText.includes(searchTerm)) {
					return false;
				}
			}

			// Price range filter
			const salePrice = parseFloat(product.sale_price) || 0;
			if (salePrice < filters.minPrice || salePrice > filters.maxPrice) {
				return false;
			}

			return true;
		});

		// Calculate pagination metadata
		const totalItems = filteredProducts.length;
		const totalPages = Math.ceil(totalItems / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		// Get paginated data
		const paginatedProducts = filteredProducts.slice(offset, offset + limit);

		// Send response
		res.json({
			success: true,
			data: paginatedProducts,
			pagination: {
				currentPage: page,
				totalPages,
				totalItems,
				itemsPerPage: limit,
				hasNextPage,
				hasPrevPage,
				startIndex: offset + 1,
				endIndex: Math.min(offset + limit, totalItems),
			},
			appliedFilters: filters,
			meta: {
				requestTime: new Date().toISOString(),
				processingTime: `${Date.now() - req.startTime}ms`,
			},
		});
	} catch (error) {
		console.error("Error in /api/products:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
			message: error.message,
		});
	}
});

// Get single product by ID
app.get("/api/products/:id", (req, res) => {
	try {
		const productId = parseInt(req.params.id);

		if (isNaN(productId)) {
			return res.status(400).json({
				success: false,
				error: "Invalid product ID",
				message: "Product ID must be a number",
			});
		}

		const product = productsData.find((item) => item.id === productId);

		if (!product) {
			return res.status(404).json({
				success: false,
				error: "Product not found",
				message: `Product with ID ${productId} does not exist`,
			});
		}

		res.json({
			success: true,
			data: product,
			meta: {
				requestTime: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("Error in /api/products/:id:", error);
		res.status(500).json({
			success: false,
			error: "Internal server error",
			message: error.message,
		});
	}
});

// Reload data endpoint (development utility)
app.post("/api/reload", (req, res) => {
	try {
		const oldCount = productsData.length;
		loadProductData();
		res.json({
			success: true,
			message: "Data reloaded successfully",
			oldCount,
			newCount: productsData.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "Failed to reload data",
			message: error.message,
		});
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err);
	res.status(500).json({
		success: false,
		error: "Internal server error",
		message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
	});
});

// 404 handler for unmatched routes
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: "Route not found",
		message: `The route ${req.method} ${req.originalUrl} does not exist`,
		availableRoutes: [
			"GET /",
			"GET /api/products",
			"GET /api/products/:id",
			"GET /api/filters",
			"GET /health",
			"POST /api/reload",
		],
	});
});

// Start server
const server = app.listen(PORT, () => {
	console.log("🚀 Express 5.x server starting...");
	console.log(`📡 Server running on http://localhost:${PORT}`);
	console.log(`🔍 API Base URL: http://localhost:${PORT}/api`);
	console.log(`💊 Health Check: http://localhost:${PORT}/health`);
	console.log(`📊 Total Products: ${productsData.length}`);
	console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
	console.log("✅ Server ready to handle requests!");
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
	console.log(`👋 ${signal} received, shutting down gracefully`);
	server.close((err) => {
		if (err) {
			console.error("Error during server shutdown:", err);
			process.exit(1);
		}
		console.log("✅ Server closed successfully");
		process.exit(0);
	});
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
