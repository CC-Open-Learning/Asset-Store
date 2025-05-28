import path from "path";
import { fileURLToPath } from "url";
// ESLint Configurations Imports
import js from "@eslint/js";
import globals from "globals";
import nodePlugin from "eslint-plugin-n";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSecurity from "eslint-plugin-security";
import eslintPluginTailwind from "eslint-plugin-tailwindcss";
import eslintPluginJsdoc from "eslint-plugin-jsdoc";
import eslintSortKeysFix from "eslint-plugin-sort-keys-fix";
import eslintPerfectionist from "eslint-plugin-perfectionist";
import eslintJest from "eslint-plugin-jest";
import jestPackage from "jest/package.json" with { type: "json" };
import vitest from "@vitest/eslint-plugin";

// Core Node Configuration
const coreConfig = tseslint.config({
  files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [js.configs.all, nodePlugin.configs["flat/recommended"]],
  languageOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    globals: {
      ...globals.browser,
      ...globals.es2020,
      ...globals.builtin
    }
  },
  plugins: {
    n: nodePlugin
  },
  settings: {
    n: {
      version: ">=21.1.0"
    }
  },
  rules: {
    /* Should be on but after refactoring */
    "no-undefined": ["off"], // (off) Allows the use of `undefined` // "error" disallows `undefined` usage

    /* Off Rules */

    "one-var": ["off"], // (off) Allows declaring variables with multiple `const`, `let`, or `var` statements // "error" requires combining declarations
    "max-statements": ["off"], // (off) Allows any number of statements in a function // "error" limits statements per function
    "id-length": ["off"], // (off) Allows identifiers of any length // "error" enforces min/max length on identifiers
    "new-cap": ["off"], // (off) Allows lowercase letters for constructor names // "error" requires capitalized constructor names
    "max-lines": ["off"], // (off) Allows files of any length // "warn" limits file length to a maximum
    "max-params": ["off"], // (off) Allows functions with any number of parameters // "error" limits parameter count
    "max-lines-per-function": ["off"], // (off) Allows functions of any length // "warn" limits function length
    complexity: ["off"], // (off) Allows any code complexity level // "error" limits code complexity
    "no-ternary": ["off"], // (off) Allows the use of the ternary operator // "error" disallows ternary operators
    "no-nested-ternary": ["off"], // (off) Allows nested ternary operators // "error" disallows nested ternaries
    "no-underscore-dangle": ["off"], // (off) Allows identifiers with underscores // "warn" disallows underscores in identifiers
    "no-plusplus": ["off"], // (off) Allows the `++` and `--` unary operators // "error" disallows `++` and `--`
    "no-negated-condition": ["off"], // (off) Allows negated conditions // "error" disallows negated conditions
    "no-alert": ["off"], // (off) Allows `alert`, `confirm`, and `prompt` usage // "error" disallows `alert`, `confirm`, `prompt`
    "no-inline-comments": ["off"], // (off) Allows inline comments // "warn" disallows inline comments
    "no-duplicate-imports": ["off"], // (off) Allows duplicate imports // "error" disallows duplicate imports
    "n/no-missing-import": ["off"], // (off) Allows missing imports; conflicts with `import/order` // "error" requires all imports to resolve
    "no-redeclare": ["off"], // (off) Allows redeclaring variables // "error" disallows redeclaring variables
    "no-void": ["off"], // (off) Allows the `void` operator // "error" disallows the `void` operator
    "capitalized-comments": ["off"], // (off) Allows comments in any case // "warn" requires comments to be capitalized
    "no-fallthrough": ["off"], // (off) Allows `switch` cases to fall through // "error" disallows `switch` cases to fall through

    /* Warning Rules */

    "default-case": ["warn"], // (off) Allows switch without default cases // "warn" Requires a default case in `switch` statements
    "consistent-return": ["warn"], // (off) Allows mixed return types // "warn" Enforces consistent return values in functions
    "no-await-in-loop": ["warn"], // (off) Allows `await` statements inside loops // "warn" disallows `await` in loops
    "no-else-return": ["warn"], // (off) Allows `else` blocks after `return` statements // "warn" disallows `else` after `return`
    "no-magic-numbers": ["warn"], // (off) Allows "magic" numbers without naming them // "warn" disallows unnamed "magic" numbers
    "no-use-before-define": ["warn"], // (off) Allows usage before definition // "warn" Enforces variables to be defined before use
    "n/no-unsupported-features/node-builtins": ["warn"], // (off) Allows any Node built-in // "warn" Disallows unsupported Node.js built-ins

    /* Error Rules */

    "func-style": ["error", "declaration", { allowArrowFunctions: true }], // (off) Allows function expressions // "error" Enforces function declarations over expressions, allows arrow functions
    "no-console": ["error"] // (off) Allows console usage // "warn" Enforces removal of `console` statements
  }
});

