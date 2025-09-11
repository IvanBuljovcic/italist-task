"use client";

import { createStrictClassSelector } from "@/lib/class-selectors";
import { Product } from "@/types/product";
import { clsx } from "clsx";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import styles from "./product-card.module.css";

const css = createStrictClassSelector(styles);

export const ProductCard = (props: Product) => {
	const [isImageLoading, setIsImageLoading] = useState(true);

	return (
		<article className={css("container")}>
			<div className={css("image-wrapper")}>
				<div className={css("tag-wrapper")}>
					<button type="submit" className={css("cta-favorites")}>
						<Heart width={12} height={12} />
					</button>
				</div>

				{isImageLoading && (
					<div className={css("image-placeholder")}>
						<div className={css("skeleton-loader")}></div>
					</div>
				)}

				<Image
					src={props.image_link}
					alt={props.title}
					width={300}
					height={483}
					loading="lazy"
					quality={85}
					placeholder="empty"
					onLoad={() => setIsImageLoading(false)}
					className={clsx(isImageLoading ? css("loading") : css("loaded"))}
				/>
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
