const path = require('path')
var webpack = require('webpack')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.env.EMVE_PORT = process.env.EMVE_PORT || 9000

const config = function (mode) {
    let conf = {
        mode: mode,
        entry: ['./src/index.js'],
        module: {
            rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.html$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'html-loader',
                    options: {}
                }
            },
            {
              test: /\.css$/,
              use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
                use: {
                    loader: 'file-loader',
                    options: { name: '[name].[ext]' }  // <-- retain original file name
                }
            }
        ]
        },
        output: {
            path: path.resolve(__dirname, 'public/bundle/'),
            filename: 'bundle.js',
            publicPath: '/',
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.$": "jquery",
                "window.jQuery": "jquery"
            })
        ],
        devServer: {
            watchOptions: {
                ignored: /node_modules/
            },
            contentBase: 'public',
            watchContentBase: true,
            compress: true,
            hot: true,
            port: process.env.EMVE_PORT
        },
        resolve: {
            fallback: { 
                "stream": require.resolve("stream-browserify"),
                "buffer": false 
            }
        }
    }

    if (mode === 'development') {
        conf.plugins.push(new webpack.HotModuleReplacementPlugin())
        conf.plugins.push(new webpack.NoEmitOnErrorsPlugin())
    }

    return conf
}

module.exports = config(process.env.NODE_ENV)