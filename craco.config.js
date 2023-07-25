
const path = require("path");
const webpack = require("webpack");
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ThreadsPlugin = require('threads-plugin');

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve("src"),
      "stream": "stream-browserify", //必须放这里
      "zlib": "browserify-zlib"  //必须放这里
    },
    resolve: {
      fallback: {
        "assert": require.resolve("assert/"),
        "buffer": require.resolve("buffer/"),
        // "stream": require.resolve("stream-browserify"), //不能放这里
        // "zlib": require.resolve("browserify-zlib") //不能放这里
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"]
      }),
      //替换public/index.html中%PUBLIC_URL%变量，只影响favicon.ico，logo192.png和manifest.json
      //下面的publicPath，不会对favicon.ico，logo192.png和manifest.json路径有影响，所以这里的路径要单独设置
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
        // PUBLIC_URL: process.env.NODE_ENV === 'production' ? '/shining' : ''
        PUBLIC_URL: process.env.NODE_ENV === 'production' ? '' : ''
      }),  
      // new ThreadsPlugin(),  
    ],
    configure: {
      output: {
        //webpack打包的程序默认放在/static/中,下面的路径只对/static和/static中代码所引用的路径有影响
        //js的所有程序打包后放在static/js/main.js里，图片放在static/media里
        // publicPath: process.env.NODE_ENV === 'production' ? '/shining/' : '/'
        publicPath: process.env.NODE_ENV === 'production' ? '/' : '/'
      },
      devtool: process.env.NODE_ENV === 'production' ? false : 'source-map'
    },
    // module: {
    //   rules: [
    //     {
    //       test: /\.less$/,
    //       use: [
    //         'style-loader',
    //         'css-loader',
    //         'less-loader'
    //       ]
    //     }
    //   ]
    // }
  }
};