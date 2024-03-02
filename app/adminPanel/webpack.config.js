const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PROJECT_NAME = "adminPanel";

module.exports = {
    entry: path.resolve(__dirname, 'src/index.ts'),

    output: {
        filename: `${PROJECT_NAME}.js`,
        path: path.resolve(path.join(__dirname, "../../", `./builds/${PROJECT_NAME}`)),
    },
    devServer: {
        static: path.resolve(__dirname, `./src`),
        port: 8080,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                use: [
                    {loader: 'babel-loader'},
                    {loader: 'ts-loader'}
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }],
    },

    plugins: [
        new ForkTsCheckerWebpackPlugin()
    ]
};
