"use client";

import { createStrictClassSelector } from "@/lib/class-selectors";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import styles from "./filter-search.module.css";

const css = createStrictClassSelector(styles);

type SearchFilterProps = {
	value?: string;
	onChange: (value: string | undefined) => void;
	placeholder?: string;
	debounceMs?: number;
	showStats?: boolean;
	resultCount?: number;
};

export const SearchFilter = ({
	value = "",
	onChange,
	placeholder = "Search products...",
	debounceMs = 300,
	showStats = false,
	resultCount = 0,
}: SearchFilterProps) => {
	const [inputValue, setInputValue] = useState(value);
	const [isDebouncing, setIsDebouncing] = useState(false);

	useEffect(() => {
		if (inputValue === value) {
			setIsDebouncing(false);
			return;
		}

		setIsDebouncing(true);
		const timer = setTimeout(() => {
			onChange(inputValue || undefined);
			setIsDebouncing(false);
		}, debounceMs);

		return () => {
			clearTimeout(timer);
			setIsDebouncing(false);
		};
	}, [inputValue, onChange, debounceMs, value]);

	useEffect(() => {
		setInputValue(value || "");
	}, [value]);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	}, []);

	return (
		<div className={css("container")}>
			<div className={css("input-container")}>
				<Search className={css("icon")} />

				<input
					type="search"
					value={inputValue}
					onChange={handleInputChange}
					placeholder={placeholder}
					className={css("search-input")}
					aria-label="Search products"
				/>
			</div>

			{showStats && inputValue && (
				<div className={css("search-stats")}>
					{isDebouncing && <span>Searching...</span>}

					{!isDebouncing && (
						<span>
							{resultCount} {resultCount === 1 ? "result" : "results"} for &quot;{inputValue}&quot;
						</span>
					)}
				</div>
			)}
		</div>
	);
};
