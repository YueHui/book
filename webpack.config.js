const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'book.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: 'Book',
        umdNamedDefine: true
    },
    devServer: {
        contentBase: './',
    },
    devtool: "module-eval-source-map",
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'picPlayer',
            template: "./index.html",
            inject:false
        })
    ],
    module:{
        
    }
};