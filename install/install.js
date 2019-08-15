var fs = require('fs');
var baseDir = process.cwd();
if (!fs.existsSync(`${baseDir}/../../package.json`)) {
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
var typesDir = baseDir + '/../@types';
var typesTarget = typesDir + '/cmkit';
var installDir = baseDir + '/install';
if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir);
}
if (!fs.existsSync(typesTarget)) {
    fs.mkdirSync(typesTarget);
}
if (fs.existsSync(`${baseDir}/../../project.json`) && fs.existsSync(`${baseDir}/../../assets`)) {
    var packagesDir = `${baseDir}/../../packages`;
    var packageTarget = packagesDir + '/cmkit';
    if (!fs.existsSync(packagesDir)) {
        fs.mkdirSync(packagesDir);
    }
    if (fs.existsSync(packageTarget)) {
        rmdir(packageTarget);
    }
    cpdir(baseDir + `/cocos`, packageTarget);
    fs.copyFileSync(installDir + '/index.d.ts', typesTarget + '/index.d.ts');
    fs.copyFileSync(installDir + '/lib.cmkit.d.ts', typesTarget + '/lib.cmkit.d.ts');
    fs.copyFileSync(installDir + '/lib.cocos.d.ts', typesTarget + '/lib.cocos.d.ts');
} else {
    fs.copyFileSync(installDir + '/lib.cmkit.d.ts', typesTarget + '/index.d.ts');
}
rmdir(baseDir + '/install');
rmdir(baseDir + '/cocos');
