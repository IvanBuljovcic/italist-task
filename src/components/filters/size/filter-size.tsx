"use client";

import { createStrictClassSelector } from "@/lib/class-selectors";
import clsx from "clsx";
import { useState } from "react";
import styles from "./filter-size.module.css";

const css = createStrictClassSelector(styles);

type SizeFilterProps = {
	sizes: string[];
	selectedSizes: string[];
	onSizeChange: (selectedSizes: string[]) => void;
	initialVisibleCount?: number;
};

export const SizeFilter = ({ sizes, selectedSizes, onSizeChange, initialVisibleCount = 5 }: SizeFilterProps) => {
	const [showAll, setShowAll] = useState(false);

	if (!sizes || sizes.length === 0) {
		return null;
	}

	const handleSizeClick = (size: string) => {
		if (selectedSizes.includes(size)) {
			return onSizeChange(selectedSizes.filter((s) => s !== size));
		}

		return onSizeChange([...selectedSizes, size]);
	};

	const handleShowMore = () => {
		setShowAll(true);
	};

	const handleShowLess = () => {
		setShowAll(false);
	};

	const sizesToShow = showAll ? sizes : sizes.slice(0, initialVisibleCount);
	const hasMoreSizes = sizes.length > initialVisibleCount;

	return (
		<div className={css("container")}>
			<h3 className={css("title")}>Sizes</h3>
			<div className={css("button-container")}>
				{sizesToShow.map((size) => (
					<button
						key={size}
						onClick={() => handleSizeClick(size)}
						className={clsx(css("size-button"), selectedSizes.includes(size) && css("selected"))}
						type="button"
					>
						{size}
					</button>
				))}

				{hasMoreSizes && !showAll && (
					<button onClick={handleShowMore} className={css("size-button", "action")} type="button">
						Show More ({sizes.length - initialVisibleCount} more)
					</button>
				)}

				{showAll && hasMoreSizes && (
					<button onClick={handleShowLess} className={css("size-button", "action")} type="button">
						Show Less
					</button>
				)}

				{!!selectedSizes.length && (
					<button onClick={() => onSizeChange([])} className={css("clear-button")} type="button">
						Clear all
					</button>
				)}
			</div>
			{selectedSizes.length > 0 && `${selectedSizes.length} sizes selected`}
		</div>
	);
};
