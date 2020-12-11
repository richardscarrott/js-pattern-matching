import copy from "rollup-plugin-copy";

export default [
  {
    input: "src/index.js",
    output: [
      { dir: "dist/cjs", format: "cjs" },
      { dir: "dist/es", format: "es" },
    ],
    plugins: [
      copy({
        targets: [{ src: "./src/index.d.ts", dest: ["dist/es", "dist/cjs"] }],
      }),
    ],
  },
];
