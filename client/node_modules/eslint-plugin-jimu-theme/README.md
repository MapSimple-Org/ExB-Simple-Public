# eslint-plugin-jimu-theme

This plug-in is used to assist in migrating jimu-theme variables to the new version.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-jimu-theme`:

```sh
npm install eslint-plugin-jimu-theme --save-dev
```

## Usage

Add `jimu-theme` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "jimu-theme"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "jimu-theme/rule-name": 2
    }
}
```

## Note

This plugin is only for assisting in `jimu-theme` upgrades and should not be used for other purposes.


The `no-classic-*` rules are used to upgrade corresponding variables, for example:

```
theme.colors.primary => theme.sys.color.primary.main
```

Rule `no-classic-variables` contains all other rules prefixed with `no-classic` (except rule `no-classic-css-utilities`,  `no-classic-css-vars`), so you can choose to replace them with rule `no-classic-variables`.

The rule `no-unnecessary-template-vars` is intended to clean up abnormal code after a theme upgrade, such as:

```
~~const style = `color: ${'transparent'};`~~

const style = `color: transparent;`
```

The rule `no-unnecessary-template-vars` need to be placed after `no-classic-*`.

Then put rule `no-classic-variables-left` after all rules to check whether any classic theme variables are not recognized.

Furthermore, after automatic fixing, there might still be incorrect code remaining, which requires reviewing each file individually.

For example:

Before fixing:
```js
const colors = theme.colors
const primary = colors.primary
```
After fixing:
```js
const colors = theme.colors
const primary = theme.sys.color.primary.main
```
You can see that after the fix, a variable named "theme" is missing, and the definition of the "colors" variable is no longer needed. These require further manual processing.
If you perform global automatic fixing, you need to pay attention to the warning and error messages eslint prints on the console to complete this part of the manual fixing.

We recommend autofixing files one by one rather than applying a global autofix directly.

## Rules

<!-- begin auto-generated rules list -->

🔧 Automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/user-guide/command-line-interface#--fix).

| Name                                                                       | Description                                                                                                                                                                                                                             | 🔧 |
| :------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :- |
| [no-classic-border](docs/rules/no-classic-border.md)                       | This rule facilitates the deprecation of `border` variables in the classic theme and provides automatic fixes to replace these border variables with variables from the new theme or fallback values.                                   | 🔧 |
| [no-classic-border-radius](docs/rules/no-classic-border-radius.md)         | This rule facilitates the deprecation of `borderRadiuses` variables in the classic theme and provides automatic fixes to replace these borderRadiuses variables with variables from the new theme or fallback values.                   | 🔧 |
| [no-classic-colors](docs/rules/no-classic-colors.md)                       | This rule updates `colors` variables from old classic theme to new theme.                                                                                                                                                               | 🔧 |
| [no-classic-css-utilities](docs/rules/no-classic-css-utilities.md)         | This rule facilitates the upgrade of css utilities from the classic theme to the new theme.                                                                                                                                             | 🔧 |
| [no-classic-css-vars](docs/rules/no-classic-css-vars.md)                   | This rule facilitates the transition of CSS variables representing colors from the classic theme to the new theme.                                                                                                                      | 🔧 |
| [no-classic-dark-theme](docs/rules/no-classic-dark-theme.md)               | This rule facilitates the deprecation of `darkTheme` variables in the classic theme and provides automatic fixes to replace it with variables from the new theme.                                                                       | 🔧 |
| [no-classic-elements](docs/rules/no-classic-elements.md)                   | This rule facilitates the deprecation of elements(e.g header, footer, body, link) variables in the classic theme and provides automatic fixes to replace these elements variables with variables from the new theme or fallback values. | 🔧 |
| [no-classic-focused-styles](docs/rules/no-classic-focused-styles.md)       | This rule facilitates the deprecation of `focusedStyles` variables in the classic theme and provides automatic fixes to replace these `focusedStyles` variables with variables from the new theme or fallback values.                   | 🔧 |
| [no-classic-shadow](docs/rules/no-classic-shadow.md)                       | This rule facilitates the deprecation of `boxShadows` variables in the classic theme and provides automatic fixes to replace these boxShadows variables with variables from the new theme.                                              | 🔧 |
| [no-classic-sizes](docs/rules/no-classic-sizes.md)                         | This rule facilitates the deprecation of `sizes` variables in the classic theme and provides automatic fixes to replace these sizes variables with variables from the new theme.                                                        | 🔧 |
| [no-classic-surface](docs/rules/no-classic-surface.md)                     | This rule facilitates the deprecation of `surfaces` variables in the classic theme and provides automatic fixes to replace these border variables with variables from the new theme or fallback values.                                 | 🔧 |
| [no-classic-typography](docs/rules/no-classic-typography.md)               | This rule facilitates the deprecation of `typography` variables in the classic theme and provides automatic fixes to replace these typography variables with variables from the new theme or fallback values.                           | 🔧 |
| [no-classic-variables](docs/rules/no-classic-variables.md)                 | This rule updates variables from old classic theme to new theme.                                                                                                                                                                        | 🔧 |
| [no-classic-variables-left](docs/rules/no-classic-variables-left.md)       | This rule is to check whether there are any remaining classical variables.                                                                                                                                                              | 🔧 |
| [no-gutters](docs/rules/no-gutters.md)                                     | This rule facilitates the deprecation of `gutters` variables in the theme and provides automatic fixes to replace these gutter variables with specific values.                                                                          | 🔧 |
| [no-improperly-color](docs/rules/no-improperly-color.md)                   | This rule is meant to identify the improper use of theme color variables in widgets or components.                                                                                                                                      | 🔧 |
| [no-ref-palette](docs/rules/no-ref-palette.md)                             | This rule is used to check whether a theme ref palette variable is being used.                                                                                                                                                          | 🔧 |
| [no-unnecessary-template-vars](docs/rules/no-unnecessary-template-vars.md) | Remove unnecessary template string variables. Note: If it is used for theme upgrade, this rule should be called after other rules for upgrading the theme to fix abnormal results caused by the upgrade.                                | 🔧 |

<!-- end auto-generated rules list -->


