module.exports = {
  'env': {
    'commonjs': true,
    'es6': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
  'rules': {
    'eqeqeq': ['error', 'always'],
    'no-multi-spaces': 'error',
    'no-empty': 0,
    // allow space-before-function-paren
    'space-before-function-paren': ['error', 'always'], // 函数[匿名函数]名 括号
    'semi': ['error', 'never'], // 无分号
    'quotes': ['error', 'single'] // 单引号
  }
}