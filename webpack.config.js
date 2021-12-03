// The path to the CesiumJS source code
const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

require('graceful-fs').gracefulify(require('fs'));

module.exports = {
    context: __dirname,
    mode: 'production',
    devtool: 'inline-source-map',
    entry: {
        app: ['webpack-hot-middleware/client', './src/app/index.js']
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
        sourcePrefix: ''
    },
    amd: {
        // Enable webpack-friendly use of require in Cesium
        toUrlUndefined: true
    },
    resolve: {
        alias: {
            cesium: path.resolve(__dirname, cesiumSource),
            css: path.resolve(__dirname, 'src/app/css')
        },
        mainFiles: ['index', 'Cesium']
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        },
        {
            test: /\.(png|gif|jpg|jpeg|svg)$/i, 
            use: [
                'file-loader?name=[path][name][ext]',
                {
                    loader: 'image-webpack-loader',
                    options: { 
                      bypassOnDebug: true, // webpack@1.x
                      disable: true, // webpack@2.x and newer                           
                      optipng: {                
                        enabled: false
                      }
                    }
                }
            ]
        },
        {        
            test: /\.(json|geojson)$/,
            use: [
                'file-loader?name=[path][name][ext]',
                {  
                    loader: 'json-perf-loader'
                }
            ]
        },
        {
            test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
            use: [ 'url-loader' ]
        }]
    },
    optimization: {
        // chunkIds: 'named',
        // moduleIds: 'deterministic',
        concatenateModules: true,
        mangleExports: true,
        mangleWasmImports: true,
        // mergeDuplicateChunks: false,
        minimize: false,
        innerGraph: false,
        minimizer: [
          new CssMinimizerPlugin(),
          new TerserPlugin({
            parallel: true,
            terserOptions: {
                compress: true,
                // minify: TerserPlugin.uglifyJsMinify,
                mangle: true
            },
            extractComments: false
          })
        ],
        emitOnErrors: false,
        nodeEnv: 'production',
        removeAvailableModules: false
        // splitChunks: {
        //     chunks: 'all',
        //     name: false
        // }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/app/index.html'
        }),
        // Copy Cesium Assets, Widgets, and Workers to a static directory
        new CopyWebpackPlugin({
            patterns: [
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' }
            ]
        }),
        new webpack.DefinePlugin({
            'process.env': {
              'NODE_ENV': JSON.stringify('production')
            },
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('')
        })
    ]
};