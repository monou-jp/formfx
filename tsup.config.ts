import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    editor: 'src/editor/RuleEditor.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  injectStyle: false, // CSSは別途出力
});
