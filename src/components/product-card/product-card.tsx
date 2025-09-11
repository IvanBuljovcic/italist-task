import { createStrictClassSelector } from "@/lib/class-selectors";
import { Product } from "@/types/product";
import { clsx } from "clsx";
import { Heart } from "lucide-react";
import Image from "next/image";
import styles from "./product-card.module.css";

const css = createStrictClassSelector(styles);

export const ProductCard = (props: Product) => {
	return (
		<article className={css("container")}>
			<div className={css("image-wrapper")}>
				<div className={css("tag-wrapper")}>
					<button type="submit" className={css("cta-favorites")}>
						<Heart width={12} height={12} />
					</button>
				</div>
				<Image src={props.image_link} alt={props.title} fill />
			</div>

			<header className={css("header")}>
				<h1 className={css("title")}>{props.title}</h1>
				<h2 className={css("category")}>{props.category}</h2>
				{/* Rating */}
			</header>

			<footer className={css("footer")}>
				<div className={css("prices")}>
					{props.sale_price && <span>{props.sale_price}</span>}
					<span className={clsx(props.sale_price && css("old-price"))}>{props.list_price}</span>
				</div>

				<button className={css("cta")} type="submit">
					Add To Cart
				</button>
			</footer>
		</article>
	);
};
