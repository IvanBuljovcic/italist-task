import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SizeFilter } from "./filter-size";

// Mock the CSS modules
vi.mock("./filter-size.module.css", () => ({
	default: {
		container: "container",
		title: "title",
		"button-container": "button-container",
		"size-button": "size-button",
		selected: "selected",
		"clear-button": "clear-button",
	},
}));

vi.mock("@/lib/class-selectors", () => ({
	createStrictClassSelector: (styles: Record<string, string>) => (className: string) => styles[className],
}));

describe("SizeFilter", () => {
	const mockOnSizeChange = vi.fn();
	const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
	const defaultProps = {
		sizes: defaultSizes,
		selectedSizes: [],
		onSizeChange: mockOnSizeChange,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Basic Rendering", () => {
		it("renders with default props", () => {
			render(<SizeFilter {...defaultProps} />);
			
			expect(screen.getByText("Sizes")).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "XS" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "S" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "M" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "L" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "XL" })).toBeInTheDocument();
		});

		it("renders with custom initialVisibleCount", () => {
			render(<SizeFilter {...defaultProps} initialVisibleCount={3} />);
			
			expect(screen.getByRole("button", { name: "XS" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "S" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "M" })).toBeInTheDocument();
			
			expect(screen.queryByRole("button", { name: "L" })).not.toBeInTheDocument();
			expect(screen.queryByRole("button", { name: "XL" })).not.toBeInTheDocument();
		});

		it("returns null when sizes array is empty", () => {
			const { container } = render(<SizeFilter {...defaultProps} sizes={[]} />);
			expect(container.firstChild).toBeNull();
		});

		it("returns null when sizes array is undefined", () => {
			const { container } = render(<SizeFilter {...defaultProps} sizes={undefined as unknown as string[]} />);
			expect(container.firstChild).toBeNull();
		});

		it("shows selected sizes with selected styling", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["M", "L"]} />);
			
			const mediumButton = screen.getByRole("button", { name: "M" });
			const largeButton = screen.getByRole("button", { name: "L" });
			const smallButton = screen.getByRole("button", { name: "S" });
			
			expect(mediumButton).toHaveClass("selected");
			expect(largeButton).toHaveClass("selected");
			expect(smallButton).not.toHaveClass("selected");
		});
	});

	describe("Size Selection", () => {
		it("calls onSizeChange when clicking an unselected size", () => {
			render(<SizeFilter {...defaultProps} />);
			
			const mediumButton = screen.getByRole("button", { name: "M" });
			fireEvent.click(mediumButton);
			
			expect(mockOnSizeChange).toHaveBeenCalledWith(["M"]);
		});

		it("calls onSizeChange when clicking a selected size to deselect", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["M", "L"]} />);
			
			const mediumButton = screen.getByRole("button", { name: "M" });
			fireEvent.click(mediumButton);
			
			expect(mockOnSizeChange).toHaveBeenCalledWith(["L"]);
		});

		it("adds multiple sizes to selection", () => {
			const { rerender } = render(<SizeFilter {...defaultProps} />);
			
			fireEvent.click(screen.getByRole("button", { name: "S" }));
			expect(mockOnSizeChange).toHaveBeenCalledWith(["S"]);
			
			rerender(<SizeFilter {...defaultProps} selectedSizes={["S"]} />);
			
			fireEvent.click(screen.getByRole("button", { name: "M" }));
			expect(mockOnSizeChange).toHaveBeenCalledWith(["S", "M"]);
		});

		it("removes size from middle of selection array", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["S", "M", "L"]} />);
			
			const mediumButton = screen.getByRole("button", { name: "M" });
			fireEvent.click(mediumButton);
			
			expect(mockOnSizeChange).toHaveBeenCalledWith(["S", "L"]);
		});
	});

	describe("Show More/Show Less Functionality", () => {
		it("shows 'Show More' button when there are more sizes than initialVisibleCount", () => {
			render(<SizeFilter {...defaultProps} initialVisibleCount={5} />);
			
			expect(screen.getByRole("button", { name: "Show More (2 more)" })).toBeInTheDocument();
		});

		it("does not show 'Show More' button when all sizes fit within initialVisibleCount", () => {
			render(<SizeFilter {...defaultProps} initialVisibleCount={10} />);
			
			expect(screen.queryByRole("button", { name: /Show More/ })).not.toBeInTheDocument();
		});

		it("shows all sizes when 'Show More' is clicked", () => {
			render(<SizeFilter {...defaultProps} initialVisibleCount={3} />);
			
			expect(screen.queryByRole("button", { name: "XXL" })).not.toBeInTheDocument();
			
			fireEvent.click(screen.getByRole("button", { name: "Show More (4 more)" }));
			
			expect(screen.getByRole("button", { name: "XXL" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "XXXL" })).toBeInTheDocument();
		});

		it("shows 'Show Less' button after 'Show More' is clicked", () => {
			render(<SizeFilter {...defaultProps} initialVisibleCount={3} />);
			
			fireEvent.click(screen.getByRole("button", { name: "Show More (4 more)" }));
			
			expect(screen.getByRole("button", { name: "Show Less" })).toBeInTheDocument();
			expect(screen.queryByRole("button", { name: /Show More/ })).not.toBeInTheDocument();
		});

		it("hides extra sizes when 'Show Less' is clicked", () => {
			render(<SizeFilter {...defaultProps} initialVisibleCount={3} />);
			
			fireEvent.click(screen.getByRole("button", { name: "Show More (4 more)" }));
			
			expect(screen.getByRole("button", { name: "XXXL" })).toBeInTheDocument();
			
			fireEvent.click(screen.getByRole("button", { name: "Show Less" }));
			
			expect(screen.queryByRole("button", { name: "XXXL" })).not.toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Show More (4 more)" })).toBeInTheDocument();
		});

		it("calculates correct count for 'Show More' button", () => {
			const largeSizeArray = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"];
			render(<SizeFilter {...defaultProps} sizes={largeSizeArray} initialVisibleCount={4} />);
			
			expect(screen.getByRole("button", { name: "Show More (5 more)" })).toBeInTheDocument();
		});

		it("does not show 'Show Less' button when sizes length equals initialVisibleCount", () => {
			const exactSizes = ["XS", "S", "M", "L", "XL"];
			render(<SizeFilter {...defaultProps} sizes={exactSizes} initialVisibleCount={5} />);
			
			expect(screen.queryByRole("button", { name: /Show More/ })).not.toBeInTheDocument();
			expect(screen.queryByRole("button", { name: /Show Less/ })).not.toBeInTheDocument();
		});
	});

	describe("Clear All Functionality", () => {
		it("shows 'Clear all' button when sizes are selected", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["M", "L"]} />);
			
			expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
		});

		it("does not show 'Clear all' button when no sizes are selected", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={[]} />);
			
			expect(screen.queryByRole("button", { name: "Clear all" })).not.toBeInTheDocument();
		});

		it("calls onSizeChange with empty array when 'Clear all' is clicked", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["S", "M", "L", "XL"]} />);
			
			fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
			
			expect(mockOnSizeChange).toHaveBeenCalledWith([]);
		});
	});

	describe("Selected Sizes Count Display", () => {
		it("shows singular count message for one selected size", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["M"]} />);
			
			expect(screen.getByText("1 size selected")).toBeInTheDocument();
		});

		it("shows plural count message for multiple selected sizes", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["S", "M", "L"]} />);
			
			expect(screen.getByText("3 sizes selected")).toBeInTheDocument();
		});

		it("does not show count message when no sizes are selected", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={[]} />);
			
			expect(screen.queryByText(/size.*selected/)).not.toBeInTheDocument();
		});
	});

	describe("Button Accessibility", () => {
		it("renders size buttons with proper button type", () => {
			render(<SizeFilter {...defaultProps} />);
			
			const sizeButtons = screen.getAllByRole("button");
			const sizeButton = sizeButtons.find(button => button.textContent === "M");
			
			expect(sizeButton).toHaveAttribute("type", "button");
			expect(sizeButton).toHaveAttribute("tabIndex", "0");
		});

		it("renders control buttons with proper button type", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["M"]} initialVisibleCount={3} />);
			
			const showMoreButton = screen.getByRole("button", { name: "Show More (4 more)" });
			const clearButton = screen.getByRole("button", { name: "Clear all" });
			
			expect(showMoreButton).toHaveAttribute("type", "button");
			expect(clearButton).toHaveAttribute("type", "button");
		});
	});

	describe("Edge Cases", () => {
		it("handles single size in array", () => {
			render(<SizeFilter {...defaultProps} sizes={["M"]} />);
			
			expect(screen.getByRole("button", { name: "M" })).toBeInTheDocument();
			expect(screen.queryByRole("button", { name: /Show More/ })).not.toBeInTheDocument();
		});

		it("handles initialVisibleCount larger than sizes array", () => {
			const smallSizes = ["S", "M"];
			render(<SizeFilter {...defaultProps} sizes={smallSizes} initialVisibleCount={10} />);
			
			expect(screen.getByRole("button", { name: "S" })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "M" })).toBeInTheDocument();
			expect(screen.queryByRole("button", { name: /Show More/ })).not.toBeInTheDocument();
		});

		it("handles zero initialVisibleCount", () => {
			render(<SizeFilter {...defaultProps} initialVisibleCount={0} />);
			
			expect(screen.getByRole("button", { name: `Show More (${defaultSizes.length} more)` })).toBeInTheDocument();
			
			expect(screen.queryByRole("button", { name: "S" })).not.toBeInTheDocument();
		});

		it("handles selectedSizes with sizes not in sizes array", () => {
			render(<SizeFilter {...defaultProps} selectedSizes={["M", "NonExistentSize"]} />);
			
			expect(screen.getByText("2 sizes selected")).toBeInTheDocument();
			
			expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
		});
	});
});