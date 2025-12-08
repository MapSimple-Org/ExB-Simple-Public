const React = require('react');

module.exports.default = jest.fn((props) => {
  return React.createElement('svg', props);
});