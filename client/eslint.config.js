const eslint = require('@eslint/js')
const hooksPlugin = require('eslint-plugin-react-hooks')
// const jsxA11y = require('eslint-plugin-jsx-a11y')
const jimuTheme = require('eslint-plugin-jimu-theme')
const tsEslint = require('typescript-eslint')
const eslintPlugin = require('eslint-plugin-react')
const jestPlugin = require('eslint-plugin-jest')
const globalIgnores = require('./eslint-ignore')

module.exports = (async function config() {
  const { default: love } = await import('eslint-config-love')
  const { default: stylistic } = await import('@stylistic/eslint-plugin')
  const config = [
    eslint.configs.recommended,
    love,
    {
      languageOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          }
        }
      },
      files: ['**/*.ts', '**/*.tsx', '**/*.js'],
      plugins: {
        'react-hooks': hooksPlugin,
        'jimu-theme': jimuTheme,
        "react": eslintPlugin,
        '@stylistic': stylistic
      },
      rules: {
        'semi': ['error', 'never'],
        'jimu-theme/no-classic-variables': ['error', { themeAliases: ['theme', 'theme2', 'builderTheme', 'appTheme', 'exbTheme'] }],
        'jimu-theme/no-classic-css-vars': 'error',
        'jimu-theme/no-classic-css-utilities': 'error',
        'jimu-theme/no-unnecessary-template-vars': 'error',
        'jimu-theme/no-classic-variables-left': 'error',
        'jimu-theme/no-ref-palette': ['off', { themeAliases: ['theme', 'theme2', 'builderTheme', 'appTheme', 'exbTheme'] }],
        'jimu-theme/no-improperly-color': ['off', { themeAliases: ['theme', 'theme2', 'builderTheme', 'appTheme', 'exbTheme'] }],

        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        '@stylistic/block-spacing': 'error',
        '@stylistic/space-before-blocks': 'error',
        '@stylistic/no-trailing-spaces': 'error',
        '@stylistic/no-multi-spaces': 'error',
        '@stylistic/no-multiple-empty-lines': 'error',
        '@stylistic/no-whitespace-before-property': 'error',

        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',

        "@typescript-eslint/no-inferrable-types": "off",
        "arrow-body-style": "off",
        "class-methods-use-this": "off",
        "@typescript-eslint/class-methods-use-this": "off",
        "prefer-destructuring": "off",
        "@typescript-eslint/prefer-destructuring": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "init-declarations": "off",
        "@typescript-eslint/init-declarations": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-enum-comparison": "off",
        "@typescript-eslint/prefer-for-of": "off",
        "@typescript-eslint/no-unsafe-type-assertion": "off",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-unnecessary-condition": 'off',
        "@typescript-eslint/no-loop-func": "off",
        'eslint-comments/require-description': 'off',
        "@typescript-eslint/prefer-regexp-exec": "off",
        "@typescript-eslint/prefer-string-starts-ends-with": "off",
        "no-empty-pattern": "off",
        "@typescript-eslint/unified-signatures": "off",
        "prefer-regex-literals": "off",
        "@typescript-eslint/naming-convention": "warn",
        "react/no-unused-class-component-methods": "error",
        "@typescript-eslint/no-deprecated": "off",
        "no-console": "off",
        "max-lines": "off",
        "max-depth": "off",
        "logical-assignment-operators": "off",
        "complexity": "off",
        "promise/avoid-new": "off",
        "no-undef": "off",//Many ArcGIS types not declare in globals of eslint config, and declaring them one by one is cumbersome, so we disable the "no-undef" rule.
        "@typescript-eslint/no-misused-spread": "off",
        "guard-for-in": "off",
        "max-nested-callbacks": [
          "warn",
          {
            'max': 10
          }
        ],
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": [
          "error",
          {
            "allowComparingNullableBooleansToFalse": true,
            "allowComparingNullableBooleansToTrue": true,
            //This option will be removed in the next major version of typescript-eslint. https://typescript-eslint.io/rules/no-unnecessary-boolean-literal-compare/#allowruletorunwithoutstrictnullchecksiknowwhatiamdoing
            "allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing": true
          }
        ],

        //Temporary warning role
        "array-callback-return": "error",

        "max-params": [
          "error",
          {
            'max': 6
          }
        ],
        "@typescript-eslint/max-params": "off",

        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
            'ts-nocheck': true,
            'ts-check': false,
            minimumDescriptionLength: 0
          }
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'none',
            caughtErrors: 'none',
            ignoreRestSiblings: true,
            vars: 'all',
            varsIgnorePattern: '^jsx$'
          }
        ],
        "no-unused-vars": ["error", {
          args: 'none',
          caughtErrors: 'none',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^jsx$'
        }],
        '@typescript-eslint/consistent-indexed-object-style': [
          'error',
          'index-signature'
        ],
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/unbound-method': 'error',
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/require-array-sort-compare': 'off',
        '@typescript-eslint/promise-function-async': 'off',

        'node/handle-callback-err': 'off',
        'node/no-callback-literal': 'off',
        'n/handle-callback-err': 'off',
        'n/no-callback-literal': 'off',
        "@typescript-eslint/no-unnecessary-type-conversion": "off",
        "import/enforce-node-protocol-usage": "off",

        'no-return-await': 'off',
        'no-case-declarations': 'off',
        'prefer-promise-reject-errors': 'off',
        'prefer-optional-chain': 'off',
        'symbol-description': 'off',
        'no-template-curly-in-string': 'off',
        'spaced-comment': 'off',
        'no-fallthrough': 'off',
        'no-useless-escape': 'off',
        'object-shorthand': 'off'
      }
    },
    {
      files: ['**/translations/*.js'],
      languageOptions: {
        globals: {
          System: 'readonly',
          define: 'readonly'
        }
      },
      rules: {
        'camelcase': 'off',
        'max-len': 'off',
        'quote-props': 'off',
        'quotes': 'off',
        '@typescript-eslint/quotes': 'off',
        'no-useless-escape': 'off',
        'semi': 'off',
        '@typescript-eslint/semi': 'off',
        'eol-last': 'off',
        'comma-dangle': 'off',
        'key-spacing': 'off',
        'block-spacing': 'off',
        '@typescript-eslint/block-spacing': 'off',
        'brace-style': 'off',
        '@typescript-eslint/brace-style': 'off',
        'object-curly-newline': 'off',
        'object-curly-spacing': 'off',
        '@typescript-eslint/object-curly-spacing': 'off',
        '@stylistic/block-spacing': 'off'
      }
    },
    {
      files: ['**/translations/default.ts'],
      rules: {
        'camelcase': 'off',
        'max-len': 'off',
        'quote-props': 'off',
        '@typescript-eslint/quotes': 'off',
        'comma-dangle': 'off',
        'no-useless-escape': 'off',
        '@stylistic/block-spacing': 'off'
      }
    },
    {
      files: ['**/translations/**/*.js'],
      linterOptions: {
        reportUnusedDisableDirectives: "off"
      },
      rules: {
        'eslint-comments/no-unlimited-disable': 'off',
        'eslint-comments/no-unused-disable': 'off'
      }
    },
    {
      files: [
        'extensions/widgets/**/chart/src/runtime/**/*.{ts,tsx}',
        'extensions/widgets/**/chart/src/utils/**/*.{ts,tsx}',
        'extensions/widgets/common/filter/src/runtime/**/*.{ts,tsx}',
        'jimu-ui/basic/lib/sql-expression-runtime/**/*.{ts,tsx}',
        'jimu-ui/advanced/lib/sql-expression-builder/**/*.{ts,tsx}'
      ],
      rules: {
        'jimu-theme/no-ref-palette': ['error', { themeAliases: ['theme', 'theme2', 'builderTheme', 'appTheme', 'exbTheme'] }],
      }
    },
     {
      files: [
        'extensions/widgets/**/chart/src/runtime/**/*.{ts,tsx}',
        'extensions/widgets/**/chart/src/utils/**/*.{ts,tsx}',
        'extensions/widgets/common/filter/src/runtime/**/*.{ts,tsx}',
      ],
      rules: {
        'jimu-theme/no-improperly-color': ['warn', { themeAliases: ['theme', 'theme2', 'builderTheme', 'appTheme', 'exbTheme'] }],
      }
    },
    {
      files: [
        'builder/themes/**/*.{ts,tsx}',
        'builder/widgets/theme-setting/src/runtime/components/theme-setting/**/*.{ts,tsx}',
        'jimu-theme/lib/classic/**/*.{ts,tsx}',
        'jimu-theme/lib/manager/**/*.{ts,tsx}',
        'jimu-theme/lib/system/**/*.{ts,tsx}',
        'jimu-theme/lib/tests/**/*.{ts,tsx}',
        'jimu-theme/lib/utils/**/*.{ts,tsx}',
        'extensions/themes/**/*.{ts,tsx}',
        'jimu-theme/lib/tests/classic/*.{ts,tsx}',
        'storybook/stories/theme/**/*.{ts,tsx}'
      ],
      ignores: ['jimu-theme/lib/manager/components/*.{ts,tsx}', 'jimu-theme/lib/manager/global/mixin/*.{ts,tsx}'],
      rules: {
        'jimu-theme/no-classic-variables': 'off',
        'jimu-theme/no-classic-css-vars': 'off',
        'jimu-theme/no-classic-css-utilities': 'off',
        'jimu-theme/no-unnecessary-template-vars': 'off',
        'jimu-theme/no-classic-variables-left': 'off'
      }
    },
    {
      //Disable ts type-checked linting for js/json files
      ...tsEslint.configs.disableTypeChecked,
      "files": ['**/*.js', '**/*.json'],
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      plugins: {
        jest: jestPlugin
      },
      rules: {
        // see https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/unbound-method.md
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'error',
      },
    },
    // {
    //   plugins: {
    //     'jsx-a11y': jsxA11y
    //   },
    //   ...jsxA11y.flatConfigs.recommended,
    //   rules: {
    //     ...jsxA11y.configs.recommended.rules,
    //     'jsx-a11y/no-autofocus': 'off',
    //     'jsx-a11y/no-noninteractive-tabindex': 'off',
    //     'jsx-a11y/tabindex-no-positive': 'warn',
    //     // remove the below rules when eslint is done.(default is error)
    //     'jsx-a11y/aria-role': 'off',
    //     'jsx-a11y/aria-props': 'off',
    //     'jsx-a11y/role-supports-aria-props': 'off',
    //     'jsx-a11y/role-has-required-aria-props': 'off',
    //   },
    //   files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    //   languageOptions: {
    //     ...jsxA11y.flatConfigs.recommended.languageOptions,
    //     globals: {
    //       ...globals.serviceworker
    //     }
    //   }
    // },
    {
      ignores: globalIgnores
    }
  ]
  return config
})()
