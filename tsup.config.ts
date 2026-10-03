import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', node: 'src/node.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: false,
  clean: true,
  target: 'es2022',
  platform: 'neutral',
  splitting: false,
  treeshake: true,
  // Встроенные модули Node не встраиваются (при platform: 'neutral' esbuild сам их не исключает)
  // и остаются импортами `node:…` — их понимают Node, Bun, Deno и сборщики.
  external: [/^node:/],
  removeNodeProtocol: false,
  esbuildOptions(options) {
    // Кириллица в сообщениях об ошибках — как есть, а не последовательностями \uXXXX.
    options.charset = 'utf8';
  },
});
