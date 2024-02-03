const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const PROJECT_NAME = "TableLibrary";

module.exports = {
    entry: path.resolve(__dirname, 'src'),

    output: {
        filename: `${PROJECT_NAME}.js`,
        path: path.resolve(path.join(__dirname, `./builds/${PROJECT_NAME}`)),
        libraryTarget: 'umd',
        library: `${PROJECT_NAME}`,
        globalObject: 'this'
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
            }],
    },

    plugins: [
        new ForkTsCheckerWebpackPlugin(),
    ]
};
