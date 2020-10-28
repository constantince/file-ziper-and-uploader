import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
export default {
  input: "index.ts",
  output: [{
     file: 'lib/file-ziper-and-uploader.min.js',
     format: 'cjs',
     sourceMap: true
  }
],
  sourceMap: true,
  plugins: [
      commonjs(),
      typescript(),
      uglify({
         compress: true,
         sourcemap: true
      })
  ]
}
