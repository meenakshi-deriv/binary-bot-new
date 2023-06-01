const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BlocklyConcatPlugin = require('./customPlugins/blockly-concat-plugin');

const production = process.env.NODE_ENV === 'production';

const plugins = [
    new Dotenv(),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
    }),
    new CopyWebpackPlugin([
        {
            from: 'node_modules/@deriv/deriv-charts/dist/*.smartcharts.*',
            to: path.resolve(__dirname),
            flatten: true,
        },
        {
            from: 'node_modules/binary-style/src/images/favicons',
            to: '../image/favicons',
        },
        {
            from: 'public',
            to: '../public',
        },
        {
            from: 'public/localstorage-sync.html',
            to: '../',
        },
        {
            from: 'templates/index.html',
            to: '../',
        },
    ]),
    new BlocklyConcatPlugin({
        outputPath: '../js',
        fileName: 'blockly.js',
        filesToConcat: [
            './node_modules/blockly/blockly_compressed.js',
            './node_modules/blockly/blocks_compressed.js',
            './node_modules/blockly/javascript_compressed.js',
            './node_modules/blockly/msg/messages.js',
        ],
    }),
];

const productionPlugins = () => {
    const args = {};
    if (process.env.ARGS.indexOf('--test')) {
        args.BRANCH = JSON.stringify(process.env.BRANCH);
        args.ARGS = JSON.stringify(process.env.ARGS);
    }
    if (process.env.NODE_ENV === 'production') {
        return [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify('production'),
                    ...args,
                },
            }),
            new webpack.optimize.UglifyJsPlugin({
                include: /\.js$/,
                minimize: true,
                sourceMap: true,
                compress: {
                    warnings: false,
                },
            }),
        ];
    }
    return [];
};

module.exports = {
    entry: {
        bot: path.join(__dirname, 'src', 'botPage', 'view'),
    },
    output: {
        filename: production ? 'bot.min.js' : 'bot.js',
        sourceMapFilename: production ? 'bot.min.js.map' : 'bot.js.map',
    },
    devtool: 'source-map',
    watch: !production,
    target: 'web',
    externals: {
        CIQ: 'CIQ',
        blockly: 'Blockly',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.(css|scss|sass)$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../image/',
                    },
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../font/',
                    },
                },
            },
        ],
    },
    plugins: plugins.concat(productionPlugins()),
};
