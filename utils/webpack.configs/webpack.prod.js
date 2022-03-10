const webpack = require('webpack');
const merge = require('webpack-merge');
const webworker = require('./webpack.webworker.js');
const notWebworker = require('./webpack.not-webworker.js');
const common = require('./webpack.common.js');
const clean = require('./webpack.clean.js');
// const path = require('path');
// const ClosurePlugin = require('closure-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

let forProd = {
    mode: 'production',
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        // new BundleAnalyzerPlugin()
    ],
    optimization: {
        // sideEffects: false,
        // concatenateModules: false,
        minimizer: [
            new OptimizeCSSAssetsPlugin({}),
            // new ClosurePlugin({
            //     mode: 'STANDARD', // 'AGGRESSIVE_BUNDLE', // 'STANDARD',
            //     platform: "java"
            // }, {
            //     // debug: true,
            //     // renaming: false
            //     externs: [
            //         path.resolve(__dirname, '../closure/custom_extern.js')
            //     ],
            //     compilation_level: 'ADVANCED',
            //     // formatting: 'PRETTY_PRINT',
            // })
        ],
        splitChunks: {
            chunks: 'async',
            minSize: 20000,
            maxSize: 100000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            automaticNameMaxLength: 30,
            name: true,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                },
                styles: {
                    // Only 1 CSS file.
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        },
        // splitChunks: { // Does NOT break webworker. Interesting...
        //     cacheGroups: {
        //         styles: {
        //             // Only 1 CSS file.
        //             name: 'styles',
        //             test: /\.css$/,
        //             chunks: 'all',
        //             enforce: true,
        //         },
        //         commons: {
        //             minChunks: 2
        //         }
        //     },
        // },
    }
}

module.exports = [merge(clean, common, notWebworker, forProd), merge(common, webworker, forProd)];

// let webworkerFinal = merge(webworker, forProd);
// let nonWebworkerFinal = merge(notWebworker, forProd);

// module.exports = [webworkerFinal, nonWebworkerFinal];
// module.exports = [nonWebworkerFinal];
