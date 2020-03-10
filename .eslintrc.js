module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'no-console': 'error',
    'react/jsx-key': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'import/order': [
      'error',
      {
        groups: ['external', 'internal', 'builtin', 'parent', 'unknown', 'index', 'sibling'],
        'newlines-between': 'always',
      },
    ],
  },
}
