const path = require('path');
const fs = require('fs');
const glob = require("glob");
const merge = require( 'webpack-merge' );

// Run jasmine as a shell process after building
const WebpackShellPlugin = require('webpack-shell-plugin');

// Extracting all node modules, is needed, since externals does not what we want automatically here
let nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

const target = process.env.npm_lifecycle_event === 'build' ? 'production' : 'development';

commonConfig = {
  // make sure that all test specs are included in bundle.js
  entry: { app : path.resolve(__dirname,'src/monads.ts') },
  target: 'node',
  
  output: {
    path: path.join(__dirname,'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.js'] 
  },
  module: {    
    rules: [
        { test: /\.ts$/, loader: 'ts-loader', options : {compilerOptions:{
          "module": "commonjs",
          "noImplicitAny": true,
          "removeComments": true,
          "preserveConstEnums": true,
          "outDir": "./build",
          "sourceMap": true,
          "target": "es2015"
        }} }
    ]
  },
  externals : nodeModules,
  plugins : [new WebpackShellPlugin({
            onBuildEnd:['node ./dist/app.js']
        })]
}

if ( target === 'development' ) {
    module.exports = merge( commonConfig, {
        entry: { 
            spec : glob.sync("./spec/**/*.ts"), 
            app : path.resolve(__dirname,'src/monads.ts')
        },
        plugins : [new WebpackShellPlugin({
            onBuildEnd:['jasmine']
        })]
    });
}
else 
{
    module.exports = commonConfig
}