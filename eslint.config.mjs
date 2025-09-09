import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import { dirname } from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const isProduction = process.env.NODE_ENV === "production";

const eslintConfig = [
	// Spread existing configurations
	...compat.extends("next/core-web-vitals", "next/typescript"),

	// Base eslint recommended rules
	eslint.configs.recommended,

	// TypeScript-specific rules
	...tseslint.configs.recommended,

	// Custom configuration
	{
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		rules: {
			// Unused variables configuration
			"@typescript-eslint/no-unused-vars": isProduction
				? "error" // Error in production
				: [
						"warn",
						{
							argsIgnorePattern: "^_",
							varsIgnorePattern: "^_",
							caughtErrorsIgnorePattern: "^_",
						},
					],

			// Strict rules in production
			"no-console": isProduction ? "error" : "warn",
			"no-debugger": isProduction ? "error" : "warn",

			// Additional production-focused rules
			"no-unused-expressions": isProduction ? "error" : "warn",
			"no-unreachable": isProduction ? "error" : "warn",
			"no-warning-comments": isProduction
				? [
						"error",
						{
							terms: ["todo", "fixme", "xxx"],
							location: "start",
						},
					]
				: "off",
		},

		// Ignore specific files
		ignores: ["node_modules/", ".next/", "dist/", "build/", "coverage/"],
	},
];

export default eslintConfig;
