
/*var CompressionPlugin = require('compression-webpack-plugin');

new CompressionPlugin({
          asset: "[path].gz[query]",
          algorithm: "gzip",
          test: /\.js$|\.css$|\.html$/,
          threshold: 10240,
          minRatio: 0.8
        })

        */

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'babel-loader',
                        options: { presets: ['es2015', 'react'] }
                    }
                ]
            },
            {
                test: /(\.scss|\.css)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true,
                            localIdentName: '[name]_[local]_[hash:base64:5]'
                        }
                    },
                    {
                        loader: 'sass-loader',
                    }
                ]
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            FIREBASE_APIKEY : JSON.stringify('AIzaSyBK6xhTR4ffnYMfVJCj0769n4I7Wza4zZ0'),
            FIREBASE_AUTHDOMAIN : JSON.stringify('profoudlycomments.firebaseapp.com'),
            FIREBASE_DATABASE_URL : JSON.stringify('https://profoudlycomments.firebaseio.com'),
            FIREBASE_PROJECT_ID : JSON.stringify('profoudlycomments'),
            FIREBASE_MESSAGING_ID : JSON.stringify('864670885969'),
            // FIREBASE_STORAGE_BUCKET : JSON.stringify(''),
            API: JSON.stringify('https://test.neargroup.me/abTesting/'),
            LIVEAPI: JSON.stringify('https://wisp.neargroup.me/wisp/'),
            AVTAR: JSON.stringify('avtar.svg'),
            ISDEV: true,
            'process.env': {
                NODE_ENV: JSON.stringify('dev')
            }

        })
      ]
};
