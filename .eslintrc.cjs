module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es2021: true
    },
    extends: [
        'eslint:recommended',
        '@vue/prettier',
        'plugin:vue/vue3-recommended'
    ],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        'no-console': 'warn',
        'no-debugger': 'warn',
        'vue/multi-word-component-names': 'off',
        'vue/no-unused-vars': 'warn'
    }
}