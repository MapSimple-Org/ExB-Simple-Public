const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-css-vars')

ruleTester.run('no-classic-css-vars', rule, {
  valid: [
    {
      code: 'const style = `border-color: var(--ref-palette-neutral-200);`'
    },
    {
      code: 'const style = `border-color: var(--sys-color-primary-main);`'
    },
    {
      code: 'const style = `border-color: var(--mixin-shared-theme-body-color);`'
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--ref-palette-neutral-200)\' }} /> }'
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--sys-color-primary-main)\' }} /> }'
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--mixin-shared-theme-body-color)\' }} /> }'
    },
    {
      filename: 'project/test/example.json',
      code: JSON.stringify({
        color: 'var(--sys-color-primary-main)',
      })
    },
  ],

  invalid: [
    {
      filename: 'project/test/example.json',
      code: JSON.stringify({
        color: 'var(--primary)',
        background: 'var(--primary-100)',
      }),
      output: JSON.stringify({
        color: 'var(--sys-color-primary-main)',
        background: 'var(--sys-color-primary-light)',
      }),
      errors:[{ messageId: 'message', type: 'Literal' }, { messageId: 'message', type: 'Literal' }],
    }, {
      filename: 'project/test/example.json',
      code: JSON.stringify({
        color: 'var(--primary)',
        background: 'var(--primary-100)',
      }),
      output: JSON.stringify({
        color: 'var(--sys-color-primary-main)',
        background: 'var(--sys-color-primary-dark)',
      }),
      options: [{ invertShadeLightDarkPaths: ['**/test/*.json'] }],
      errors:[{ messageId: 'message', type: 'Literal' }, { messageId: 'message', type: 'Literal' }],
    },

    {
      code: 'const component = () => { return <WarningOutlined color=\'var(--primary-100)\' /> };',
      output: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-primary-light)\' /> };',
      filename: 'project/test/component.js',
      options: [{ invertShadeLightDarkPaths: ['**/builder/*.js'] }],
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <WarningOutlined color=\'var(--primary-100)\' /> };',
      output: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-primary-dark)\' /> };',
      filename: 'project/builder/component.js',
      options: [{ invertShadeLightDarkPaths: ['**/builder/*.js'] }],
      errors: [{ messageId: 'message', type: 'Literal' }]
    },

    {
      code: 'const component = () => { return <WarningOutlined color={\'var(--primary)\'} /> };',
      output: 'const component = () => { return <WarningOutlined color={\'var(--sys-color-primary-main)\'} /> };',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <WarningOutlined color=\'var(--primary)\' /> };',
      output: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-primary-main)\' /> };',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <WarningOutlined color=\'var(--primary-100)\' /> };',
      output: 'const component = () => { return <WarningOutlined color=\'var(--sys-color-primary-light)\' /> };',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <WarningOutlined color=\'var(--org-body-bg)\' /> };',
      output: 'const component = () => { return <WarningOutlined color=\'var(--mixin-shared-theme-body-bg)\' /> };',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },

    {
      code: 'const component = () => { return <Tooltip arrowStyle={{ background: \'var(--light-300)\', border: { color: \'var(--primary)\', width: \'1px\' } }} /> };',
      output: 'const component = () => { return <Tooltip arrowStyle={{ background: \'var(--ref-palette-neutral-400)\', border: { color: \'var(--sys-color-primary-main)\', width: \'1px\' } }} /> };',
      errors: [{ messageId: 'message', type: 'Literal' }, { messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <Tooltip arrowStyle={{ background: \'var(--primary)\', border: { color: \'var(--org-body-bg)\', width: \'1px\' } }} /> };',
      output: 'const component = () => { return <Tooltip arrowStyle={{ background: \'var(--sys-color-primary-main)\', border: { color: \'var(--mixin-shared-theme-body-bg)\', width: \'1px\' } }} /> };',
      errors: [{ messageId: 'message', type: 'Literal' }, { messageId: 'message', type: 'Literal' }]
    },

    {
      code: 'const color = \'var(--primary)\';',
      output: 'const color = \'var(--sys-color-primary-main)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--white)\';',
      output: 'const color = \'var(--ref-palette-white)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--light)\';',
      output: 'const color = \'var(--ref-palette-neutral-200)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--dark)\';',
      output: 'const color = \'var(--ref-palette-neutral-1200)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--transparent)\';',
      output: 'const color = \'transparent\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--primary-100)\';',
      output: 'const color = \'var(--sys-color-primary-light)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--danger-500)\';',
      output: 'const color = \'var(--sys-color-error-main)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--light-300)\';',
      output: 'const color = \'var(--ref-palette-neutral-400)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--dark-500)\';',
      output: 'const color = \'var(--ref-palette-neutral-1000)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--org-header-bg)\';',
      output: 'const color = \'var(--mixin-shared-theme-header-bg)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--org-header-color)\';',
      output: 'const color = \'var(--mixin-shared-theme-header-color)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--org-body-bg)\';',
      output: 'const color = \'var(--mixin-shared-theme-body-bg)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--org-body-color)\';',
      output: 'const color = \'var(--mixin-shared-theme-body-color)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--org-body-link)\';',
      output: 'const color = \'var(--mixin-shared-theme-body-link)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--org-button-bg)\';',
      output: 'const color = \'var(--mixin-shared-theme-button-bg)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const color = \'var(--org-button-color)\';',
      output: 'const color = \'var(--mixin-shared-theme-button-color)\';',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },

    {
      code: 'const style = `border-color: var(--primary);`',
      output: 'const style = `border-color: var(--sys-color-primary-main);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--white);`',
      output: 'const style = `border-color: var(--ref-palette-white);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--light);`',
      output: 'const style = `border-color: var(--ref-palette-neutral-200);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--dark);`',
      output: 'const style = `border-color: var(--ref-palette-neutral-1200);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--transparent);`',
      output: 'const style = `border-color: transparent;`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--primary-100);`',
      output: 'const style = `border-color: var(--sys-color-primary-light);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--danger-500);`',
      output: 'const style = `border-color: var(--sys-color-error-main);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--light-300);`',
      output: 'const style = `border-color: var(--ref-palette-neutral-400);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--dark-500);`',
      output: 'const style = `border-color: var(--ref-palette-neutral-1000);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--org-header-bg);`',
      output: 'const style = `border-color: var(--mixin-shared-theme-header-bg);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--org-header-color);`',
      output: 'const style = `border-color: var(--mixin-shared-theme-header-color);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--org-body-bg);`',
      output: 'const style = `border-color: var(--mixin-shared-theme-body-bg);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--org-body-color);`',
      output: 'const style = `border-color: var(--mixin-shared-theme-body-color);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--org-body-link);`',
      output: 'const style = `border-color: var(--mixin-shared-theme-body-link);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--org-button-bg);`',
      output: 'const style = `border-color: var(--mixin-shared-theme-button-bg);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },
    {
      code: 'const style = `border-color: var(--org-button-color);`',
      output: 'const style = `border-color: var(--mixin-shared-theme-button-color);`',
      errors: [{ messageId: 'message', type: 'TemplateLiteral' }]
    },

    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--primary)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--sys-color-primary-main)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--white)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'var(--ref-palette-white)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--light)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'var(--ref-palette-neutral-200)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--dark)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--ref-palette-neutral-1200)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--transparent)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'transparent\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--transparent)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid transparent\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--primary-100)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'var(--sys-color-primary-light)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--danger-500)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--sys-color-error-main)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--light-300)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'var(--ref-palette-neutral-400)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--dark-500)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--ref-palette-neutral-1000)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--org-header-bg)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'var(--mixin-shared-theme-header-bg)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--org-header-color)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--mixin-shared-theme-header-color)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--org-body-bg)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'var(--mixin-shared-theme-body-bg)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--org-body-color)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--mixin-shared-theme-body-color)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ borderColor: \'var(--org-body-link)\' }} /> }',
      output: 'const component = () => { return <div style={{ borderColor: \'var(--mixin-shared-theme-body-link)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--org-button-bg)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--mixin-shared-theme-button-bg)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div style={{ border: \'1px solid var(--org-button-color)\' }} /> }',
      output: 'const component = () => { return <div style={{ border: \'1px solid var(--mixin-shared-theme-button-color)\' }} /> }',
      errors: [{ messageId: 'message', type: 'Literal' }]
    }
  ],
})
