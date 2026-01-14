import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['cjs', 'esm', 'iife'], // iife (即時実行関数) を含める
  globalName: 'FormFx',          // window.FormFx に登録
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  splitting: false,              // global版では必須
  outExtension({ format }) {
    return {
      js: format === 'iife' ? '.global.js' : '.js',
    };
  },
});