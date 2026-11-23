module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["@tetrascience-npm/tetrascience-react-ui/jest-setup"],
  // @tetrascience-npm/ts-lib-viz ships ESM only, and so do the d3 and visx packages it imports, so Jest
  // cannot require them as they are. Babel transforms them here. A Jest consumer of the kit that
  // renders charts needs the same entry in its own config until ts-lib-viz ships a CommonJS build.
  transformIgnorePatterns: ["/node_modules/(?!(@tetrascience-npm/ts-lib-viz|@visx/annotation|d3-[^/]+)/)"],
};
