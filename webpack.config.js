const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    mode: 'production',
    entry: './src/index.js',
    devServer: {
        static: path.join(__dirname, 'src'),
        watchFiles: path.join(__dirname, 'src'),
        compress: true,
        port: 3000,
        hot: true,
        liveReload: true
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'TableLibrary.js',
        library: 'TableLibrary',
        libraryTarget: 'umd',
        globalObject: 'this',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'head',
            scriptLoading: 'blocking'
        }),
    ],
};
