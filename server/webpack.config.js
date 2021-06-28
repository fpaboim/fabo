const slsw = require('serverless-webpack');
const nodeExternals = require("webpack-node-externals");
const path = require('path')

module.exports = {
  target: 'node',
  // entry: { handler: './server.js' },
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  node: false,
  optimization: {
    minimize: false,
  },
  // devtool: 'inline-cheap-module-source-map',
  externals: [nodeExternals()],
  // externals: {
  //   "saslprep": "require('saslprep')"
  // },
  // module: {
  //   rules: [
  //     {
  //       // test: /.js$/,
  //       exclude: /node_modules/,
  //       use: [
  //         {
  //           loader: 'babel-loader',
  //           // options: {
  //           //   presets: [
  //           //     [
  //           //       '@babel/preset-env',
  //           //       { targets: { node: '12' }, useBuiltIns: 'usage', corejs: 3 }
  //           //     ]
  //           //   ]
  //           // }
  //         }
  //       ]
  //     }
  //   ]
  // },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  node: true,
                },
              },
            ]
          ],
        },
        include: [__dirname],
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
};
