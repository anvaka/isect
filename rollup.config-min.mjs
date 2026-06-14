import { nodeResolve as node } from '@rollup/plugin-node-resolve';
import cjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with { type: 'json' };

const version = process.env.VERSION || pkg.version

const banner =
  '/*!\n' +
  ' * isect v' + version + '\n' +
  ' * (c) 2018 Andrei Kashcha.\n' +
  ' * Released under the MIT License.\n' +
  ' */'
export default {
  input: 'index.js',
  plugins: [
		node(),
		cjs(),
    terser()
	],
  output: [{
      sourcemap: true,
      format: 'umd',
      name: 'isect',
      file: 'build/isect.min.js',
      banner,
      plugins: []
    }
  ],
}
