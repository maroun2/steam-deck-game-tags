import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import externalGlobals from 'rollup-plugin-external-globals';

export default {
  input: './src/index.tsx',
  output: {
    file: 'dist/index.js',
    format: 'iife',
    name: 'PluginExport',
    globals: {
      react: 'SP_REACT',
      'react-dom': 'SP_REACTDOM',
      '@decky/ui': 'DFL',
      '@decky/api': 'DeckyAPI'
    }
  },
  plugins: [
    typescript(),
    commonjs(),
    nodeResolve({ browser: true }),
    externalGlobals({
      react: 'SP_REACT',
      'react-dom': 'SP_REACTDOM',
      '@decky/ui': 'DFL',
      '@decky/api': 'DeckyAPI'
    }),
    replace({
      preventAssignment: false,
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  external: ['react', 'react-dom', '@decky/ui', '@decky/api']
};
