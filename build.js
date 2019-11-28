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
function writeResult(path, result) {
    if (result.error) {
        throw result.error;
    } else {
        fs.write(path, result.code);
    }
}
var cmkitjs = fs.read('src/cmkit.js');
var egretjs = fs.read('src/egret.js');
var cocosjs = fs.read('src/cocos.js');
var modulejs = 'Object.defineProperty(exports, "__esModule", { value: true });';
var result = ugly.minify([cmkitjs, egretjs], { output: { beautify: true, keep_quoted_props: true } });
writeResult('egret/cmkit.js', result);
result = ugly.minify([cmkitjs, egretjs], { mangle: true, compress: true });
writeResult('egret/cmkit.min.js', result);
result = ugly.minify([cmkitjs, cocosjs], { mangle: true, compress: true });
writeResult('cocos/assets/cmkit.js', result);
result = ugly.minify([modulejs, cmkitjs], { mangle: true, compress: true });
writeResult('web/index.js', result);
