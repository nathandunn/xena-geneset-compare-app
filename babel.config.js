module.exports = api => {
  api.cache(false)
  return {
    // babelrcRoots: ['.', './packages/*', './products/*', './plugins/*'],
    comments: true,
    presets: [
      'react-app',
    ],
    ignore: [
      './node_modules',
      './packages/*/node_modules',
      './products/*/node_modules',
      './plugins/*/node_modules',
      './src/data/genesets',
    ],
    plugins: [
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-export-default-from',
      [
        '@babel/transform-runtime',
        {
          regenerator: false,
          useESModules: false,
        },
      ],
    ],
  }
}
