module.exports = {
    transform: {
      "^.+\.tsx?$": "ts-jest",
    },
    testRegex: "(/__tests__/.*\.(test|spec))\.ts$",
    testPathIgnorePatterns: ["/src/", "/node_modules/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    collectCoverage: true,
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        }
    }
};
