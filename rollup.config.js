import copy from "rollup-plugin-copy";

export default [
  {
    input: {
      index: "src/index.js",
      comparators: "src/comparators/index.js",
      evaluators: "src/evaluators/index.js",
    },
    output: [
      { dir: "dist/cjs", format: "cjs", preserveModules: true },
      { dir: "dist/es", format: "es", preserveModules: true },
    ],
    plugins: [
      copy({
        targets: [{ src: "src/**/*.d.ts", dest: ["dist/cjs", "dist/es"] }],
        flatten: false,
      }),
    ],
  },
];