// React Configuration
const reactConfig = tseslint.config({
  files: ["**/*.{jsx,tsx}"],
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [react.configs.flat.all],
  languageOptions: {
    ...react.configs.flat.recommended.languageOptions
  },
  plugins: {
    react,
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh
  },
  settings: {
    react: { version: "detect" }
  },
  rules: {
    ...reactHooks.configs.recommended.rules,

    /* Off Rules */

    "react-hooks/exhaustive-deps": ["off"], // (off) Allows missing dependencies in `useEffect` arrays // "warn" Requires all dependencies

    "react/react-in-jsx-scope": ["off"], // (off) Allows JSX without importing React // "error" Requires `import React` in scope for JSX
    "react/display-name": ["off"], // (off) Allows components without `displayName` // "warn" Requires `displayName` on components
    "react/jsx-filename-extension": ["off"], // (off) Allows JSX in any file // "warn" Restricts JSX to `.jsx` or `.tsx` files
    "react/jsx-no-literals": ["off"], // (off) Allows string literals in JSX // "warn" Disallows string literals
    "react/jsx-props-no-spreading": ["off"], // (off) Allows props spreading // "warn" Disallows props spreading
    "react/jsx-max-depth": ["off"], // (off) Allows any JSX nesting depth // "warn" Limits nesting to 4 levels
    "react/jsx-boolean-value": ["off"], // (off) Allows omitting value for boolean props // "warn" Requires `true`/`false` values
    "react/no-multi-comp": ["off"], // (off) Allows multiple components in a file // "warn" Disallows multiple components per file
    "react/function-component-definition": ["off"], // (off) Allows any function style // "error" Enforces arrow functions for named components
    "react/jsx-no-bind": ["off"], // (off) Allows `bind` in JSX // "error" Disallows the use of `bind` in JSX
    "react/prop-types": ["off"], // (off) Disables prop type validation // "error" Requires prop types
    "react/prefer-read-only-props": ["off"], // (off) Allows mutable props // "warn" Enforces read-only props where possible
    "react/require-default-props": ["off"], // (off) Allows optional props without defaults // "error" Requires default values for optional props

    /* Warning Rules */

    "react/no-unknown-property": ["warn"], // (off) Allows unknown properties in JSX // "error" Disallows unknown properties
    "react/no-object-type-as-default-prop": ["warn"], // (off) Allows object types as default props // "error" Disallows objects as defaults
    "react/hook-use-state": ["warn"], // (off) Allows any usage of `useState` // "warn" Enforces correct `useState` usage
    "react/jsx-sort-props": ["warn"], // (off) Allows any prop order in JSX // "warn" Enforces sorted props in JSX elements
    "react/jsx-no-useless-fragment": ["warn"], // (off) Allows unnecessary fragments // "warn" Disallows unnecessary fragments in JSX
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true }
    ], // (off) Allows exporting non-components // "warn" Only allows component exports
    "react/button-has-type": ["warn"], // (off) Allows buttons without `type` // "warn" Requires `type` on `button` elements

    /* Error Rules */

    "react/forbid-component-props": ["error"] // (off) Allows any props on components // "error" Forbids certain props like `style`
  }
});

