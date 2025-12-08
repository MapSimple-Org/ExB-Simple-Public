const { ruleTester } = require('../utils')
const rule = require('../../../lib/rules/no-classic-css-utilities')


ruleTester.run('no-classic-css-utilities', rule, {
  valid: [
    {
      code: 'const component = () => { return <div className=\'foo\' /> }'
    },
    {
      code: 'const component = () => { return <div className=\'foo bar foo-bar\' /> }'
    }
  ],

  invalid: [
    {
      code: 'const component = () => { return <div className=\'foo text-primary\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div className=\'foo text-primary bar\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div className=\'text-primary foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div className=\'text-primary foo bar\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }]
    },
    {
      code: 'const component = () => { return <div className=\'text-primary\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }]
    },

    {
      code: 'const component = () => { return <div className=\'text-secondary foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-success foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-info foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-warning foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-danger foo\' /> }',
      errors: [{ messageId: 'deprecated', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-white foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-black foo\' /> }',
      output: 'const component = () => { return <div className=\'text-overlay foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-transparent foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark foo\' /> }',
      output: 'const component = () => { return <div className=\'text-default foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-primary foo\' /> }',
      errors: [{ messageId: 'deprecated', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-secondary foo\' /> }',
      errors: [{ messageId: 'deprecated', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-success foo\' /> }',
      errors: [{ messageId: 'deprecated', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-info foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-warning foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-danger foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-white foo\' /> }',
      output: 'const component = () => { return <div className=\'bg-overlay foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-black foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-transparent foo\' /> }',
      errors: [{ messageId: 'deprecated', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light foo\' /> }',
      output: 'const component = () => { return <div className=\'bg-paper foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-primary foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-secondary foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-success foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-info foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-warning foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-danger foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-white foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-black foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-transparent foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light foo\' /> }',
      output: 'const component = () => { return <div className=\'border-color-tertiary foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },

    {
      code: 'const component = () => { return <div className=\'text-light-100 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-200 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-300 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-400 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-500 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-600 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-700 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-800 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-light-900 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-100 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-200 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-300 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-400 foo\' /> }',
      output: 'const component = () => { return <div className=\'hint-default foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-500 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-600 foo\' /> }',
      output: 'const component = () => { return <div className=\'hint-paper foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-700 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-800 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'text-dark-900 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-100 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-200 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-300 foo\' /> }',
      output: 'const component = () => { return <div className=\'bg-default foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-400 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-500 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-600 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-700 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-800 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-light-900 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-100 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-200 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-300 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-400 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-500 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-600 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-700 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-800 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'bg-dark-900 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-100 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-200 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-300 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-400 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-500 foo\' /> }',
      output: 'const component = () => { return <div className=\'border-color-secondary foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-600 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-700 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-800 foo\' /> }',
      output: 'const component = () => { return <div className=\'border-color-primary foo\' /> }',
      errors: [{ messageId: 'replace', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-light-900 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-100 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-200 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-300 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-400 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-500 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-600 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-700 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-800 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    },
    {
      code: 'const component = () => { return <div className=\'border-dark-900 foo\' /> }',
      errors: [{ messageId: 'removed', type: 'Literal' }],
    }
  ],
})
