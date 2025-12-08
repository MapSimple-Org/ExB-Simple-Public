# This rule facilitates the deprecation of `sizes` variables in the classic theme and provides automatic fixes to replace these sizes variables with variables from the new theme (`jimu-theme/no-classic-sizes`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Options

<!-- begin auto-generated rule options list -->

| Name           | Description                                                                                                                                           | Type     | Default                                         |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :---------------------------------------------- |
| `themeAliases` | The plug-in determines whether a variable is a theme variable based on the "theme" keyword. If you use another name, define it through this property. | String[] | [`theme`, `theme2`, `builderTheme`, `appTheme`] |

<!-- end auto-generated rule options list -->