// TypeScript Configuration
const typescriptConfig = tseslint.config({
  files: ["**/*.{ts,tsx}"],
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked
  ],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url))
    }
  },
  rules: {
    /* Off Rules */

    "@typescript-eslint/no-non-null-assertion": ["off"], // (off) Allows `!` non-null assertions // "warn" Discourages using `!` for non-null assertions
    "@typescript-eslint/no-inferrable-types": ["off"], // (off) Allows inferrable types // "warn" disallows unnecessary type declarations
    "@typescript-eslint/no-empty-function": ["off"], // (off) Allows empty functions // "error" disallows empty function bodies
    "@typescript-eslint/consistent-type-definitions": ["off"], // (off) Allows any type definition style // "error" enforces consistent type style
    "@typescript-eslint/prefer-readonly": ["off"], // (off) Allows properties without `readonly` // "warn" Suggests adding `readonly` to properties that are never modified
    "@typescript-eslint/prefer-as-const": ["off"], // (off) Allows readonly arrays without `as const` // "warn" enforces `as const` for readonly arrays
    "@typescript-eslint/explicit-module-boundary-types": [
      "off",
      {
        allowArgumentsExplicitlyTypedAsAny: false,
        allowDirectConstAssertionInArrowFunctions: true,
        allowHigherOrderFunctions: true,
        allowTypedFunctionExpressions: true
      }
    ], // (off) Allows exported functions without return types // "warn" Enforces return types for exported functions
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      { accessibility: "explicit" }
    ], // (off) Allows implicit accessibility for class members // "warn" Requires explicit accessibility for class members
    "@typescript-eslint/no-redeclare": ["off"], // (off) Allows redeclaring variables // "error" disallows redeclaring variables
    "@typescript-eslint/no-unnecessary-condition": ["off"], // (off) Allows unnecessary conditions // "warn" Enforces that unnecessary conditions are removed

    /* Warning Rules */

    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ], // (off) Allows unused variables // "warn" Flags unused variables, except those prefixed with `_`
    "@typescript-eslint/prefer-for-of": ["warn"], // (off) Allows `for` loops for arrays // "warn" Prefers `for...of` over `for` loops for arrays
    "@typescript-eslint/no-unnecessary-type-assertion": ["warn"], // (off) Allows redundant type assertions // "warn" Warns against redundant type assertions
    "@typescript-eslint/prefer-optional-chain": ["warn"], // (off) Allows `&&` for chaining // "warn" Suggests using optional chaining (`?.`) over `&&`
    "@typescript-eslint/switch-exhaustiveness-check": ["warn"], // (off) Allows missing cases in `switch` statements // "warn" Ensures all cases are covered in a switch statement
    "@typescript-eslint/array-type": ["warn", { default: "array-simple" }], // (off) Allows any array type syntax // "warn" Enforces `T[]` for simple types, `Array<T>` otherwise
    "@typescript-eslint/no-confusing-void-expression": ["warn"], // (off) Allows confusing `void` expressions // "warn" Disallows confusing `void` expressions
    "@typescript-eslint/ban-ts-comment": [
      "warn",
      {
        minimumDescriptionLength: 3,
        "ts-check": false,
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true,
        "ts-nocheck": true
      }
    ], // (off) Allows `ts` comments without restriction // "warn" Requires description with `ts-expect-error`
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", disallowTypeAnnotations: false }
    ], // (off) Allows regular imports for types // "warn" Prefers using `import type` for types only
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: false,
        allowHigherOrderFunctions: false,
        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        allowFunctionsWithoutTypeParameters: true,
        allowIIFEs: false
      }
    ], // (off) Allows functions without explicit return types // "warn" Enforces specifying function return types
    "@typescript-eslint/no-empty-interface": [
      "warn",
      { allowSingleExtends: true }
    ], // (off) Allows empty interfaces without restriction // "warn" Flags empty interfaces, except those with single extends
    "@typescript-eslint/restrict-template-expressions": [
      "warn",
      {
        allow: [{ name: ["Error", "URL", "URLSearchParams"], from: "lib" }],
        allowAny: false,
        allowBoolean: false,
        allowNullish: false,
        allowNumber: false,
        allowRegExp: false
      }
    ], // (off) Allows any expressions in template literals // "warn" Restricts template literals to strings unless specified

    /* Error Rules */

    "@typescript-eslint/no-explicit-any": ["error"], // (off) Allows `any` as a type // "error" Discourages using `any` as a type
    "@typescript-eslint/no-unsafe-member-access": ["error"], // (off) Allows member access on `any`-typed values // "error" Disallows accessing members on `any`-typed variables
    "@typescript-eslint/no-unsafe-return": ["error"], // (off) Allows returning `any`-typed values // "error" Disallows returning `any`-typed values
    "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }], // (off) Allows unhandled promises // "error" Ensures promises are properly handled
    "@typescript-eslint/no-unsafe-assignment": ["error"], // (off) Allows assigning `any`-typed values without checks // "error" Prevents assigning `any` without type checks
    "@typescript-eslint/no-unsafe-call": ["error"], // (off) Allows calls on `any`-typed values // "error" Disallows calling functions on `any`-typed variables
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: true }
    ] // (off) Allows promises in unexpected places // "error" Prevents promises in places not expecting a promise
  }
});

// Tailwind Configuration
const tailwindConfig = tseslint.config({
  files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [...eslintPluginTailwind.configs["flat/recommended"]],
  languageOptions: {},
  plugins: {
    tailwindcss: eslintPluginTailwind
  },
  settings: {
    tailwindcss: {
      version: 3
    }
  },
  rules: {
    /* Off Rules */

    "tailwindcss/classnames-order": ["off"], // (off) Disables `tailwindcss/classnames-order` rule; may conflict with ESLint // "warn" enforces Tailwind class order
    "tailwindcss/migration-from-tailwind-2": ["off"] // (off) Disables migration helper from Tailwind v2 to v3 // "warn" enables migration hints

    /* Warning Rules */

    /* Error Rules */
  }
});

