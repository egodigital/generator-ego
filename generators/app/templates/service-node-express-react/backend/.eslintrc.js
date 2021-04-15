module.exports = {
    "extends": "ego",
    "ignorePatterns": ['.eslintrc.js'],
    "parserOptions": {
        "project": "tsconfig.json",
        "tsconfigRootDir": __dirname,
        "sourceType": "module",
    },
    "rules": {
        // Additional, per-project rules...
        "require-await": "off",
        "import/no-default-export": "off"
    }
}