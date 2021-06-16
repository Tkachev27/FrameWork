const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const copyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const autoprefixer = require('autoprefixer')
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')

//Developing modes
const isProd = process.env.NODE_ENV === 'production'
const isDev = !isProd

//Аile name formation depending on the development mode
const filename = (ext) => (isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`)

//Javascript loaders
const jsLoaders = () => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: {
                presets: ['@babel/preset-env', '@babel/preset-typescript'],

                plugins: ['@babel/plugin-proposal-class-properties'],
            },
        },
        {
            loader: 'ts-loader',
        },
    ]

    return loaders
}

module.exports = {
    context: path.resolve(__dirname, 'src'),

    mode: 'development',

    entry: ['@babel/polyfill', './TypeScripts/index.ts'],

    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],

        alias: {
            '@core': path.resolve(__dirname, 'FrameWork'),
            '@': path.resolve(__dirname, 'src'),
        },
    },

    devtool: isDev ? 'source-map' : false,

    devServer: {
        port: 3000,
        hot: isDev,
        historyApiFallback: true,
    },

    plugins: [
        new CleanWebpackPlugin(),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'HTML/template.html',
            minify: {
                removeComments: isProd,
                collapseWhitespace: isProd,
            },
        }),

        new copyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/favicon.ico'),
                    to: path.resolve(__dirname, 'dist'),
                },
            ],
        }),

        new MiniCssExtractPlugin({ filename: filename('css') }),
        new ServiceWorkerWebpackPlugin({
            entry: path.join(__dirname, 'src/sw.js'),
        }),
    ],

    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { hmr: isDev, reloadAll: true },
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                autoprefixer({
                                    browsers: ['ie >= 8', 'last 4 version'],
                                }),
                            ],
                        },
                    },

                    'sass-loader',
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { hmr: isDev, reloadAll: true },
                    },
                    'css-loader',
                ],
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: jsLoaders(),
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                    },
                ],
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ['file-loader'],
            },
            {
                test: /\.(woff2|woff|eot|ttf|svg)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]',
                },
            },
        ],
    },
}