// Styling (Prettier, Import, and Perfectionist) Configuration
const stylingConfig = tseslint.config({
  files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  ignores: [
    "node_modules",
    "dist",
    "coverage",
    "logs",
    "*.config.*",
    "*.json",
    "*.setup.*",
    "*.d.ts"
  ],
  extends: [
    importPlugin.flatConfigs.recommended,
    eslintPerfectionist.configs["recommended-natural"],
    eslintPluginPrettierRecommended,
    eslintConfigPrettier
  ],
  languageOptions: {},
  plugins: {
    "sort-keys-fix": eslintSortKeysFix
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true // Helps resolve paths with extensions
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    }
  },
  rules: {
    ...importPlugin.flatConfigs.recommended.rules,

    /* Off Rules */

    "sort-imports": ["off"], // (off) Allows unsorted imports // "warn" Sorts imports in alphabetical order
    "sort-keys": ["off"], // (off) Allows object keys in any order // "warn" Enforces that object keys are sorted
    "import/order": [
      "off",
      {
        groups: [
          ["builtin", "external"],
          ["internal", "parent", "sibling", "index"]
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
          orderImportKind: "ignore"
        },
        pathGroups: [
          {
            pattern: "*.css",
            group: "builtin",
            position: "before"
          }
        ],
        pathGroupsExcludedImportTypes: ["builtin", "external"]
      }
    ], // (off) Allows imports in any order // "warn" Enforces that import statements are sorted

    /* Warning Rules */

    "prettier/prettier": ["warn"], // (off) Disables Prettier formatting enforcement // "warn" Enforces Prettier formatting rules

    "sort-keys-fix/sort-keys-fix": [
      "warn",
      "asc",
      {
        caseSensitive: false,
        natural: true
      }
    ], // (off) Allows unsorted object keys // "warn" Sorts object keys in ascending order and fixes them

    "import/no-named-as-default": ["warn"], // (off) Allows named exports as default // "warn" Allows named exports as default (Relavent ES6+)
    "import/extensions": [
      "warn",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never"
      }
    ], // (off) Allows file extensions in imports // "warn" Enforces that file extensions are not used in imports

    // Perfectionist Rules - enabled as error by default
    "perfectionist/sort-imports": [
      "warn",
      {
        type: "natural",
        order: "asc",
        ignoreCase: true,
        specialCharacters: "keep",
        matcher: "minimatch",
        internalPattern: ["~/**"],
        newlinesBetween: "always",
        maxLineLength: undefined,
        sortSideEffects: true,
        groups: [
          ["style", "side-effect-style"],
          [
            "builtin-type",
            "builtin",
            "external-type",
            "external",
            "side-effect"
          ],
          [
            "internal-type",
            "internal",
            "parent-type",
            "parent",
            "sibling-type",
            "sibling",
            "index-type",
            "index"
          ],
          "object",
          "unknown"
        ],
        customGroups: { type: {}, value: {} },
        environment: "node"
      }
    ], // (off) Allows unsorted imports // "warn" Sorts imports in alphabetical order
    "perfectionist/sort-array-includes": ["warn"], // (off) Allows unsorted array includes // "warn" Sorts array includes in alphabetical order
    "perfectionist/sort-jsx-props": ["warn"], // (off) Allows unsorted JSX props // "warn" Sorts JSX props in alphabetical order
    "perfectionist/sort-astro-attributes": ["warn"], // (off) Allows unsorted Astro attributes // "warn" Sorts Astro attributes in alphabetical order
    "perfectionist/sort-classes": ["warn"], // (off) Allows unsorted classes // "warn" Sorts classes in alphabetical order
    "perfectionist/sort-enums": ["warn"], // (off) Allows unsorted enums // "warn" Sorts enums in alphabetical order
    "perfectionist/sort-exports": ["warn"], // (off) Allows unsorted exports // "warn" Sorts exports in alphabetical order
    "perfectionist/sort-interfaces": ["warn"], // (off) Allows unsorted interfaces // "warn" Sorts interfaces in alphabetical order
    "perfectionist/sort-intersection-types": ["warn"], // (off) Allows unsorted intersections // "warn" Sorts intersections in alphabetical order
    "perfectionist/sort-maps": ["warn"], // (off) Allows unsorted maps // "warn" Sorts maps in alphabetical order
    "perfectionist/sort-named-exports": ["warn"], // (off) Allows unsorted named exports // "warn" Sorts named exports in alphabetical order
    "perfectionist/sort-named-imports": ["warn"], // (off) Allows unsorted named imports // "warn" Sorts named imports in alphabetical order
    "perfectionist/sort-object-types": ["warn"], // (off) Allows unsorted object types // "warn" Sorts object types in alphabetical order
    "perfectionist/sort-objects": ["warn"], // (off) Allows unsorted objects // "warn" Sorts objects in alphabetical order
    "perfectionist/sort-sets": ["warn"], // (off) Allows unsorted sets // "warn" Sorts sets in alphabetical order
    "perfectionist/sort-svelte-attributes": ["warn"], // (off) Allows unsorted Svelte attributes // "warn" Sorts Svelte attributes in alphabetical order
    "perfectionist/sort-switch-case": ["warn"], // (off) Allows unsorted switch cases // "warn" Sorts switch cases in alphabetical order
    "perfectionist/sort-union-types": ["warn"], // (off) Allows unsorted union types // "warn" Sorts union types in alphabetical order
    "perfectionist/sort-variable-declarations": ["warn"], // (off) Allows unsorted variable declarations // "warn" Sorts variable declarations in alphabetical order
    "perfectionist/sort-vue-attributes": ["warn"] // (off) Allows unsorted Vue attributes // "warn" Sorts Vue attributes in alphabetical order

    /* Error Rules */
  }
});

// Security and Best Practices Configuration
const securityConfig = tseslint.config({
  files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [eslintPluginSecurity.configs.recommended],
  plugins: {
    security: eslintPluginSecurity
  },
  rules: {
    /* Off Rules */
    "require-unicode-regexp": ["off"]

    /* Warning Rules */

    /* Error Rules */
  }
});

