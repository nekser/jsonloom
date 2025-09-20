// ESLint flat config (ESLint v9+)
// Migrated from .eslintrc.json and Next.js `next lint`.
// Uses FlatCompat to reuse legacy shareable configs.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FlatCompat } = require("@eslint/eslintrc");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  // Ignore build artifacts
  {
    ignores: [
      "node_modules",
      "**/.next/**",
      "out",
      "dist",
      "build",
      "coverage",
      "next-env.d.ts",
      "eslint.config.js",
      "tailwind.config.js"
    ],
  },

  // Bring in previous extends via compat
  ...compat.extends(
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ),

  // Project-specific rules
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // Loosen some rules in test and script files
  {
    files: [
      "tests/**/*.{ts,tsx}",
      "scripts/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
