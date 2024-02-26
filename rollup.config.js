import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/treexplorer.ts",
  output: [
    {
      sourcemap: !production,
      file: "dist/bundle.js",
      // format: "iife", // browser
      format: "es", // browser
      // format: "cjs", // node
      // for both browser and node
      name: "treexplorer",
      // format: "umd",
    },
    {
      sourcemap: !production,
      file: "dist/bundle.min.js",
      // format: "iife", // browser
      format: "es", // browser
      // format: "cjs", // node
      // for both browser and node
      name: "treexplorer",
      // format: "umd",
      plugins: [terser({ compress: { drop_console: true } })],
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      sourceMap: !production,
      inlineSources: !production,
    }),
    copy({
      targets: [
        {
          src: "dist/bundle.js",
          dest: "example/treexplorer/",
          // rename: () => "treexplorer.js",
        },
        {
          src: "dist/bundle.js.map",
          dest: "example/treexplorer/",
          // rename: () => "treexplorer.js.map",
        },
        {
          src: "src/treexplorer.css",
          dest: "dist/",
          rename: () => "style.css",
        },
        {
          src: "src/treexplorer.css",
          dest: "example/treexplorer/",
          rename: () => "style.css",
        },
      ],
      hook: "writeBundle",
    }),
  ],
};
