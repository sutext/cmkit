var ugly = require('uglify-js');
var fs = require('@sutxt/fs');
if (fs.exist('egret')) {
    fs.rmdir('egret');
}
if (fs.exist('web')) {
    fs.rmdir('web');
}
fs.mkdir('egret');
fs.mkdir('web');
var cmkitjs = fs.read('src/cmkit.js');
var egretjs = fs.read('src/egret.js');
var cocosjs = fs.read('src/cocos.js');
var modulejs = 'Object.defineProperty(exports, "__esModule", { value: true });';
var code = ugly.minify([cmkitjs, egretjs], { output: { beautify: true } }).code;
fs.write('egret/cmkit.js', code);
code = ugly.minify([cmkitjs, egretjs], { mangle: true, compress: true }).code;
fs.write('egret/cmkit.min.js', code);
code = ugly.minify([cmkitjs, cocosjs], { mangle: true, compress: true }).code;
fs.write('cocos/assets/cmkit.js', code);
code = ugly.minify([modulejs, cmkitjs], { mangle: true, compress: true }).code;
fs.write('web/index.js', code);
