(function(ns) {
    'use strict';
    ns.orm._storage = cc.sys.localStorage;
    ns.log = function() {
        if (ns.debug) {
            var args = arguments;
            if (cc.sys.isNative) {
                args = [];
                for (var i = 0; i < arguments.length; i++) {
                    var ele = arguments[i];
                    args.push(typeof ele === 'object' ? JSON.stringify(ele) : ele);
                }
            }
            console.log.apply(console, args);
        }
    };
    ns.warn = function() {
        if (ns.debug) {
            var args = arguments;
            if (cc.sys.isNative) {
                args = [];
                for (var i = 0; i < arguments.length; i++) {
                    var ele = arguments[i];
                    args.push(typeof ele === 'object' ? JSON.stringify(ele) : ele);
                }
            }
            console.warn.apply(console, args);
        }
    };
    ns.Game = (function() {
        function Game() {
            var _this = this;
            cc.game.on(cc.game.EVENT_SHOW, _this.onShow, _this);
            cc.game.on(cc.game.EVENT_HIDE, _this.onHide, _this);
            this.start = function(scene) {
                _this.onInit(scene);
            };
        }
        return Game;
    })();
    ns.entry = function(apihost, debug) {
        if (ns.game) {
            throw new Error('There can only be one Game');
        }
        ns.apihost = apihost;
        ns.debug = !!debug;
        return function(target) {
            ns.game = new target();
        };
    };
    ns.color = function(hex) {
        return cc.Color.WHITE.fromHEX(hex);
    };
    Object.defineProperty(ns, 'isslim', {
        get: function() {
            var size = cc.winSize;
            return size.height / size.width > 1.78;
        },
        enumerable: true,
        configurable: true
    });
})((window.cm = window.cm || {}));
//--------------------cc extentions----------------
(function(ns, cc, dragonBones) {
    'use strict';
    ///----------cc.Node----------
    cc.Node.prototype.setBone = function(dir, name) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            ns.loadbone(dir, name)
                .then(function(data) {
                    _this.active = false;
                    var display = _this.addComponent(dragonBones.ArmatureDisplay);
                    display.dragonAsset = data[0];
                    display.dragonAtlasAsset = data[1];
                    display.armatureName = display.getArmatureNames()[0];
                    _this.active = true;
                    resolve(display);
                })
                .catch(reject);
        });
    };
    cc.Node.prototype.setRect = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
    cc.Node.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
    };
    cc.Node.prototype.capture = function() {
        var camera = this.getComponent(cc.Camera) || this.addComponent(cc.Camera);
        camera.cullingMask = 0xffffffff;
        var texture = new cc.RenderTexture();
        texture.initWithSize(this.width, this.height);
        camera.targetTexture = texture;
        camera.render();
        var data = texture.readPixels();
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var width = (canvas.width = texture.width);
        var height = (canvas.height = texture.height);
        this.removeComponent(cc.Camera);
        //render canvas
        var rowBytes = width * 4;
        for (var row = 0; row < height; row++) {
            var srow = height - 1 - row;
            var imageData = ctx.createImageData(width, 1);
            var start = srow * width * 4;
            for (var i = 0; i < rowBytes; i++) {
                imageData.data[i] = data[start + i];
            }
            ctx.putImageData(imageData, 0, row);
        }
        return canvas.toDataURL('image/png');
    };
    ///----------cc.Texture2D----------
    cc.Texture2D.prototype.base64 = function(scale) {
        var s = 1;
        if (typeof scale === 'number' && scale > 0 && scale < 1) {
            s = scale;
        }
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = this.width * s;
        canvas.height = this.height * s;
        ctx.drawImage(this.getHtmlElementObj(), 0, 0);
        return canvas.toDataURL('image/png');
    };
    cc.Sprite.prototype.setImage = function(url, placeholder, progress) {
        if (typeof url !== 'string') {
            if (typeof placeholder === 'string') {
                return this.setImage(placeholder);
            } else {
                return Promise.reject('the typeof url must be string');
            }
        }
        var _this = this;
        if (url.startsWith('http')) {
            return ns
                .loadtxe(url, progress)
                .then(function(txe) {
                    if (_this.node) {
                        _this.spriteFrame = new cc.SpriteFrame(txe);
                    }
                    return _this;
                })
                .catch(function(e) {
                    if (typeof placeholder === 'string') {
                        return _this.setImage(placeholder);
                    } else {
                        throw e;
                    }
                });
        } else {
            return ns
                .loadres(cc.Texture2D, url, progress)
                .then(function(txe) {
                    if (_this.node) {
                        _this.spriteFrame = new cc.SpriteFrame(txe);
                    }
                    return _this;
                })
                .catch(function(e) {
                    if (typeof placeholder === 'string') {
                        return _this.setImage(placeholder);
                    } else {
                        throw e;
                    }
                });
        }
    };
    cc.Sprite.prototype.setAtlas = function(dir, name, progress) {
        var _this = this;
        return ns.loadres(cc.SpriteAtlas, dir, progress).then(function(atlas) {
            var sprite = atlas.getSpriteFrame(name);
            if (_this.node && sprite) {
                _this.spriteFrame = sprite;
            }
            return _this;
        });
    };
    cc.Sprite.prototype.adjust = function(width, height) {
        if (!(this.node && this.spriteFrame)) return;
        var rect = this.spriteFrame.getRect();
        var scaleX = typeof width === 'number' && width / rect.width;
        var scaleY = typeof height === 'number' && height / rect.height;
        var scale = scaleX || scaleY;
        if (!scale) return;
        this.node.scale = (scaleX && scaleY && Math.min(scaleX, scaleY)) || scale;
    };
    ///----------dragonBones.ArmatureDisplay----------
    dragonBones.ArmatureDisplay.prototype.runani = function(name, option) {
        var _this = this;
        var opt = cc.js.mixin({ scale: 1, times: 1 }, option);
        _this.delani();
        _this._state = _this.playAnimation(name, opt.times);
        _this._state.timeScale = opt.scale;
        _this._completed = function(evt) {
            _this.delani();
            if (typeof opt.completed === 'function') {
                opt.completed.call(opt.target, evt);
            }
        };
        _this.addEventListener(dragonBones.EventObject.COMPLETE, _this._completed);
    };
    dragonBones.ArmatureDisplay.prototype.delani = function() {
        if (this._state) {
            this._state.stop();
            delete this._state;
        }
        if (this._completed) {
            this.removeEventListener(dragonBones.EventObject.COMPLETE, this._completed);
            delete this._completed;
        }
    };
})((window.cm = window.cm || {}), window.cc, window.dragonBones);
//---------------------loaders----------------------
(function(ns, cc) {
    'use strict';
    ns.loadres = function(type, url, progress) {
        return new Promise(function(resolve, reject) {
            cc.loader.loadRes(url, type, progress, function(err, asset) {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset);
                }
            });
        });
    };
    ns.loadress = function(type, urls, progress) {
        return new Promise(function(resolve, reject) {
            cc.loader.loadResArray(urls, type, progress, function(err, asset) {
                if (err) {
                    reject(err);
                } else {
                    resolve(asset);
                }
            });
        });
    };
    ns.loaddir = function(type, dir, progress) {
        return new Promise(function(resolve, reject) {
            if (!dir) {
                reject(new Error('dir can not be empty'));
                return;
            }
            cc.loader.loadResDir(dir, type, progress, function(err, assets, urls) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ assets: assets, urls: urls });
                }
            });
        });
    };
    ns.loadbone = function(dir, name) {
        return new Promise(function(resolve, reject) {
            if (!(dir && name)) {
                reject(new Error('dir or name can not be empty'));
                return;
            }
            Promise.all([
                ns.loadres(dragonBones.DragonBonesAsset, dir + '/' + name + '_ske'),
                ns.loadres(dragonBones.DragonBonesAtlasAsset, dir + '/' + name + '_tex')
            ])
                .then(resolve)
                .catch(reject);
        });
    };
    ns.loadtxe = function(url, progress) {
        return new Promise(function(resolve, reject) {
            cc.loader.load({ url: url, type: 'jpg' }, progress, function(err, txe) {
                if (err) {
                    reject(err);
                } else {
                    resolve(txe);
                }
            });
        });
    };
})((window.cm = window.cm || {}), window.cc);
//--------------------Components ----------------
(function(ns) {
    // prettier-ignore
    var __generator = (this && this.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var Button = (ns.Button = cc.Class({
        name: 'cm.Button',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Button',
            requireComponent: cc.Button
        },
        properties: {
            sound: {
                default: null,
                type: cc.AudioClip,
                tooltip: '点击音效，如果设置了sound则soundPath无效'
            },
            volume: {
                default: 1,
                range: [0, 1, 0.01],
                slide: true,
                tooltip: '点击音效的音量，范围0-1'
            },
            soundPath: {
                default: 'audios/btn_tap',
                tooltip: '点击音效文件，相对于resources/目录的路径，设置了sound则soundPath无效'
            },
            delayTime: {
                default: 0.2,
                range: [0, 5, 0.1],
                slide: true,
                tooltip: '再次触发点击事件所需要延迟的时间(单位:s)'
            }
        }
    }));
    Button.prototype.onLoad = function() {
        var _this = this;
        this.ccbtn = this.node.on('click', function() {
            if (!_this.enabledInHierarchy) return;
            if (typeof _this.onclick === 'function' && !_this.__suspend) {
                _this.__suspend = true;
                _this.scheduleOnce(function() {
                    _this.__suspend = false;
                }, _this.delayTime);
                ns.call(_this.onclick);
            }
            if (_this.sound) {
                cc.audioEngine.play(_this.sound, false, _this.volume);
            } else if (typeof _this.soundPath === 'string' && _this.soundPath.length > 0) {
                cc.loader.loadRes(_this.soundPath, cc.AudioClip, function(err, asset) {
                    if (!err) cc.audioEngine.play(asset, false, _this.volume);
                });
            }
        });
    };
    Object.defineProperty(Button.prototype, 'ccbtn', {
        get: function() {
            if (this._ccbtn) return this._ccbtn;
            this._ccbtn = this.node.getComponent(cc.Button);
            return this._ccbtn;
        },
        enumerable: true,
        configurable: true
    });
    var pop = (ns.pop = cc.Class({
        extends: cc.Component,
        name: 'cm.pop',
        ctor: function() {
            this.prefebs = {};
            this.showed = {};
            this.opqueue = [];
        },
        properties: {
            opacity: {
                default: 204,
                tooltip: '默认背景透明度'
            },
            singleColor: {
                type: cc.SpriteFrame,
                default: null,
                tooltip: '单色精灵，用于设置背景蒙层'
            },
            unknownError: {
                default: 'System Error!',
                tooltip: '当pop.error传入未知错误时显示此错误信息'
            },
            modals: [cc.Prefab]
        },
        editor: {
            menu: 'CMKit/pop'
        }
    }));
    pop.present = function(prefeb, opts) {
        if (this._self) this._self.add({ type: 'present', prefeb: prefeb, opts: opts });
    };
    pop.remind = function(msg, title, duration) {
        if (!duration) {
            duration = 1;
        }
        if (this._self) this._self.add({ type: 'remind', title: title, msg: msg, duration: duration });
    };
    pop.dismiss = function(name, finish) {
        if (!this._self) return;
        if (typeof name === 'string') {
            this._self.add({ type: 'dismiss', name: name, finish: finish });
        } else {
            this._self.add({ type: 'clear', finish: finish });
        }
    };
    pop.alert = function(msg, opts) {
        if (this._self) {
            opts = opts || {};
            opts.msg = msg;
            this._self.add({ type: 'present', prefeb: 'alert', opts: opts });
        }
    };
    pop.wait = function(msg) {
        if (this._self) this._self.add({ type: 'wait', msg: msg });
    };
    pop.idle = function() {
        if (this._self) this._self.add({ type: 'idle' });
    };
    pop.error = function(e) {
        pop.remind((e && e.message) || this._self.unknownError);
    };
    pop.prototype.onLoad = function() {
        var _this = this;
        pop._self = this;
        var canvas = cc.find('Canvas');
        this.node.setRect(canvas.x, canvas.y, canvas.width, canvas.height);
        for (var _i = 0, _a = _this.modals; _i < _a.length; _i++) {
            var prefeb = _a[_i];
            _this.prefebs[prefeb.name] = prefeb;
        }
    };
    pop.prototype.add = function(op) {
        this.opqueue.push(op);
        this.next();
    };
    pop.prototype.next = function() {
        if (this.current) return;
        this.current = this.opqueue.shift();
        if (!this.current) return;
        var _a = this.current,
            type = _a.type,
            name = _a.name,
            prefeb = _a.prefeb,
            finish = _a.finish,
            opts = _a.opts,
            title = _a.title,
            msg = _a.msg,
            duration = _a.duration;
        switch (type) {
            case 'clear':
                this.clear(finish);
                break;
            case 'dismiss':
                this.dismiss(name, finish);
                break;
            case 'present':
                this.present(prefeb, opts);
                break;
            case 'wait':
                this.wait(msg);
                break;
            case 'idle':
                this.idle();
                break;
            case 'remind':
                this.remind(title, msg, duration);
                break;
        }
    };
    pop.prototype.remind = function(title, msg, duration) {
        var _this = this;
        var modal = this.genModal('remind');
        if (!modal) {
            this.current = null;
            this.next();
            return;
        }
        var opts = { title: title, msg: msg };
        modal.onCreate(opts);
        modal.node.opacity = 0;
        modal.node.runAction(
            cc.sequence([
                cc.fadeIn(0.25),
                cc.callFunc(function() {
                    modal.onPresent(opts);
                }),
                cc.delayTime(duration),
                cc.fadeOut(0.25),
                cc.callFunc(function() {
                    _this.delete('remind');
                    _this.current = null;
                    _this.next();
                })
            ])
        );
        return modal;
    };
    pop.prototype.present = function(prefeb, opts) {
        var _this = this;
        var modal = this.genModal(prefeb);
        if (!modal) {
            this.current = null;
            this.next();
            return;
        }
        modal.onCreate(opts);
        var opacity = modal.opacity < 0 ? this.opacity : modal.opacity;
        if (modal.animator) {
            if (opacity > 0) {
                _this.genBackground(modal).runAction(cc.fadeTo(0.25, opacity));
            }
            modal.animator.opacity = 0;
            modal.animator.runAction(
                cc.sequence([
                    cc.delayTime(0.05),
                    cc.scaleTo(0, 0, 0),
                    cc.fadeIn(0),
                    cc.scaleTo(0.3, 1, 1).easing(cc.easeElasticInOut(0.6)),
                    cc.callFunc(function() {
                        modal.onPresent(opts);
                        _this.current = null;
                        _this.next();
                    })
                ])
            );
        } else {
            if (opacity > 0) {
                _this.genBackground(modal).opacity = opacity;
            }
            modal.node.opacity = 0;
            modal.node.runAction(
                cc.sequence([
                    cc.fadeIn(0.25),
                    cc.callFunc(function() {
                        modal.onPresent(opts);
                        _this.current = null;
                        _this.next();
                    })
                ])
            );
        }
        return modal;
    };
    pop.prototype.dismiss = function(name, finish) {
        var _this = this;
        var modal = name && this.showed[name];
        if (!modal) {
            ns.call(finish);
            this.current = null;
            this.next();
            return;
        }
        delete this.showed[name];
        modal.node.runAction(
            cc.sequence([
                cc.fadeOut(0.25),
                cc.callFunc(function() {
                    ns.call(finish);
                    modal.onDismiss();
                    modal.node.destroy();
                    _this.current = null;
                    _this.next();
                })
            ])
        );
    };
    pop.prototype.clear = function(finish) {
        var _this = this;
        var showed = this.showed;
        if (!showed) {
            ns.call(finish);
            this.current = null;
            this.next();
            return;
        }
        this.showed = {};
        this.node.runAction(
            cc.sequence([
                cc.fadeOut(0.25),
                cc.callFunc(function() {
                    _this.node.opacity = 255;
                    ns.call(finish);
                    for (var key in showed) {
                        var ele = showed[key];
                        ele.onDismiss();
                        ele.node.destroy();
                    }
                    _this.current = null;
                    _this.next();
                })
            ])
        );
    };
    pop.prototype.wait = function(msg) {
        var modal = this.genModal('wait');
        if (modal) {
            modal.onCreate({ msg: msg });
        }
        this.current = null;
        this.next();
        return modal;
    };
    pop.prototype.idle = function() {
        this.delete('wait');
        this.current = null;
        this.next();
    };
    pop.prototype.delete = function(name) {
        var modal = this.showed[name];
        if (modal) {
            delete this.showed[name];
            modal.onDismiss();
            modal.node.destroy();
        }
    };
    pop.prototype.genBackground = function(modal) {
        var background = new cc.Node();
        var sprite = background.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = this.singleColor;
        background.opacity = 0;
        background.color = cc.Color.BLACK;
        background.setRect(0, 0, modal.node.width, modal.node.height);
        modal.node.insertChild(background, 0);
        modal.background = background;
        return background;
    };
    pop.prototype.genModal = function(prefeb) {
        prefeb = prefeb instanceof cc.Prefab ? prefeb : this.prefebs[prefeb];
        if (!prefeb) {
            ns.warn('prefeb not found:', prefeb);
            return;
        }
        var name = prefeb.name;
        if (this.showed[name]) return;
        var node = cc.instantiate(prefeb);
        var modal = node.getComponent(ns.Modal);
        if (!modal) throw new Error('pop widget must extends from cm.Modal!!');
        this.showed[name] = modal;
        node.name = name;
        node.setRect(0, 0, this.node.width, this.node.height);
        node.zIndex = modal.priority;
        node.addComponent(cc.BlockInputEvents);
        node.addComponent(cc.Button);
        node.on('click', function() {
            ns.call(modal.onblur);
        });
        if (modal.blurquit) {
            modal.onblur = function() {
                pop.dismiss(name);
            };
        }
        modal.closeres.forEach(function(closer) {
            closer.onclick = function() {
                pop.dismiss(name);
            };
        });
        this.node.addChild(node);
        return modal;
    };

    var Modal = (ns.Modal = cc.Class({
        extends: cc.Component,
        name: 'cm.Modal',
        properties: {
            opacity: {
                default: -1,
                tooltip: '设置变暗背景透明度，若为小于0则使用pop设置的透明度'
            },
            blurquit: {
                default: false,
                tooltip: '打开时，点击变暗蒙层可以关闭弹窗,此时this.blur.onclick被设置为dismiss方法'
            },
            priority: {
                default: 0,
                tooltip: '设置模态弹窗的优先级，较高优先级的显示在上层'
            },
            animator: {
                default: null,
                type: cc.Node,
                tooltip: '指定一个节点作为弹出动画，如果为空则执行淡入动画。'
            },
            closeres: {
                default: [],
                type: [ns.Button],
                tooltip: '指定一组按钮作为关闭器，这些按钮会自动关联关闭事件'
            }
        },
        editor: {
            menu: 'CMKit/Modal'
        }
    }));
    Modal.prototype.onCreate = function(opts) {
        this.onhide = opts && opts.onhide;
    };
    Modal.prototype.onPresent = function(opts) {};
    Modal.prototype.onDismiss = function() {
        ns.call(this.onhide);
    };
    Modal.prototype.dismiss = function(finish) {
        pop.dismiss(this.node.name, finish);
    };
    var Alert = (ns.Alert = cc.Class({
        extends: ns.Modal,
        name: 'cm.Alert',
        properties: {
            priority: {
                default: 1000,
                override: true
            },
            title: cc.Label,
            message: cc.Label,
            cancel: ns.Button,
            confirm: ns.Button,
            cancelText: cc.Label,
            confirmText: cc.Label
        },
        editor: {
            menu: 'CMKit/Alert'
        }
    }));
    Alert.prototype.onLoad = function() {
        var _this = this;
        this.confirm.onclick = function() {
            return _this.dismiss(_this.confirmBlock);
        };
        if (this.cancel) {
            this.cancel.onclick = function() {
                return _this.dismiss(_this.cancelBlock);
            };
        }
    };
    Alert.prototype.onCreate = function(opts) {
        var title = opts.title,
            msg = opts.msg,
            confirm = opts.confirm,
            cancel = opts.cancel,
            onhide = opts.onhide;
        this.onhide = onhide;
        this.message && (this.message.string = msg || '');
        this.title && (this.title.string = title || '');
        if (typeof confirm === 'function') {
            this.confirmBlock = confirm;
        } else if (typeof confirm === 'string') {
            this.confirmText && confirm && (this.confirmText.string = confirm);
        } else if (typeof confirm === 'object') {
            this.confirmText && confirm.title && (this.confirmText.string = confirm.title);
            this.confirmBlock = confirm.block;
        }
        if (!cancel) return;
        if (this.cancel) {
            this.cancel.node.active = true;
            this.confirm.node.width = this.cancel.node.width;
            if (typeof cancel === 'function') {
                this.cancelBlock = cancel;
            } else if (typeof cancel === 'string') {
                this.cancelText && (this.cancelText.string = cancel);
            } else if (typeof cancel === 'object') {
                this.cancelText && cancel.title && (this.cancelText.string = cancel.title);
                this.cancelBlock = cancel.block;
            }
        }
    };
    var Remind = (ns.Remind = cc.Class({
        extends: ns.Modal,
        name: 'cm.Remind',
        properties: {
            priority: {
                default: 1001,
                override: true
            },
            title: cc.Label,
            message: cc.Label
        },
        editor: {
            menu: 'CMKit/Remind'
        }
    }));
    Remind.prototype.onCreate = function(opts) {
        var title = opts.title,
            msg = opts.msg;
        this.message && (this.message.string = msg || '');
        this.title && (this.title.string = title || '');
    };

    var Stack = (ns.Stack = cc.Class({
        extends: cc.Component,
        name: 'cm.Stack',
        ctor: function() {
            this.prefebs = {};
            this.pageStack = [];
        },
        properties: {
            pages: [cc.Prefab]
        },
        editor: CC_EDITOR && {
            menu: 'CMKit/Stack'
        }
    }));
    Object.defineProperty(Stack, 'current', {
        get: function() {
            var node = cc.find('Canvas');
            return node && node.getComponent(ns.Stack);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, 'root', {
        get: function() {
            return this._root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, 'top', {
        get: function() {
            return this.pageStack.last || this._root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, 'count', {
        get: function() {
            return this.pageStack.length;
        },
        enumerable: true,
        configurable: true
    });
    Stack.prototype.onLoad = function() {
        if (this.pages && this.pages.length > 0) {
            var _this = this;
            this.pages.forEach(function(ele) {
                return (_this.prefebs[ele.name] = ele);
            });
            this._root = this.genPage(this.pages[0].name);
            this.node.addChild(this._root.node);
            this._root.willShow();
            this._root.didShow();
        }
    };
    Stack.prototype.push = function(name, props, finish) {
        var page = this.genPage(name);
        page.props = props;
        var top = this.top;
        var width = this.node.width;
        this.pageStack.push(page);
        this.node.addChild(page.node);
        page.node.x = width;
        page.willShow();
        page.node.runAction(
            cc.sequence([
                cc.moveTo(0.25, cc.v2(0, 0)).easing(cc.easeInOut(5)),
                cc.callFunc(function() {
                    page.didShow();
                    ns.call(finish);
                })
            ])
        );
        top.willHide();
        top.node.runAction(
            cc.sequence([
                cc.moveTo(0.25, cc.v2(-width / 3, 0)).easing(cc.easeInOut(5)),
                cc.callFunc(function() {
                    top.didHide();
                    ns.call(finish);
                })
            ])
        );
    };
    Stack.prototype.pop = function() {
        var length = this.pageStack.length;
        if (length <= 0) return;
        var delta = arguments[0];
        var finish;
        if (typeof delta === 'number') {
            if (delta < 1) {
                delta = 1;
            }
            if (delta > length) {
                delta = length;
            }
            finish = arguments[1];
        } else if (typeof delta === 'function') {
            finish = delta;
            delta = 1;
        } else {
            delta = 1;
        }
        var ani = this.pageStack.pop();
        while ((delta = delta - 1) > 0) {
            var ele = this.pageStack.pop();
            ele.node.destroy();
        }
        var width = this.node.width;
        var top = this.top;
        ani.willHide();
        ani.node.runAction(
            cc.sequence([
                cc.moveTo(0.25, cc.v2(width, 0)).easing(cc.easeInOut(5)),
                cc.callFunc(function() {
                    ani.didHide();
                    ani.node.destroy();
                    ns.call(finish);
                })
            ])
        );
        top.willShow();
        top.node.runAction(
            cc.sequence([
                cc.moveTo(0.25, cc.v2(0, 0)).easing(cc.easeInOut(5)),
                cc.callFunc(function() {
                    top.didShow();
                })
            ])
        );
    };
    Stack.prototype.remove = function(page) {
        if (this.pageStack.delete(page) >= 0) {
            page.node.destroy();
        }
    };
    Stack.prototype.genPage = function(name) {
        var prefeb = this.prefebs[name];
        if (!prefeb) throw new Error('页面不存在');
        var node = cc.instantiate(prefeb);
        var page = node.getComponent(ns.SKPage);
        node.addComponent(cc.BlockInputEvents);
        if (!page) throw new Error('页面必须是 Page的子类');
        node.setRect(0, 0, this.node.width, this.node.height);
        page.stack = this;
        return page;
    };
    var SKPage = (ns.SKPage = cc.Class({
        extends: cc.Component
    }));
    SKPage.prototype.willShow = function() {};
    SKPage.prototype.didShow = function() {};
    SKPage.prototype.willHide = function() {};
    SKPage.prototype.didHide = function() {};

    var Padding = cc.Class({
        name: 'cm.Padding',
        properties: {
            head: 0,
            tail: 0
        }
    });
    var ListView = (ns.ListView = cc.Class({
        extends: cc.Component,
        name: 'cm.ListView',
        ctor: function() {
            this.lastOffsetY = 0;
            this.datas = [];
            this.items = [];
            this.padding = new Padding();
        },
        properties: {
            spacing: {
                default: 0,
                tooltip: '列表行间距'
            },
            padding: {
                default: null,
                type: Padding,
                tooltip: '列表的内边距'
            },
            itemPrefeb: {
                default: null,
                type: cc.Prefab,
                tooltip: '列表item预制文件'
            },
            itemHeight: {
                default: 132,
                tooltip: '列表item高度'
            },
            cacheCount: {
                default: 4,
                type: cc.Integer,
                slide: true,
                range: [1, 8, 1],
                tooltip: '列表上下两侧各预加载的item个数(必须为整数)'
            },
            frameCount: {
                default: 2,
                type: cc.Integer,
                slide: true,
                range: [1, 6, 1],
                tooltip: '列表每一帧最多加载的item个数(必须为整数)，优化加载速度。'
            },
            scrollView: {
                default: null,
                type: cc.ScrollView,
                tooltip: '注意请不要在ScrollView 的 content节点上增加cc.Layout组件'
            }
        },
        editor: CC_EDITOR && {
            menu: 'CMKit/ListView'
        }
    }));
    ListView.prototype.onDestroy = function() {
        this.datas = [];
        this.items = [];
    };
    ListView.prototype.onLoad = function() {
        if (!this.scrollView) {
            this.scrollView = this.node.getComponent(cc.ScrollView);
        }
        if (!this.scrollView) {
            throw new Error('cm.ListView must be mount on cc.ScrollView node or appoint scrollView property!');
        }
        this.scrollView.node.on('scrolling', this.onScrolling, this);
        this.maskHeight = this.scrollView.content.parent.getContentSize().height;
        this.maxItemCount = Math.ceil(this.maskHeight / this.itemHeight) + 1 + this.cacheCount * 2;
        this.maxTop = this.cacheCount * this.itemHeight;
        this.maxBottom = -(this.maxItemCount - this.cacheCount) * this.itemHeight;
    };
    ListView.prototype.reloadData = function(datas) {
        if (Array.isArray(datas) && datas.length > 0) {
            this.datas = datas;
            this.items = [];
            this.scrollView.content.removeAllChildren();
            this.setHeight();
            this.scrollView.scrollToTop();
            var itemCount = Math.min(datas.length, this.maxItemCount);
            this.next(this.genItems(0, itemCount), this.frameCount);
        }
    };
    ListView.prototype.pushData = function(datas) {
        if (Array.isArray(datas) && datas.length > 0) {
            this.datas.append(datas);
            this.setHeight();
            if (this.items.length < this.maxItemCount) {
                var itemCount = Math.min(datas.length, this.maxItemCount);
                this.next(this.genItems(this.items.length, itemCount), this.frameCount);
            }
        }
    };
    ListView.prototype.addNode = function(node) {
        this.scrollView.content.addChild(node);
    };
    ListView.prototype.insertNode = function(node, index) {
        this.scrollView.content.insertChild(node, index);
    };
    ListView.prototype.scrollToHead = function(time, attenuated) {
        if (this.scrollView.vertical) {
            this.scrollView.scrollToTop(time, attenuated);
        } else if (this.scrollView.horizontal) {
            this.scrollView.scrollToLeft(time, attenuated);
        }
    };
    ListView.prototype.scrollToTail = function(time, attenuated) {
        if (this.scrollView.vertical) {
            this.scrollView.scrollToBottom(time, attenuated);
        } else if (this.scrollView.horizontal) {
            this.scrollView.scrollToRight(time, attenuated);
        }
    };
    ListView.prototype.scrollToIndex = function(index, time, attenuated) {
        var offset = (this.itemHeight + this.spacing) * index;
        this.scrollToOffset(offset, time, attenuated);
    };
    ListView.prototype.scrollToOffset = function(offset, time, attenuated) {
        if (this.scrollView.vertical) {
            this.scrollView.scrollToOffset(cc.v2(0, offset), time, attenuated);
        } else if (this.scrollView.horizontal) {
            this.scrollView.scrollToOffset(cc.v2(offset, 0), time, attenuated);
        }
    };
    ListView.prototype.next = function(g, size) {
        for (var index = 0; index < size; index++) {
            if (g.next().done) {
                ns.call(this.onloaded);
                return;
            }
        }
        var _this = this;
        this.scheduleOnce(function() {
            _this.next(g, size);
        });
    };
    ListView.prototype.genItems = function(from, to) {
        var index, node, item;
        return __generator(this, function(_a) {
            switch (_a.label) {
                case 0:
                    index = from;
                    _a.label = 1;
                case 1:
                    if (!(index < to)) return [3 /*break*/, 4];
                    node = cc.instantiate(this.itemPrefeb);
                    item = node.getComponent(ns.ListItem);
                    this.scrollView.content.addChild(node);
                    item.init(this);
                    item.index = index;
                    this.items.push(item);
                    return [4 /*yield*/];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3 /*break*/, 1];
                case 4:
                    return [2 /*return*/];
            }
        });
    };
    ListView.prototype.setHeight = function() {
        var height = (this.itemHeight + this.spacing) * this.datas.length - this.spacing;
        height = height + this.padding.head + this.padding.tail;
        this.scrollView.content.height = Math.max(height, this.maskHeight);
    };
    ListView.prototype.onScrolling = function() {
        if (this.items.length < this.maxItemCount) {
            return;
        }
        if (this.datas.length === this.maxItemCount) {
            return;
        }
        var offsetY = this.scrollView.getScrollOffset().y;
        if (offsetY > this.lastOffsetY) {
            var head = this.items.first;
            if (offsetY + head.node.y - this.itemHeight / 2 > this.maxTop) {
                var index = head.index + this.items.length;
                if (index < this.datas.length) {
                    head.index = index;
                    this.items.push(this.items.shift());
                } else {
                    ns.call(this.ontail);
                }
            }
        } else {
            var head = this.items.last;
            if (offsetY + head.node.y + this.itemHeight / 2 < this.maxBottom) {
                var index = head.index - this.items.length;
                if (index >= 0) {
                    head.index = index;
                    this.items.unshift(this.items.pop());
                } else {
                    ns.call(this.onhead);
                }
            }
        }
        this.lastOffsetY = offsetY;
    };
    var ListItem = (ns.ListItem = cc.Class({
        extends: cc.Component,
        ctor: function() {
            this.__index = 0;
        }
    }));
    Object.defineProperty(ListItem.prototype, 'index', {
        get: function() {
            return this.__index;
        },
        set: function(val) {
            this.__index = val;
            if (this.list) {
                this.node.y =
                    -this.node.anchorY * this.list.itemHeight -
                    (this.list.spacing + this.list.itemHeight) * val -
                    this.list.padding.head;
                this.setData(this.list.datas[val], this.list.bind);
            }
        },
        enumerable: true,
        configurable: true
    });
    ListItem.prototype.setData = function() {};
    ListItem.prototype.init = function(list) {
        this.list = list;
    };

    var Counter = (ns.Counter = cc.Class({
        name: 'cm.Counter',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Counter'
        },
        properties: {
            label: {
                type: cc.Label,
                default: null,
                tooltip: '需要滚动效果的label'
            },
            sound: {
                default: null,
                type: cc.AudioClip,
                tooltip: '滚动时候伴随的音效，若不需要音效则无需设置'
            }
        },
        ctor: function() {
            this._value = 0;
            this._step = 0;
            this._goal = 0;
            this._stack = [];
            this._rate = cc.game.getFrameRate();
        }
    }));
    Object.defineProperty(Counter.prototype, 'digit', {
        get: function() {
            return this._goal;
        },
        set: function(val) {
            if (typeof val === 'number') {
                this._stack.push(val);
                this.next();
            } else {
                throw new Error('The digit of Counter must be number!');
            }
        },
        enumerable: true,
        configurable: true
    });
    Counter.prototype.formater = function(value) {
        return value.round().comma();
    };
    Counter.prototype.steper = function(delta) {
        if (delta < this._rate) {
            return 1;
        }
        return Math.floor(delta / this._rate);
    };
    Counter.prototype.next = function() {
        if (this._step) return;
        if (this._stack.length === 0) return;
        var goal = this._stack.shift();
        if (this._goal === goal) {
            this.next();
            return;
        }
        this._goal = goal;
        if (this._value === 0 || this._value >= this._goal) {
            this.setText(this._goal);
            this.next();
        } else {
            var delta = this._goal - this._value;
            this._step = this.steper(delta);
            if (this.sound) {
                //播放音效
                var dur = delta / (this._step * this._rate);
                if (dur < 0.3) {
                    dur = 0.3;
                }
                var sid = cc.audioEngine.play(this.sound, true, 1);
                this.scheduleOnce(function() {
                    cc.audioEngine.stop(sid);
                }, dur);
            }
        }
    };
    Counter.prototype.setText = function(val) {
        if (this._value !== val) {
            this._value = val;
            this.label.string = this.formater(val);
        }
    };
    Counter.prototype.update = function(dt) {
        if (this._step > 0 && this._goal > this._value) {
            var value = this._value + this._step;
            if (value > this._goal) {
                value = this._goal;
            }
            this.setText(value);
            if (this._value === this._goal) {
                this._step = 0;
                this.next();
            }
        }
    };

    var Shadow = (ns.Shadow = cc.Class({
        name: 'cm.Shadow',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Shadow'
        },
        properties: {
            color: {
                default: cc.Color.WHITE,
                tooltip: '阴影的颜色'
            },
            offset: {
                default: cc.v2(2, -2),
                tooltip: '阴影的偏移量'
            },
            target: {
                type: cc.Label,
                default: null,
                tooltip: '需要添加阴影的Label，默认查询当前节点上的cc.Label'
            }
        }
    }));
    Shadow.prototype.onLoad = function() {
        var target = this.target || this.node.getComponent(cc.Label);
        if (!target) {
            cm.warn('Shadow target must be  a cc.Label Node or mount on a cc.Label!!');
            return;
        }
        this.label.string = target.string;
    };
    Object.defineProperty(Shadow.prototype, 'label', {
        get: function() {
            if (this._label) return this._label;
            var target = this.target || this.node.getComponent(cc.Label);
            if (!target) {
                cm.warn('Shadow target must be  a cc.Label Node or mount on a cc.Label!!');
                return;
            }
            var node = new cc.Node();
            var label = node.addComponent(cc.Label);
            label.font = target.font;
            label.fontSize = target.fontSize;
            label.lineHeight = target.lineHeight;
            label.overflow = target.overflow;
            label.horizontalAlign = target.horizontalAlign;
            label.verticalAlign = target.verticalAlign;
            node.x = -this.offset.x;
            node.y = -this.offset.y;
            if (label.overflow === cc.Label.Overflow.SHRINK) {
                node.width = target.node.width;
                node.height = target.node.height;
            }
            node.color = target.node.color;
            target.node.color = this.color;
            target.node.addChild(node);
            this._label = label;
            return label;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shadow.prototype, 'string', {
        get: function() {
            return this.label && this.label.string;
        },
        set: function(val) {
            var target = this.target || this.node.getComponent(cc.Label);
            if (target) {
                this.label.string = val;
                target.string = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    var Corner = (ns.Corner = cc.Class({
        name: 'cm.Corner',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Corner',
            requireComponent: cc.Mask
        },
        properties: {
            _radius: 0,
            radius: {
                get: function() {
                    return this._radius;
                },
                set: function(value) {
                    this._radius = Math.min(this.node.width / 2, this.node.height / 2, Math.max(0, value));
                    var mask = this.node.getComponent(cc.Mask);
                    if (mask) {
                        mask._updateGraphics();
                    }
                },
                tooltip: '圆角半径'
            }
        }
    }));
    var _updateGraphics = cc.Mask.prototype._updateGraphics;
    cc.Mask.prototype._updateGraphics = function() {
        var corner = this.node.getComponent(Corner);
        if (corner && corner.radius) {
            var node = this.node;
            var graphics = this._graphics;
            graphics.clear(false);
            var width = node._contentSize.width;
            var height = node._contentSize.height;
            var x = -width * node._anchorPoint.x;
            var y = -height * node._anchorPoint.y;
            graphics.roundRect(x, y, width, height, corner.radius);
            if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
                graphics.stroke();
            } else {
                graphics.fill();
            }
        } else {
            _updateGraphics.call(this);
        }
    };

    var Wrapper = (ns.Wrapper = cc.Class({
        name: 'cm.Wrapper',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Wrapper'
        },
        properties: {
            label: cc.Label,
            sprite: cc.Sprite
        }
    }));
    Object.defineProperty(Wrapper.prototype, 'text', {
        get: function() {
            return this.label && this.label.string;
        },
        set: function(val) {
            this.label && (this.label.string = val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wrapper.prototype, 'image', {
        get: function() {
            return this.sprite && this.sprite.spriteFrame;
        },
        set: function(val) {
            this.sprite && (this.sprite.spriteFrame = val);
        },
        enumerable: true,
        configurable: true
    });
    Wrapper.prototype.setImage = function(url, placeholder, progress) {
        if (this.sprite) {
            this.sprite.setImage(url, placeholder, progress);
        }
    };
})(window.cm || (window.cm = {}));
