module.exports = {
    "extends": ["standard-with-typescript", "plugin:@typescript-eslint/recommended-type-checked", "prettier"],
	"plugins": ['@typescript-eslint'],
    "parser": '@typescript-eslint/parser',
    "parserOptions": {
		"project": true,
        "ecmaVersion": "latest",
		"files": "**/*.ts"
    },
    "rules": {
    },
	"root": true
}
