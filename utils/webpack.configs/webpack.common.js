const path = require('path');
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const { DefinePlugin } = require('webpack');
// const webpack = require('webpack');

const opts = {
    USE_TFJS_NODE: false,
    // DEBUG: true,
    // version: 3,
    "ifdef-verbose": true,                 // add this for verbose output
    // "ifdef-triple-slash": false,           // add this to use double slash comment instead of default triple slash
    // "ifdef-fill-with-blanks": true,         // add this to remove code with blank spaces instead of "//" comments
    // "ifdef-uncomment-prefix": "// #code "  // add this to uncomment code starting with "// #code "
 };


module.exports = {
    plugins: [
        new DuplicatePackageCheckerPlugin(),
        // new webpack.ExtendedAPIPlugin()  // Gives hash as __webpack_hash__
        new DefinePlugin({
            __BUILD_TIME__: '"Built on ' + new Date().toLocaleString() + '"'
        })
    ],
    module: {
        rules: [
            // { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.tsx?$/, 
                exclude: /node_modules/, 
                use: [
                    { loader: "ts-loader" }, 
                    { loader: "ifdef-loader", options: opts } 
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        // alias: {
        //     'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
        // }
    },
    output: {
        path: path.resolve(__dirname, '../../dist'),
        globalObject: 'this'
    }
};
