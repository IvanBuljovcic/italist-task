/**
 * Type-safe CSS module class selector with runtime validation
 * Helps ensure CSS module class names exist at compile time and runtime
 */
export function createClassSelector<T extends Record<string, string>>(styles: T) {
	return function (className: keyof T, additionalClasses?: string): string {
		// Runtime validation in development
		if (process.env.NODE_ENV === "development") {
			if (!styles[className]) {
				// eslint-disable-next-line no-console
				console.error(
					`CSS class '${String(className)}' not found in module.`,
					`Available classes: ${Object.keys(styles).join(", ")}`
				);

				// Return the string anyway to avoid breaking the app
				return String(className);
			}
		}

		const baseClass = styles[className];
		return additionalClasses ? `${baseClass} ${additionalClasses}` : baseClass;
	};
}

/**
 * Alternative strict version that throws in development for non-existent classes
 */
export function createStrictClassSelector<T extends Record<string, string>>(styles: T) {
	return function (className: keyof T, additionalClasses?: string): string {
		if (process.env.NODE_ENV === "development" && !styles[className]) {
			throw new Error(
				`CSS class '${String(className)}' not found in module. Available classes: ${Object.keys(styles).join(", ")}`
			);
		}

		const baseClass = styles[className];
		return additionalClasses ? `${baseClass} ${additionalClasses}` : baseClass;
	};
}