const jsDocConfig = tseslint.config({
  files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [
    eslintPluginJsdoc.configs["flat/recommended-typescript"],
    eslintPluginJsdoc.configs["flat/contents-typescript-flavor"], // Contents JSDoc rules for TypeScript "warn"
    eslintPluginJsdoc.configs["flat/logical-typescript-flavor"], // Logical JSDoc rules for TypeScript "warn"
    eslintPluginJsdoc.configs["flat/requirements-typescript-flavor"], // Requirements JSDoc rules for TypeScript "warn"
    eslintPluginJsdoc.configs["flat/stylistic-typescript-flavor"] // Stylistic JSDoc rules for TypeScript "warn" (Consistency)
  ],
  plugins: {
    jsdoc: eslintPluginJsdoc
  },
  rules: {
    /* Off Rules */

    "jsdoc/require-example": ["off"], // (off) Allows JSDoc comments without examples // "warn" Requires JSDoc comments to have examples
    "jsdoc/no-types": ["off"], // (off) Allows JSDoc comments with types // "warn" Disallows JSDoc comments with types
    "jsdoc/require-param-type": ["off"], // (off) Allows missing types for parameters // "warn" Requires types for parameters
    "jsdoc/require-property-type": ["off"], // (off) Allows missing types for properties // "warn" Requires types for properties
    "jsdoc/require-returns-type": ["off"], // (off) Allows missing types for return tags // "warn" Requires types for return tags
    "jsdoc/require-returns": ["off"], // (off) Allows missing return tags in JSDoc comments // "warn" Requires return tags in JSDoc comments
    "jsdoc/text-escaping": ["off"], // (off) Allows unescaped text in JSDoc comments // "warn" Requires text to be escaped in JSDoc comments

    /* Warning Rules */

    "jsdoc/require-jsdoc": [
      "warn",
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: true,
          FunctionExpression: true
        }
      }
    ], // (off) Allows functions, methods, and classes without JSDoc comments // "warn" Requires JSDoc comments for functions, methods, and classes
    "jsdoc/informative-docs": ["warn"], // (off) Allows JSDoc comments without descriptions // "warn" Requires JSDoc comments to have descriptions
    "jsdoc/require-description": ["warn"], // (off) Allows missing descriptions in JSDoc comments // "warn" Requires descriptions in JSDoc comments
    "jsdoc/require-description-complete-sentence": ["warn"], // (off) Allows incomplete sentences in JSDoc descriptions // "warn" Requires JSDoc descriptions to be complete sentences
    "jsdoc/require-param-description": ["warn"], // (off) Allows missing descriptions for parameters // "warn" Requires descriptions for parameters
    "jsdoc/require-returns-description": ["warn"] // (off) Allows missing descriptions for return tags // "warn" Requires descriptions for return tags

    /* Error Rules */
  },
  settings: {
    jsdoc: {
      mode: "typescript"
    }
  }
});

