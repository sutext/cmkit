rm -rf egret
rm -rf web
mkdir egret
mkdir web
uglifyjs src/cmkit.js src/egret.js -o egret/cmkit.js 
uglifyjs src/cmkit.js src/egret.js -c -m -o egret/cmkit.min.js 
uglifyjs src/cmkit.js src/cocos.js -c -m -o cocos/assets/cmkit.js
uglifyjs src/module.js src/cmkit.js -c -m -o web/index.js 