"use client";

import { createStrictClassSelector } from "@/lib/class-selectors";
import { Product } from "@/types/product";
import { clsx } from "clsx";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import styles from "./product-card-image.module.css";

const css = createStrictClassSelector(styles);

type ProductCardImageProps = {
	src: Product["image_link"];
	alt: string;
};

export const ProductCardImage = ({ src, alt }: ProductCardImageProps) => {
	const [isImageLoading, setIsImageLoading] = useState(true);
	const [imageError, setImageError] = useState(false);

	const handleImageLoaded = () => {
		setIsImageLoading(false);
		setImageError(false);
	};

	const handleImageError = () => {
		setIsImageLoading(false);
		setImageError(true);
	};

	return (
		<>
			<Image
				src={src}
				alt={alt}
				width={300}
				height={483}
				loading="lazy"
				quality={85}
				placeholder="empty"
				onLoad={handleImageLoaded}
				onError={handleImageError}
				className={clsx(
					css("image"),
					isImageLoading && css("loading"),
					!isImageLoading && !imageError && css("loaded")
				)}
				style={{
					display: imageError ? "none" : "block",
				}}
			/>

			{isImageLoading && (
				<div className={css("image-placeholder")}>
					<div className={css("skeleton-loader")} />
				</div>
			)}

			{imageError && (
				<div className={css("image-error")}>
					<ImageOff size={48} className={css("error-icon")} />
					<span className={css("error-text")}>Image unavailable</span>
				</div>
			)}
		</>
	);
};
