var fs = require('fs');
var path = require('path');
var cmhome = path.join(__dirname, '..');
if (!fs.existsSync(path.join(cmhome, '../../package.json'))) {
    console.log('is not in local project dir! no need install!');
    return;
}
function cpdir(src, dist) {
    fs.mkdirSync(dist);
    var files = fs.readdirSync(src);
    files.forEach(function(file) {
        var srcFile = src + '/' + file;
        var distFile = dist + '/' + file;
        if (fs.statSync(srcFile).isDirectory()) {
            cpdir(srcFile, distFile);
        } else {
            fs.copyFileSync(srcFile, distFile);
        }
    });
}
var rmdir = function(dir) {
    var files = [];
    if (fs.existsSync(dir)) {
        files = fs.readdirSync(dir);
        files.forEach(function(file) {
            var path = dir + '/' + file;
            if (fs.statSync(path).isDirectory()) {
                rmdir(path);
            } else {
                fs.unlinkSync(path);
            }
        });
        fs.rmdirSync(dir);
    }
};
var installDir = path.join(cmhome, 'install');
var cocosDir = path.join(cmhome, 'cocos');
var webDir = path.join(cmhome, 'web');
if (fs.existsSync(path.join(cmhome, '../../project.json')) && fs.existsSync(path.join(cmhome, '../../settings/project.json')) && fs.existsSync(path.join(cmhome, '../../assets'))) {
    var packagesDir = path.join(cmhome, '../../packages');
    var packageTarget = path.join(packagesDir, 'cmkit');
    if (!fs.existsSync(packagesDir)) {
        fs.mkdirSync(packagesDir);
    }
    if (fs.existsSync(packageTarget)) {
        rmdir(packageTarget);
    }
    cpdir(cocosDir, packageTarget);
    fs.writeFileSync(path.join(cmhome, 'index.js'), 'Object.defineProperty(exports, "__esModule", { value: true });');
    fs.copyFileSync(path.join(installDir, 'index.d.ts'), path.join(cmhome, 'index.d.ts'));
    fs.copyFileSync(path.join(installDir, 'lib.cmkit.d.ts'), path.join(cmhome, 'lib.cmkit.d.ts'));
    fs.copyFileSync(path.join(installDir, 'lib.cocos.d.ts'), path.join(cmhome, 'lib.cocos.d.ts'));
} else {
    fs.copyFileSync(path.join(webDir, 'index.js'), path.join(cmhome, 'index.js'));
    fs.copyFileSync(path.join(installDir, 'lib.cmkit.d.ts'), path.join(cmhome, 'index.d.ts'));
}
rmdir(installDir);
rmdir(cocosDir);
rmdir(webDir);
