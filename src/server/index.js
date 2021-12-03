const express= require('express');
const app = express();
const compression = require('compression');
app.use(compression());

const path= require('path');

const HOSTNAME = 'localhost';
const PORT = 8080;

const webpack= require('webpack');
const webpackconfig = require('../../webpack.config.js');
const webpackMiddleware= require('webpack-dev-middleware');
const webpackHotMiddleware= require('webpack-hot-middleware');

const buildDir = '../../dist/';

app.use(express.static(path.join(__dirname, buildDir)));

const webpackCompiler=webpack(webpackconfig);
const wpmw = webpackMiddleware(webpackCompiler,{ });
app.use(wpmw);
app.use(webpackHotMiddleware(webpackCompiler));

app.listen(PORT, (err) => {
    if (err) { return console.error(err); }
    console.log(`Server running on ${HOSTNAME}:${PORT}`);
    require("openurl").open(`http://${HOSTNAME}:${PORT}`);
});