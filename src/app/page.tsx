import { ProductList } from "@/components/product-list/product-list";
import { SizesProvider } from "@/context/sizes-context";
import products from "@/data/products.json";
import { Product } from "@/types/product";

export default function Home() {
	return (
		<div>
			<SizesProvider products={products as Product[]}>
				<ProductList products={products as Product[]} />
			</SizesProvider>
		</div>
	);
}
