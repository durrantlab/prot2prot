const merge = require('webpack-merge');
const webworker = require('./webpack.webworker.js');
const notWebworker = require('./webpack.not-webworker.js');
const webpackDashboard = require('webpack-dashboard/plugin');
const common = require('./webpack.common.js');
const clean = require('./webpack.clean.js');

let forDev = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: '../../dist',
        hot: false,  // This breaks webworkers if true.
        liveReload: true,
        writeToDisk: true,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    },
    plugins: [
        new webpackDashboard(),
    ]
};

module.exports = [merge(clean, common, notWebworker, forDev), merge(common, webworker, forDev)];

// let webworkerFinal = merge(webworker, forDev);
// let nonWebworkerFinal = merge(notWebworker, forDev);

// module.exports = [webworkerFinal, nonWebworkerFinal];
// // module.exports = [nonWebworkerFinal];
