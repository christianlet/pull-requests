import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.ts'],
        rules: {
            semi: ['error', 'never'],
            quotes: ['error', 'single'],
            'comma-dangle': ['error', 'never'],
            '@typescript-eslint/no-explicit-any': 'error',
            'indent': ['error', 4],
        }
    }
)