// Jest-specific configuration, applying only to .test.* files
const jestTestConfig = tseslint.config({
  files: ["**/*.test.{js,jsx,ts,tsx}"], // Only applies to test files
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [
    eslintJest.configs["flat/recommended"],
    eslintJest.configs["flat/style"]
  ],
  languageOptions: {
    globals: {
      ...eslintJest.environments.globals.globals // Add all Jest globals
    }
  },
  plugins: {
    jest: eslintJest
  },
  settings: {
    jest: {
      version: jestPackage.version
    }
  },
  rules: {
    ...eslintJest.configs["flat/recommended"].rules,
    ...eslintJest.configs["flat/style"].rules,

    /* Off Rules */

    "no-magic-numbers": ["off"], // (off) Allows "magic" numbers without naming them // "warn" disallows unnamed "magic" numbers

    "jest/max-expects": ["off"], // (off) Allows any number of `expect` calls // "error" limits `expect` calls per test
    "jest/no-conditional-expect": ["off"], // (off) Allows conditional `expect` calls // "error" disallows conditional `expect` calls
    "jest/no-conditional-in-test": ["off"], // (off) Allows conditional logic in tests // "error" disallows conditional logic in tests
    "jest/no-duplicate-hooks": ["off"], // (off) Allows duplicate hooks // "error" disallows duplicate hooks
    "jest/max-nested-describe": ["off"], // (off) Allows any number of nested `describe` blocks // "error" limits nested `describe` blocks
    "jest/no-hooks": ["off"], // (off) Allows hooks in tests // "error" disallows hooks in tests
    "jest/no-mocks-import": ["off"], // (off) Allows importing mocks // "error" disallows importing mocks
    "jest/no-restricted-jest-methods": ["off"], // (off) Allows any Jest method // "error" Disallows specific Jest methods
    "jest/no-restricted-matchers": ["off"], // (off) Allows any Jest matcher // "error" Disallows specific Jest matchers
    "jest/prefer-called-with": ["off"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `calledWith`
    "jest/prefer-importing-jest-globals": ["off"], // (off) Allows importing Jest globals // "warn" Requires importing Jest globals
    "jest/require-to-throw-message": ["off"], // (off) Allows `toThrow` without a message // "warn" Requires a message with `toThrow`

    /* Warning Rules */

    "jest/consistent-test-it": ["warn", { fn: "test", withinDescribe: "test" }],
    "jest/no-commented-out-tests": ["warn"], // (off) Allows commented-out tests // "warn" Disallows commented-out tests
    "jest/prefer-snapshot-hint": ["warn"], // (off) Allows no snapshot hints // "warn" Requires snapshot hints
    "jest/no-interpolation-in-snapshots": ["warn"], // (off) Allows interpolation in snapshots // "warn" Disallows interpolation in snapshots
    "jest/no-large-snapshots": ["warn"], // (off) Allows large snapshots // "warn" Disallows large snapshots
    "jest/no-untyped-mock-factory": ["warn"], // (off) Allows untyped mock factories // "warn" Disallows untyped mock factories
    "jest/padding-around-all": ["warn"], // (off) Allows no padding around `describe` blocks // "warn" Requires padding around `describe` blocks
    "jest/prefer-comparison-matcher": ["warn"], // (off) Allows any comparison matcher // "warn" Requires comparison matchers
    "jest/prefer-each": ["warn"], // (off) Allows any `each` method // "warn" Requires `each` methods only applies to "it"
    "jest/prefer-equality-matcher": ["warn"], // (off) Allows any equality matcher // "warn" Requires equality matchers
    "jest/prefer-expect-resolves": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `resolves`
    "jest/prefer-hooks-in-order": ["warn"], // (off) Allows hooks in any order // "warn" Requires hooks to be in a specific order
    "jest/prefer-jest-mocked": ["warn"], // (off) Allows any `jest.mock` calls // "warn" Requires `jest.mock` calls to use `jest.mocked`
    "jest/prefer-lowercase-title": ["warn"], // (off) Allows uppercase test titles // "warn" Requires test titles to be lowercase
    "jest/prefer-mock-promise-shorthand": ["warn"], // (off) Allows any mock promise shorthand // "warn" Requires mock promise shorthand
    "jest/prefer-spy-on": ["warn"], // (off) Allows any `jest.spyOn` calls // "warn" Requires `jest.spyOn` calls
    "jest/prefer-strict-equal": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toBe` or `toEqual`
    "jest/prefer-to-be": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toBe`
    "jest/prefer-to-contain": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toContain`
    "jest/prefer-to-have-length": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toHaveLength`
    "jest/prefer-todo": ["warn"], // (off) Allows any `test.todo` calls // "warn" Requires `test.todo` calls
    "jest/prefer-hooks-on-top": ["warn"], // (off) Allows hooks anywhere in tests // "warn" Requires hooks to be at the top of tests
    "jest/require-hook": ["warn"], // (off) Allows tests without hooks // "warn" Requires tests to have hooks
    "jest/require-top-level-describe": ["warn"], // (off) Allows tests without top-level `describe` blocks // "warn" Requires tests to have top-level `describe` blocks
    "jest/valid-title": ["warn"], // (off) Allows invalid test titles // "warn" Disallows invalid test titles

    /* Error Rules */

    "jest/no-alias-methods": ["error"], // (off) Allows alias methods // "warn" Disallows alias methods
    "jest/expect-expect": [
      "error",
      {
        assertFunctionNames: ["expect"],
        additionalTestBlockFunctions: []
      }
    ], // (off) Allows tests without assertions // "error" Requires at least one assertion in tests
    "jest/no-confusing-set-timeout": ["error"], // (off) Allows confusing `setTimeout` calls // "error" Disallows confusing `setTimeout` calls
    "jest/no-deprecated-functions": ["error"], // (off) Allows deprecated functions // "error" Disallows deprecated functions
    "jest/no-disabled-tests": ["error"], // (off) Allows disabled tests // "error" Disallows disabled tests
    "jest/no-done-callback": ["error"], // (off) Allows `done` callbacks // "error" Disallows `done` callbacks
    "jest/no-export": ["error"], // (off) Allows exported tests // "error" Disallows exported tests
    "jest/no-focused-tests": ["error"], // (off) Allows focused tests // "error" Disallows focused tests
    "jest/no-identical-title": ["error"], // (off) Allows identical test titles // "error" Disallows identical test titles
    "jest/no-jasmine-globals": ["error"], // (off) Allows Jasmine globals // "error" Disallows Jasmine globals
    "jest/no-standalone-expect": [
      "error",
      { additionalTestBlockFunctions: ["each.test"] }
    ], // (off) Allows standalone `expect` calls // "error" Disallows standalone `expect` calls
    "jest/no-test-prefixes": ["error"], // (off) Allows test prefixes // "error" Disallows test prefixes
    "jest/no-test-return-statement": ["error"], // (off) Allows `return` statements in tests // "error" Disallows `return` statements in tests
    "jest/prefer-expect-assertions": ["error"], // (off) Allows any number of `expect` calls // "error" Requires `expect` assertions to be used
    "jest/valid-describe-callback": ["error"], // (off) Allows invalid `describe` callbacks // "error" Disallows invalid `describe` callbacks
    "jest/valid-expect": ["error"], // (off) Allows invalid `expect` calls // "error" Disallows invalid `expect` calls
    "jest/valid-expect-in-promise": ["error"], // (off) Allows invalid `expect` calls in promises // "error" Disallows invalid `expect` calls in promises
    "jest/unbound-method": ["error"] // (off) Allows unbound methods // "error" Disallows unbound methods
  }
});

// VI Test Configuration
const vitestConfig = tseslint.config({
  files: ["**/*.test.{js,jsx,ts,tsx}"], // Only applies to test files
  ignores: [
    "**/node_modules",
    "**/dist",
    "**/coverage",
    "**/logs",
    "**/*.config.*",
    "**/*.json",
    "**/*.setup.*",
    "**/*.d.ts"
  ],
  extends: [vitest.configs.recommended],
  languageOptions: {
    globals: {
      ...vitest.environments.env.globals
    }
  },
  plugins: {
    vitest: vitest
  },
  settings: {
    vitest: {
      typecheck: true
    }
  },
  rules: {
    ...vitest.configs.recommended.rules,
    ...vitest.configs.all.rules,
    /* Off Rules */

    "no-magic-numbers": ["off"], // (off) Allows "magic" numbers without naming them // "warn" disallows unnamed "magic" numbers
    "@typescript-eslint/require-await": ["off"], // (off) Allows async functions without `await` // "warn" Requires `await` in async functions

    "vitest/prefer-lowercase-title": ["off"], // (off) Allows uppercase test titles // "warn" Requires test titles to be lowercase
    "vitest/max-expects": ["off"], // (off) Allows any number of `expect` calls // "error" limits `expect` calls per test
    "vitest/max-nested-describe": ["off"], // (off) Allows any number of nested `describe` blocks // "error" limits nested `describe` blocks
    "vitest/no-commented-out-tests": ["off"], // (off) Allows commented-out tests // "warn" Disallows commented-out tests
    "vitest/no-conditional-tests": ["off"], // (off) Allows conditional tests // "error" disallows conditional tests
    "vitest/no-hooks": ["off"], // (off) Allows hooks in tests // "error" disallows hooks in tests
    "vitest/no-interpolation-in-snapshots": ["off"], // (off) Allows interpolation in snapshots // "warn" Disallows interpolation in snapshots
    "vitest/no-large-snapshots": ["off"], // (off) Allows large snapshots // "warn" Disallows large snapshots
    "vitest/no-mocks-import": ["off"], // (off) Allows importing mocks // "error" disallows importing mocks
    "vitest/no-restricted-matchers": ["off"], // (off) Allows any Jest matcher // "error" Disallows specific Jest matchers
    "vitest/no-restricted-vi-methods": ["off"], // (off) Allows any VI method // "error" Disallows specific VI methods
    "vitest/prefer-spy-on": ["off"], // (off) Allows any `vi.spyOn` calls // "warn" Requires `vi.spyOn` calls
    "vitest/prefer-to-be": ["off"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toBe`

    /* Warning Rules */

    "vitest/consistent-test-it": [
      "warn",
      {
        fn: "test", // Enforce using "test" for standalone tests
        withinDescribe: "test" // Enforce using "test" within "describe" blocks
      }
    ], // (off) Allows inconsistent test names // "warn" Requires consistent test names
    "vitest/consistent-test-filename": ["warn"], // (off) Allows inconsistent test filenames // "warn" Requires consistent test filenames
    "vitest/no-alias-methods": ["warn"], // (off) Allows alias methods // "warn" Disallows alias methods
    "vitest/no-conditional-expect": ["warn"], // (off) Allows conditional `expect` calls // "warn" disallows conditional `expect` calls
    "vitest/no-conditional-in-test": ["warn"], // (off) Allows conditional logic in tests // "warn" disallows conditional logic in tests
    "vitest/no-disabled-tests": ["warn"], // (off) Allows disabled tests // "warn" disallows disabled tests
    "vitest/no-duplicate-hooks": ["warn"], // (off) Allows duplicate hooks // "warn" disallows duplicate hooks
    "vitest/no-focused-tests": ["warn"], // (off) Allows focused tests // "warn" disallows focused tests
    "vitest/no-test-prefixes": ["warn"], // (off) Allows test prefixes // "warn" disallows test prefixes
    "vitest/no-test-return-statement": ["warn"], // (off) Allows `return` statements in tests // "warn" disallows `return` statements in tests
    "vitest/prefer-called-with": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `calledWith`
    "vitest/prefer-comparison-matcher": ["warn"], // (off) Allows any comparison matcher // "warn" Requires comparison matchers
    "vitest/prefer-each": ["warn"], // (off) Allows any `each` method // "warn" Requires `each` methods only applies to "it"
    "vitest/prefer-equality-matcher": ["warn"], // (off) Allows any equality matcher // "warn" Requires equality matchers
    "vitest/prefer-expect-assertions": ["warn"], // (off) Allows any number of `expect` calls // "error" Requires `expect` assertions to be used
    "vitest/prefer-expect-resolves": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `resolves`
    "vitest/prefer-hooks-in-order": ["warn"], // (off) Allows hooks in any order // "warn" Requires hooks to be in a specific order
    "vitest/prefer-hooks-on-top": ["warn"], // (off) Allows hooks anywhere in tests // "warn" Requires hooks to be at the top of tests
    "vitest/prefer-lowercase-title": ["warn"], // (off) Allows uppercase test titles // "warn" Requires test titles to be lowercase
    "vitest/prefer-mock-promise-shorthand": ["warn"], // (off) Allows any mock promise shorthand // "warn" Requires mock promise shorthand
    "vitest/prefer-snapshot-hint": ["warn"], // (off) Allows no snapshot hints // "warn" Requires snapshot hints
    "vitest/prefer-strict-equal": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toBe` or `toEqual`
    "vitest/prefer-to-be-falsy": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toBeFalsy`
    "vitest/prefer-to-be-truthy": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toBeTruthy`
    "vitest/prefer-to-be-object": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toBeObject`
    "vitest/prefer-to-contain": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toContain`
    "vitest/prefer-to-have-length": ["warn"], // (off) Allows any `expect` calls // "warn" Requires `expect` calls to use `toHaveLength`
    "vitest/prefer-todo": ["warn"], // (off) Allows any `test.todo` calls // "warn" Requires `test.todo` calls
    "vitest/require-hook": ["warn"], // (off) Allows tests without hooks // "warn" Requires tests to have hooks
    "vitest/require-to-throw-message": ["warn"], // (off) Allows `toThrow` without a message // "warn" Requires a message with `toThrow`
    "vitest/require-top-level-describe": ["warn"], // (off) Allows tests without top-level `describe` blocks // "warn" Requires tests to have top-level `describe` blocks
    "vitest/prefer-vi-mocked": ["warn"], // (off) Allows any `vi.mock` calls // "warn" Requires `vi.mock` calls to use `vi.mocked`

    "vitest/padding-around-after-all-blocks": ["warn"], // (off) Allows no padding around `afterAll` blocks // "warn" Requires padding around `afterAll` blocks
    "vitest/padding-around-after-each-blocks": ["warn"], // (off) Allows no padding around `afterEach` blocks // "warn" Requires padding around `afterEach` blocks
    "vitest/padding-around-all": ["warn"], // (off) Allows no padding around `all` blocks // "warn" Requires padding around `all` blocks
    "vitest/padding-around-before-all-blocks": ["warn"], // (off) Allows no padding around `beforeAll` blocks // "warn" Requires padding around `beforeAll` blocks
    "vitest/padding-around-before-each-blocks": ["warn"], // (off) Allows no padding around `beforeEach` blocks // "warn" Requires padding around `beforeEach` blocks
    "vitest/padding-around-describe-blocks": ["warn"], // (off) Allows no padding around `describe` blocks // "warn" Requires padding around `describe` blocks
    "vitest/padding-around-expect-groups": ["warn"], // (off) Allows no padding around `expect` groups // "warn" Requires padding around `expect` groups
    "vitest/padding-around-test-blocks": ["warn"], // (off) Allows no padding around `test` blocks // "warn" Requires padding around `test` blocks

    /* Error Rules */

    "vitest/expect-expect": ["error"], // (off) Allows tests without assertions // "error" Requires at least one assertion in tests
    "vitest/no-standalone-expect": ["error"], // (off) Allows standalone `expect` calls // "error" Disallows standalone `expect` calls
    "vitest/no-identical-title": ["error"], // (off) Allows identical test titles // "error" Disallows identical test titles
    "vitest/valid-title": ["error"], // (off) Allows invalid test titles // "error" Disallows invalid test titles
    "vitest/valid-expect": ["error"], // (off) Allows invalid `expect` calls // "error" Disallows invalid `expect` calls
    "vitest/valid-describe-callback": ["error"], // (off) Allows invalid `describe` callbacks // "error" Disallows invalid `describe` callbacks
    "vitest/valid-expect-in-promise": ["error"], // (off) Allows invalid `expect` calls in promises // "error" Disallows invalid `expect` calls in promises
    "vitest/require-local-test-context-for-concurrent-snapshots": ["error"], // (off) Allows concurrent snapshots without local test context // "error" Requires local test context for concurrent snapshots
    "vitest/no-import-node-test": ["error"] // (off) Allows importing node test // "error" Disallows importing node test
  }
});

export default tseslint.config(
  ...coreConfig,
  ...reactConfig,
  ...typescriptConfig,
  ...tailwindConfig,
  ...stylingConfig,
  ...securityConfig,
  ...jsDocConfig,
  //...jestTestConfig
  ...vitestConfig
);
