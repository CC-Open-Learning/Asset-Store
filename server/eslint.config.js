/* eslint-disable */
import js from "@eslint/js";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import nodePlugin from "eslint-plugin-n";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSecurity from "eslint-plugin-security";
import eslintPluginJsdoc from "eslint-plugin-jsdoc";
import eslintSortKeysFix from "eslint-plugin-sort-keys-fix";
import eslintPerfectionist from "eslint-plugin-perfectionist";
import eslintJest from "eslint-plugin-jest";

// Core Node Configuration
const coreConfig = [
  js.configs.all,
  nodePlugin.configs["flat/recommended"],
  {
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
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2020,
      globals: {
        ...globals.es2020,
        ...globals.builtin
      }
    },
    plugins: {
      n: nodePlugin
    },
    settings: {
      n: {
        version: ">=23.3.0"
      }
    },
    rules: {
      /* Should be on but after refactoring */
      "no-undefined": ["off"], // (off) Allows the use of `undefined` // "error" disallows `undefined` usage
      "no-undef-init": ["off"], // (off) Allows uninitialized variables // "error" disallows uninitialized variables

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
      "no-fallthrough": ["off"], // (off) Allows `switch` cases to fall through // "error" disallows `switch` cases to fall through\
      "no-warning-comments": ["off"], // (off) Allows comments with `TODO` // "warn" disallows comments with `TODO`
      "no-shadow": ["off"], // (off) Allows shadowing variables // "error" disallows shadowing
      "init-declarations": ["off"], // (off) Allows variables to be declared without initialization // "error" requires initialization

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
      "no-console": ["error"], // (off) Allows console usage // "warn" Enforces removal of `console` statements
      radix: ["error", "as-needed"] // (off) Allows the use of the `radix` parameter // "error" disallows the use of the `radix` parameter
    }
  }
];
// Styling (Prettier, Import, and Perfectionist) Configuration
const stylingConfig = [
  importPlugin.flatConfigs.recommended,
  eslintPerfectionist.configs["recommended-natural"],
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
  {
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
    languageOptions: {},
    plugins: {
      "sort-keys-fix": eslintSortKeysFix
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
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
      "perfectionist/sort-modules": ["off"], // (off) Allows modules in any order // "warn" Enforces that module statements are sorted

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
          js: "always",
          jsx: "always",
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
          //Matcher: "minimatch",
          internalPattern: ["^~/.+"],
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
      "perfectionist/sort-switch-case": ["warn"], // (off) Allows unsorted switch cases // "warn" Sorts switch cases in alphabetical order
      "perfectionist/sort-union-types": ["warn"], // (off) Allows unsorted union types // "warn" Sorts union types in alphabetical order
      "perfectionist/sort-variable-declarations": ["warn"] // (off) Allows unsorted variable declarations // "warn" Sorts variable declarations in alphabetical order

      /* Error Rules */
    }
  }
];
// Security and Best Practices Configuration
const securityConfig = [
  eslintPluginSecurity.configs.recommended,
  {
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
    plugins: {
      security: eslintPluginSecurity
    },
    rules: {
      /* Off Rules */
      "require-unicode-regexp": ["off"]

      /* Warning Rules */

      /* Error Rules */
    }
  }
];
const jsDocConfig = [
  eslintPluginJsdoc.configs["flat/recommended"],
  {
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
    }
  }
];
// Jest-specific configuration, applying only to .test.* files
const jestTestConfig = [
  eslintJest.configs["flat/recommended"],
  eslintJest.configs["flat/style"],
  {
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

    languageOptions: {
      globals: {
        ...eslintJest.environments.globals.globals // Add all Jest globals
      }
    },
    plugins: {
      jest: eslintJest
    },
    rules: {
      ...eslintJest.configs["flat/recommended"].rules,
      ...eslintJest.configs["flat/style"].rules,

      /* Off Rules */

      "no-magic-numbers": ["off"], // (off) Allows "magic" numbers without naming them // "warn" disallows unnamed "magic" numbers
      "no-empty-function": ["off"], // (off) Allows empty functions // "error" disallows empty function bodies

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

      // For TypeScript only
      "jest/unbound-method": ["off"], // (off) Allows unbound methods // "error" Disallows unbound methods
      "jest/no-untyped-mock-factory": ["off"], // (off) Allows untyped mock factories // "warn" Disallows untyped mock factories

      /* Warning Rules */

      "jest/consistent-test-it": [
        "warn",
        { fn: "test", withinDescribe: "test" }
      ],
      "jest/no-commented-out-tests": ["warn"], // (off) Allows commented-out tests // "warn" Disallows commented-out tests
      "jest/prefer-snapshot-hint": ["warn"], // (off) Allows no snapshot hints // "warn" Requires snapshot hints
      "jest/no-interpolation-in-snapshots": ["warn"], // (off) Allows interpolation in snapshots // "warn" Disallows interpolation in snapshots
      "jest/no-large-snapshots": ["warn"], // (off) Allows large snapshots // "warn" Disallows large snapshots
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
      "jest/valid-expect-in-promise": ["error"] // (off) Allows invalid `expect` calls in promises // "error" Disallows invalid `expect` calls in promises
    }
  }
];

export default [
  ...coreConfig,
  ...stylingConfig,
  ...securityConfig,
  ...jsDocConfig,
  ...jestTestConfig // Jest-specific configuration
];
