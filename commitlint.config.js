const shell = require("shelljs");

/** @type {import('commitlint').Config} */
module.exports = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			["build", "chore", "ci", "docs", "feat", "fix", "perf", "refactor", "revert", "style", "test"],
		],
		"scope-enum": async () => {
			const branch = shell.exec("git rev-parse --abbrev-ref HEAD", { silent: true }).stdout.trim().toUpperCase();

			return [
				2,
				"always",
				[
					branch,
					"CORE",
					"API",
					"UI",
					"DB",
					"CONFIG",
					"AUTH",
					"SEARCH",
					"CHECKOUT",
					"CI",
					"BUILD",
					"ESLINT",
					"PRETTIER",
				],
			];
		},
		"scope-empty": [1, "never"],
		"scope-case": [2, "always", "upper-case"],
	},
};
