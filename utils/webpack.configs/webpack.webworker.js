const path = require('path');
// const merge = require('webpack-merge');
// const common = require('./webpack.common.js');

module.exports = {
    entry: {
        renderWebWorker: path.join(__dirname, '../../src/Pix2Pix/NeuralRender/WebWorker.ts'),
    },
    output: {
        filename: "[name].js"
    },
}
