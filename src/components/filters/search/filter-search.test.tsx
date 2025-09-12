import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchFilter } from "./filter-search";

// Mock the CSS modules
vi.mock("./filter-search.module.css", () => ({
	default: {
		container: "container",
		"input-container": "input-container",
		icon: "icon",
		"search-input": "search-input",
		"search-stats": "search-stats",
	},
}));

vi.mock("@/styles/utils.module.css", () => ({
	default: {
		relative: "relative",
	},
}));

vi.mock("@/lib/class-selectors", () => ({
	createStrictClassSelector: (styles: Record<string, string>) => (className: string) => styles[className],
}));

describe("SearchFilter", () => {
	const mockOnChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	it("renders with default props", () => {
		render(<SearchFilter onChange={mockOnChange} />);

		const input = screen.getByRole("searchbox");
		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute("placeholder", "Search products");
		expect(input).toHaveAttribute("aria-label", "Search products");
		expect(input).toHaveValue("");
	});

	it("renders with custom placeholder", () => {
		render(<SearchFilter onChange={mockOnChange} placeholder="Search items" />);

		const input = screen.getByRole("searchbox");
		expect(input).toHaveAttribute("placeholder", "Search items");
	});

	it("renders with initial value", () => {
		render(<SearchFilter onChange={mockOnChange} value="initial search" />);

		const input = screen.getByRole("searchbox");
		expect(input).toHaveValue("initial search");
	});

	it("updates input value when user types", () => {
		render(<SearchFilter onChange={mockOnChange} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test search" } });

		expect(input).toHaveValue("test search");
	});

	it("calls onChange after debounce delay with default 300ms", async () => {
		render(<SearchFilter onChange={mockOnChange} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		// Should not call onChange immediately
		expect(mockOnChange).not.toHaveBeenCalled();

		// Wait for debounce delay
		await waitFor(
			() => {
				expect(mockOnChange).toHaveBeenCalledWith("test");
			},
			{ timeout: 1000 }
		);
	});

	it("calls onChange after custom debounce delay", async () => {
		render(<SearchFilter onChange={mockOnChange} debounceMs={100} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		// Should not call onChange immediately
		expect(mockOnChange).not.toHaveBeenCalled();

		// Wait for custom debounce delay
		await waitFor(
			() => {
				expect(mockOnChange).toHaveBeenCalledWith("test");
			},
			{ timeout: 500 }
		);
	});

	it("resets debounce timer when user types again", async () => {
		render(<SearchFilter onChange={mockOnChange} debounceMs={200} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		// Wait a bit then type more
		setTimeout(() => {
			fireEvent.change(input, { target: { value: "test more" } });
		}, 100);

		// Should eventually call with the final value
		await waitFor(
			() => {
				expect(mockOnChange).toHaveBeenCalledWith("test more");
			},
			{ timeout: 1000 }
		);

		// Should only have been called once (timer was reset)
		expect(mockOnChange).toHaveBeenCalledTimes(1);
	});

	it("calls onChange with undefined when input is cleared", async () => {
		render(<SearchFilter onChange={mockOnChange} value="initial" />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "" } });

		await waitFor(
			() => {
				expect(mockOnChange).toHaveBeenCalledWith(undefined);
			},
			{ timeout: 1000 }
		);
	});

	it("updates input value when value prop changes", () => {
		const { rerender } = render(<SearchFilter onChange={mockOnChange} value="initial" />);

		const input = screen.getByRole("searchbox");
		expect(input).toHaveValue("initial");

		rerender(<SearchFilter onChange={mockOnChange} value="updated" />);
		expect(input).toHaveValue("updated");
	});

	it("does not show stats when showStats is false", () => {
		render(<SearchFilter onChange={mockOnChange} showStats={false} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		expect(screen.queryByText(/Searching.../)).not.toBeInTheDocument();
		expect(screen.queryByText(/results for/)).not.toBeInTheDocument();
	});

	it("shows 'Searching...' during debounce when showStats is true", async () => {
		render(<SearchFilter onChange={mockOnChange} showStats={true} debounceMs={200} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		// Should show "Searching..." immediately
		expect(screen.getByText("Searching...")).toBeInTheDocument();

		// Should disappear after debounce
		await waitFor(
			() => {
				expect(screen.queryByText("Searching...")).not.toBeInTheDocument();
			},
			{ timeout: 1000 }
		);
	});

	it("shows result count after debounce completes", async () => {
		render(<SearchFilter onChange={mockOnChange} showStats={true} resultCount={5} debounceMs={100} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		await waitFor(
			() => {
				expect(screen.getByText('5 results for "test"')).toBeInTheDocument();
			},
			{ timeout: 500 }
		);
	});

	it("shows singular 'result' when resultCount is 1", async () => {
		render(<SearchFilter onChange={mockOnChange} showStats={true} resultCount={1} debounceMs={100} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		await waitFor(
			() => {
				expect(screen.getByText('1 result for "test"')).toBeInTheDocument();
			},
			{ timeout: 500 }
		);
	});

	it("shows plural 'results' when resultCount is 0", async () => {
		render(<SearchFilter onChange={mockOnChange} showStats={true} resultCount={0} debounceMs={100} />);

		const input = screen.getByRole("searchbox");
		fireEvent.change(input, { target: { value: "test" } });

		await waitFor(
			() => {
				expect(screen.getByText('0 results for "test"')).toBeInTheDocument();
			},
			{ timeout: 500 }
		);
	});

	it("does not show stats when input is empty", () => {
		render(<SearchFilter onChange={mockOnChange} showStats={true} resultCount={5} />);

		expect(screen.queryByText(/results for/)).not.toBeInTheDocument();
		expect(screen.queryByText(/Searching.../)).not.toBeInTheDocument();
	});

	it("handles rapid typing correctly", async () => {
		render(<SearchFilter onChange={mockOnChange} debounceMs={150} />);

		const input = screen.getByRole("searchbox");

		// Type multiple characters rapidly
		fireEvent.change(input, { target: { value: "a" } });
		fireEvent.change(input, { target: { value: "ab" } });
		fireEvent.change(input, { target: { value: "abc" } });

		// Should eventually call with the final value
		await waitFor(
			() => {
				expect(mockOnChange).toHaveBeenCalledWith("abc");
			},
			{ timeout: 500 }
		);

		// Should only have been called once due to debouncing
		expect(mockOnChange).toHaveBeenCalledTimes(1);
	});

	it("prevents duplicate onChange calls for same value", async () => {
		render(<SearchFilter onChange={mockOnChange} value="test" />);

		// Since initial value equals input value, onChange should not be called
		await new Promise((resolve) => setTimeout(resolve, 400));

		expect(mockOnChange).not.toHaveBeenCalled();
	});
});
