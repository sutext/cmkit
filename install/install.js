var fs = require('fs');
var path = require('path');
var cmhome = path.join(__dirname, '..');
if (!fs.existsSync(path.join(cmhome, '../../package.json'))) {
    console.log('is not in local project dir! no need install!');
    return;
}
function cpdir(src, dist) {
    if (!fs.existsSync(src)) {
        throw new Error('The src:(' + src + ') dir not exist!');
    }
    if (!fs.statSync(src).isDirectory()) {
        throw new Error('The src:(' + src + ') must be directory!');
    }
    if (fs.existsSync(dist)) {
        throw new Error('The dist:(' + dist + ') dir already exist!');
    }
    function cp(s, d) {
        fs.mkdirSync(d);
        var files = fs.readdirSync(s);
        files.forEach(function(file) {
            var srcFile = path.join(s, file);
            var distFile = path.join(d, file);
            if (fs.statSync(srcFile).isDirectory()) {
                cp(srcFile, distFile);
            } else {
                fs.copyFileSync(srcFile, distFile);
            }
        });
    }
    cp(src, dist);
}
var rmdir = function(src) {
    if (!fs.existsSync(src)) {
        throw new Error('The src:(' + src + ') dir not exist!');
    }
    if (!fs.statSync(src).isDirectory()) {
        throw new Error('The src:(' + src + ') must be directory!');
    }
    function rm(dir) {
        var files = [];
        if (fs.existsSync(dir)) {
            files = fs.readdirSync(dir);
            files.forEach(function(file) {
                var sub = path.join(dir, file);
                if (fs.statSync(sub).isDirectory()) {
                    rm(sub);
                } else {
                    fs.unlinkSync(sub);
                }
            });
            fs.rmdirSync(dir);
        }
    }
    rm(src);
};
var installDir = path.join(cmhome, 'install');
var cocosDir = path.join(cmhome, 'cocos');
var egretDir = path.join(cmhome, 'egret');
var webDir = path.join(cmhome, 'web');

if (
    fs.existsSync(path.join(cmhome, '../../project.json')) &&
    fs.existsSync(path.join(cmhome, '../../settings/project.json')) &&
    fs.existsSync(path.join(cmhome, '../../assets'))
) {
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
    fs.copyFileSync(path.join(installDir, 'lib.cocos.d.ts'), path.join(cmhome, 'index.d.ts'));
    fs.copyFileSync(path.join(installDir, 'lib.web.d.ts'), path.join(cmhome, 'lib.web.d.ts'));
    fs.copyFileSync(path.join(installDir, 'lib.creator.d.ts'), path.join(cmhome, 'lib.creator.d.ts'));
} else if (fs.existsSync(path.join(cmhome, '../../egretProperties.json'))) {
    var propPath = path.join(cmhome, '../../egretProperties.json');
    var prop = require(propPath);
    var mod = prop.modules.find(function(ele) {
        return ele.name === 'cmkit';
    });
    if (mod) {
        mod.path = './libs/cmkit';
    } else {
        prop.modules.push({ name: 'cmkit', path: './libs/cmkit' });
    }
    fs.writeFileSync(propPath, JSON.stringify(prop, null, 4));
    var libsDir = path.join(cmhome, '../../libs');
    var libTarget = path.join(libsDir, 'cmkit');
    if (!fs.existsSync(libsDir)) {
        fs.mkdirSync(libsDir);
    }
    if (fs.existsSync(libTarget)) {
        rmdir(libTarget);
    }
    cpdir(egretDir, libTarget);
    fs.copyFileSync(path.join(installDir, 'lib.egret.d.ts'), path.join(libTarget, 'cmkit.d.ts'));
    fs.copyFileSync(path.join(installDir, 'lib.web.d.ts'), path.join(libTarget, 'lib.web.d.ts'));
} else {
    fs.copyFileSync(path.join(webDir, 'index.js'), path.join(cmhome, 'index.js'));
    fs.copyFileSync(path.join(installDir, 'lib.web.d.ts'), path.join(cmhome, 'index.d.ts'));
}
rmdir(installDir);
rmdir(cocosDir);
rmdir(webDir);
rmdir(egretDir);
