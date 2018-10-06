const buble = require('rollup-plugin-buble');
const cjs = require('rollup-plugin-commonjs');
const node = require('rollup-plugin-node-resolve');

const version = process.env.VERSION || require('./package.json').version

const banner =
  '/*!\n' +
  ' * isect v' + version + '\n' +
  ' * (c) 2018 Andrei Kashcha.\n' +
  ' * Released under the MIT License.\n' +
  ' */'
export default {
  input: 'src/index.js',
  plugins: [
		node(),
		cjs(),
		buble()
	],
  output: [{
      sourcemap: true,
      format: 'umd',
      name: 'isect',
      file: 'build/isect.js',
      banner
    },
    {
      format: 'es',
      file: 'build/isect.module.js'
    }
	],
}
