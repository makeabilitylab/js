const path = require('path');

module.exports = {
    entry: './src/lib/index.js', // Adjust this path to your main entry file
    resolve: {
      alias: {
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@graphicslib': path.resolve(__dirname, 'src/lib/graphics'),
        '@mathlib': path.resolve(__dirname, 'src/lib/math'),
        '@apps': path.resolve(__dirname, 'src/apps'),
        '@dist': path.resolve(__dirname, 'dist')
      },
    },
    output: {
        path: path.resolve(__dirname, 'dist'), // Output directory
        filename: 'makelab.bundle.js', // Output file names
        // library: {
        //   name: "makelab",
        //   type: "umd",
        // },
        // globalObject: 'this',
    },
    mode: 'development',
    //mode: 'production',
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    },
    devServer: {
      static: [
        {
            directory: path.join(__dirname, 'src/apps'),
            publicPath: '/apps',
        },
        {
            directory: path.join(__dirname, 'dist'),
            publicPath: '/dist',
        }
      ],
      compress: true,
      port: 9000,
      open: true,
      hot: true,
    },
};