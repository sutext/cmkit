(function (ns) {
    "use strict";
    ns.orm._storage = cc.sys.localStorage;
    ns.log = function () {
        if (ns.debug) {
            var args = arguments;
            if (cc.sys.isNative) {
                args = [];
                for (var i = 0; i < arguments.length; i++) {
                    var ele = arguments[i];
                    args.push(typeof ele === 'object' ? JSON.stringify(ele) : ele);
                }
            }
            console.log.apply(console, args)
        }
    }
    ns.warn = function () {
        if (ns.debug) {
            var args = arguments;
            if (cc.sys.isNative) {
                args = [];
                for (var i = 0; i < arguments.length; i++) {
                    var ele = arguments[i];
                    args.push(typeof ele === 'object' ? JSON.stringify(ele) : ele);
                }
            }
            console.warn.apply(console, args)
        }
    }
    ns.Game = (function () {
        function Game() {
            var _this = this;
            cc.game.on(cc.game.EVENT_SHOW, _this.onShow, _this);
            cc.game.on(cc.game.EVENT_HIDE, _this.onHide, _this);
            this.start = function (scene) {
                _this.onInit(scene);
            }
        }
        return Game;
    })();
    ns.entry = function (apihost, debug) {
        if (ns.game) {
            throw new Error('There can only be one Game');
        }
        ns.apihost = apihost;
        ns.debug = !!debug;
        return function (target) {
            ns.game = new target();
        };
    };
    ns.color = function (hex) {
        return cc.Color.WHITE.fromHEX(hex);
    }
    Object.defineProperty(ns, 'isslim', {
        get: function () {
            var size = cc.winSize;
            return size.height / size.width > 1.78;
        },
        enumerable: true,
        configurable: true
    });
})(window.cm = (window.cm || {}));
//--------------------cc extentions----------------
(function (ns, cc, dragonBones) {
    "use strict";
    var func = cc.Button.prototype._onTouchEnded;
    cc.Button.prototype._onTouchEnded = function (evt) {
        var _this = this;
        func.call(_this, evt);
        if (_this.interactable && _this.enabledInHierarchy) {
            if (!_this.__suspend) {
                _this.__suspend = true;
                _this.scheduleOnce(function () { _this.__suspend = false }, 0.2);
                ns.call(_this.onclick);
            }
            if (typeof _this.clickSound === 'string' && _this.clickSound.length > 0) {
                cc.loader.loadRes('audios/' + _this.clickSound, cc.AudioClip, function (err, asset) {
                    if (!err) cc.audioEngine.play(asset, false, 1);
                })
            }
        }
    };
    cc.Button.prototype.clickSound = 'btn_tap';
    ///----------cc.Node----------
    cc.Node.prototype.setBone = function (dir, name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            ns.loadbone(dir, name).then(function (data) {
                _this.active = false;
                var display = _this.addComponent(dragonBones.ArmatureDisplay);
                display.dragonAsset = data[0];
                display.dragonAtlasAsset = data[1];
                display.armatureName = display.getArmatureNames()[0];
                _this.active = true;
                resolve(display);
            }).catch(reject);
        });
    };
    cc.Node.prototype.setRect = function (x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    };
    cc.Node.prototype.setSize = function (width, height) {
        this.width = width
        this.height = height
    };
    cc.Node.prototype.capture = function () {
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
        this.removeComponent(cc.Camera)
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
    cc.Texture2D.prototype.base64 = function (scale) {
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
    cc.Sprite.prototype.setImage = function (url, progress) {
        if (typeof url !== 'string') return
        var _this = this
        if (url.startsWith('http')) {
            return ns.loadtxe(url, progress).then(function (txe) {
                if (_this.node) {
                    _this.spriteFrame = new cc.SpriteFrame(txe)
                }
                return _this
            })
        } else {
            return ns.loadres(cc.Texture2D, url, progress).then(function (txe) {
                if (_this.node) {
                    _this.spriteFrame = new cc.SpriteFrame(txe)
                }
                return _this
            })
        }
    }
    cc.Sprite.prototype.setAtlas = function (dir, name, progress) {
        var _this = this;
        if (CC_DEV) {
            return ns.loadres(cc.Texture2D, dir + '/' + name, progress).then(function (txe) {
                if (_this.node) {
                    _this.spriteFrame = new cc.SpriteFrame(txe);
                    return _this;
                }
                return _this;
            })
        } else {
            return ns.loadres(cc.SpriteAtlas, dir + '/AutoAtlas', progress).then(function (atlas) {
                var sprite = atlas.getSpriteFrame(name);
                if (_this.node && sprite) {
                    _this.spriteFrame = sprite;
                }
                return _this;
            })
        }
    }
    cc.Sprite.prototype.adjust = function (width, height) {
        if (!(this.node && this.spriteFrame)) return;
        var rect = this.spriteFrame.getRect();
        var scaleX = typeof width === 'number' && width / rect.width;
        var scaleY = typeof height === 'number' && height / rect.height;
        var scale = scaleX || scaleY;
        if (!scale) return;
        this.node.scale = scaleX && scaleY && Math.min(scaleX, scaleY) || scale
    }
    ///----------dragonBones.ArmatureDisplay----------
    dragonBones.ArmatureDisplay.prototype.runani = function (name, option) {
        var _this = this;
        var opt = cc.js.mixin({ scale: 1, times: 1 }, option);
        _this.delani();
        _this._state = _this.playAnimation(name, opt.times);
        _this._state.timeScale = opt.scale;
        _this._completed = function (evt) {
            _this.delani();
            if (typeof opt.completed === 'function') {
                opt.completed.call(opt.target, evt)
            }
        };
        _this.addEventListener(dragonBones.EventObject.COMPLETE, _this._completed)
    };
    dragonBones.ArmatureDisplay.prototype.delani = function () {
        if (this._state) {
            this._state.stop();
            delete this._state;
        }
        if (this._completed) {
            this.removeEventListener(dragonBones.EventObject.COMPLETE, this._completed);
            delete this._completed;
        }
    };
})(window.cm = (window.cm || {}), window.cc, window.dragonBones);
//---------------------loaders----------------------
(function (ns, cc) {
    "use strict";
    ns.loadres = function (type, url, progress) {
        return new Promise(function (resolve, reject) {
            cc.loader.loadRes(url, type, progress, function (err, asset) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(asset);
                }
            });
        });
    };
    ns.loadress = function (type, urls, progress) {
        return new Promise(function (resolve, reject) {
            cc.loader.loadResArray(urls, type, progress, function (err, asset) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(asset);
                }
            });
        });
    };
    ns.loaddir = function (type, dir, progress) {
        return new Promise(function (resolve, reject) {
            if (!dir) {
                reject(new Error('dir can not be empty'));
                return;
            }
            cc.loader.loadResDir(dir, type, progress, function (err, assets, urls) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ assets: assets, urls: urls });
                }
            });
        });
    };
    ns.loadclip = function (dir, progress) {
        return ns.loaddir(cc.SpriteFrame, dir, progress)
            .then(function (value) {
                if (Array.isArray(value.assets) && value.assets.length > 0) {
                    value.assets.sort(function (a, b) {
                        return a.name > b.name ? 1 : -1;
                    });
                    var clip = cc.AnimationClip.createWithSpriteFrames(value.assets, value.assets.length);
                    clip.wrapMode = cc.WrapMode.Loop;
                    return clip;
                } else {
                    throw new Error('resource not found');
                }
            })
    }
    ns.loadbone = function (dir, name, progress) {
        return new Promise(function (resolve, reject) {
            if (!(dir && name)) {
                reject(new Error('dir or name can not be empty'));
                return;
            }
            Promise.all([
                ns.loadres(dragonBones.DragonBonesAsset, dir + "/" + name + "_ske"),
                ns.loadres(dragonBones.DragonBonesAtlasAsset, dir + "/" + name + "_tex")
            ]).then(resolve).catch(reject);
        });
    };
    ns.loadtxe = function (url, progress) {
        return new Promise(function (resolve, reject) {
            cc.loader.load({ url: url, type: 'jpg' }, progress, function (err, txe) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(txe);
                }
            });
        });
    };
})(window.cm = (window.cm || {}), window.cc);
//--------------------Components ----------------
(function (ns) {
    var pop = ns.pop = cc.Class({
        extends: cc.Component,
        name: 'cm.pop',
        ctor: function () {
            this.prefebs = {}
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
            modals: [cc.Prefab],
        },
        editor: {
            menu: 'CMKit/pop',
        },
    });
    pop.present = function (prefeb, opts) {
        if (this._self) this._self.add({ type: 'present', prefeb: prefeb, opts: opts });
    };
    pop.remind = function (msg, title, duration) {
        if (!duration) { duration = 1; }
        if (this._self) this._self.add({ type: 'remind', title: title, msg: msg, duration: duration });
    };
    pop.dismiss = function (name, finish) {
        if (!this._self) return;
        if (typeof name === 'string') {
            this._self.add({ type: 'dismiss', name: name, finish: finish });
        }
        else {
            this._self.add({ type: 'clear', finish: finish });
        }
    };
    pop.alert = function (msg, opts) {
        if (this._self) {
            opts = opts || {}
            opts.msg = msg
            this._self.add({ type: 'present', prefeb: 'alert', opts: opts });
        }
    };
    pop.wait = function (msg) {
        if (this._self)
            this._self.add({ type: 'wait', msg: msg });
    };
    pop.idle = function () {
        if (this._self)
            this._self.add({ type: 'idle' });
    };
    pop.error = function (e) {
        pop.remind(e && e.message || this._self.unknownError)
    }
    pop.prototype.onLoad = function () {
        var _this = this;
        pop._self = this;
        var canvas = cc.find('Canvas');
        this.node.setRect(canvas.x, canvas.y, canvas.width, canvas.height);
        for (var _i = 0, _a = _this.modals; _i < _a.length; _i++) {
            var prefeb = _a[_i];
            _this.prefebs[prefeb.name] = prefeb;
        }
    };
    pop.prototype.add = function (op) {
        this.opqueue.push(op);
        this.next();
    };
    pop.prototype.next = function () {
        if (this.current) return;
        this.current = this.opqueue.shift();
        if (!this.current) return;
        var _a = this.current, type = _a.type, name = _a.name, prefeb = _a.prefeb, finish = _a.finish, opts = _a.opts, title = _a.title, msg = _a.msg, duration = _a.duration;
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
    pop.prototype.remind = function (title, msg, duration) {
        var _this = this;
        var modal = this.genModal('remind');
        if (!modal) {
            this.current = null;
            this.next();
            return;
        }
        var opts = { title: title, msg: msg };
        modal.onCreate(opts)
        modal.node.opacity = 0;
        modal.node.runAction(cc.sequence([
            cc.fadeIn(0.25),
            cc.callFunc(function () { modal.onPresent(opts) }),
            cc.delayTime(duration),
            cc.fadeOut(0.25),
            cc.callFunc(function () {
                _this.delete('remind');
                _this.current = null;
                _this.next();
            })
        ]));
        return modal;
    };
    pop.prototype.present = function (prefeb, opts) {
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
            modal.animator.scale = 0;
            modal.animator.runAction(cc.sequence([
                cc.scaleTo(0.3, 1, 1).easing(cc.easeElasticInOut(0.6)),
                cc.callFunc(function () {
                    modal.onPresent(opts);
                    _this.current = null;
                    _this.next();
                })
            ]));
        } else {
            if (opacity > 0) {
                _this.genBackground(modal).opacity = opacity;
            }
            modal.node.opacity = 0;
            modal.node.runAction(cc.sequence([
                cc.fadeIn(0.25),
                cc.callFunc(function () {
                    modal.onPresent(opts);
                    _this.current = null;
                    _this.next();
                })
            ]));
        }
        return modal;
    };
    pop.prototype.dismiss = function (name, finish) {
        var _this = this;
        var modal = name && this.showed[name];
        if (!modal) {
            ns.call(finish);
            this.current = null;
            this.next();
            return;
        }
        delete this.showed[name];
        modal.node.runAction(cc.sequence([cc.fadeOut(0.25), cc.callFunc(function () {
            ns.call(finish);
            modal.onDismiss();
            modal.node.destroy();
            _this.current = null;
            _this.next();
        })]));
    };
    pop.prototype.clear = function (finish) {
        var _this = this;
        var showed = this.showed;
        if (!showed) {
            ns.call(finish);
            this.current = null;
            this.next();
            return;
        }
        this.showed = {};
        this.node.runAction(cc.sequence([cc.fadeOut(0.25), cc.callFunc(function () {
            _this.node.opacity = 255;
            ns.call(finish);
            for (var key in showed) {
                var ele = showed[key];
                ele.onDismiss();
                ele.node.destroy();
            }
            _this.current = null;
            _this.next();
        })]));
    };
    pop.prototype.wait = function (msg) {
        var modal = this.genModal('wait');
        if (modal) {
            modal.onCreate({ msg: msg });
        }
        this.current = null;
        this.next();
        return modal;
    };
    pop.prototype.idle = function () {
        this.delete('wait');
        this.current = null;
        this.next();
    };
    pop.prototype.delete = function (name) {
        var modal = this.showed[name];
        if (modal) {
            delete this.showed[name];
            modal.onDismiss();
            modal.node.destroy();
        }
    };
    pop.prototype.genBackground = function (modal) {
        var background = new cc.Node();
        var sprite = background.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.spriteFrame = this.singleColor;
        background.opacity = 0;
        background.color = cc.Color.BLACK;
        background.setRect(0, 0, modal.node.width, modal.node.height);
        modal.node.insertChild(background, 0);
        modal.background = background
        return background;
    }
    pop.prototype.genModal = function (prefeb) {
        prefeb = (prefeb instanceof cc.Prefab ? prefeb : this.prefebs[prefeb]);
        if (!prefeb) {
            ns.warn('prefeb not found:', prefeb);
            return;
        }
        var name = prefeb.name
        if (this.showed[name]) return;
        var node = cc.instantiate(prefeb);
        var modal = node.getComponent(ns.Modal)
        if (!modal) throw new Error('pop widget must extends from cm.Modal!!')
        this.showed[name] = modal;
        node.name = name;
        node.setRect(0, 0, this.node.width, this.node.height);
        node.zIndex = modal.priority;
        node.addComponent(cc.BlockInputEvents);
        var blur = node.addComponent(cc.Button);
        blur.clickSound = '';
        modal.blur = blur;
        if (modal.blurquit) {
            blur.onclick = function () { pop.dismiss(name); };
        }
        modal.closeres.forEach(function (closer) {
            closer.onclick = function () { pop.dismiss(name) }
        })
        this.node.addChild(node);
        return modal;
    };

    var Modal = ns.Modal = cc.Class({
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
                type: [cc.Button],
                tooltip: '指定一组按钮作为关闭器，这些按钮会自动关联关闭事件'
            },
        },
        editor: {
            menu: 'CMKit/Modal',
        },
    });
    Modal.prototype.onCreate = function (opts) {
        this.onhide = opts && opts.onhide;
    }
    Modal.prototype.onPresent = function (opts) { }
    Modal.prototype.onDismiss = function () {
        ns.call(this.onhide);
    }
    Modal.prototype.dismiss = function (finish) {
        pop.dismiss(this.node.name, finish)
    }
    var Alert = ns.Alert = cc.Class({
        extends: ns.Modal,
        name: 'cm.Alert',
        properties: {
            priority: {
                default: 1000,
                override: true,
            },
            title: cc.Label,
            message: cc.Label,
            cancel: cc.Button,
            confirm: cc.Button,
            cancelText: cc.Label,
            confirmText: cc.Label,
        },
        editor: {
            menu: 'CMKit/Alert',
        },
    });
    Alert.prototype.onLoad = function () {
        var _this = this;
        this.confirm.onclick = function () { return _this.dismiss(_this.confirmBlock); };
        if (this.cancel) {
            this.cancel.onclick = function () { return _this.dismiss(_this.cancelBlock); };
        }
    };
    Alert.prototype.onCreate = function (opts) {
        var title = opts.title, msg = opts.msg, confirm = opts.confirm, cancel = opts.cancel, onhide = opts.onhide;
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
    var Remind = ns.Remind = cc.Class({
        extends: ns.Modal,
        name: 'cm.Remind',
        properties: {
            priority: {
                default: 1001,
                override: true,
            },
            title: cc.Label,
            message: cc.Label,
        },
        editor: {
            menu: 'CMKit/Remind',
        },
    });
    Remind.prototype.onCreate = function (opts) {
        var title = opts.title, msg = opts.msg;
        this.message && (this.message.string = msg || '');
        this.title && (this.title.string = title || '');
    };

    var Stack = ns.Stack = cc.Class({
        extends: cc.Component,
        name: 'cm.Stack',
        ctor: function () {
            this.prefebs = {};
            this.pageStack = [];
        },
        properties: {
            pages: [cc.Prefab],
        },
        editor: CC_EDITOR && {
            menu: 'CMKit/Stack',
        },
    });
    Object.defineProperty(Stack, "current", {
        get: function () {
            var node = cc.find('Canvas');
            return node && node.getComponent(ns.Stack);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, "root", {
        get: function () {
            return this._root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, "top", {
        get: function () {
            return this.pageStack.last || this._root;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Stack.prototype, "count", {
        get: function () {
            return this.pageStack.length;
        },
        enumerable: true,
        configurable: true
    });
    Stack.prototype.onLoad = function () {
        if (this.pages && this.pages.length > 0) {
            var _this = this;
            this.pages.forEach(function (ele) { return _this.prefebs[ele.name] = ele; });
            this._root = this.genPage(this.pages[0].name);
            this.node.addChild(this._root.node);
            this._root.willShow();
            this._root.didShow();
        }
    };
    Stack.prototype.push = function (name, finish) {
        var page = this.genPage(name);
        var top = this.top;
        var width = this.node.width;
        this.pageStack.push(page);
        this.node.addChild(page.node);
        page.node.x = width;
        page.willShow();
        page.node.runAction(cc.sequence([
            cc.moveTo(0.25, cc.v2(0, 0)).easing(cc.easeInOut(5)),
            cc.callFunc(function () {
                page.didShow();
                ns.call(finish);
            })
        ]));
        top.willHide();
        top.node.runAction(cc.sequence([
            cc.moveTo(0.25, cc.v2(-width / 3, 0)).easing(cc.easeInOut(5)),
            cc.callFunc(function () {
                top.didHide();
                ns.call(finish);
            })
        ]));
    };
    Stack.prototype.pop = function () {
        var length = this.pageStack.length;
        if (length <= 0) return;
        var delta = arguments[0];
        var finish;
        if (typeof delta === 'number') {
            if (delta < 1) {
                delta = 1
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
        ani.node.runAction(cc.sequence([
            cc.moveTo(0.25, cc.v2(width, 0)).easing(cc.easeInOut(5)),
            cc.callFunc(function () {
                ani.didHide();
                ani.node.destroy();
                ns.call(finish);
            })
        ]));
        top.willShow();
        top.node.runAction(cc.sequence([
            cc.moveTo(0.25, cc.v2(0, 0)).easing(cc.easeInOut(5)),
            cc.callFunc(function () {
                top.didShow();
            })
        ]));
    };
    Stack.prototype.genPage = function (name) {
        var prefeb = this.prefebs[name];
        if (!prefeb) throw new Error('页面不存在');
        var node = cc.instantiate(prefeb);
        var page = node.getComponent(ns.SKPage);
        if (!page) throw new Error('页面必须是 Page的子类');
        node.setRect(0, 0, this.node.width, this.node.height);
        page.stack = this;
        return page;
    };
    var SKPage = ns.SKPage = cc.Class({
        extends: cc.Component
    });
    SKPage.prototype.willShow = function () { }
    SKPage.prototype.didShow = function () { }
    SKPage.prototype.willHide = function () { }
    SKPage.prototype.didHide = function () { }

    var Counter = ns.Counter = cc.Class({
        name: 'cm.Counter',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Counter',
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
        ctor: function () {
            this._value = 0;
            this._step = 0;
            this._goal = 0;
            this._stack = [];
            this._rate = cc.game.getFrameRate();
        }
    });
    Object.defineProperty(Counter.prototype, "digit", {
        get: function () {
            return this._goal;
        },
        set: function (val) {
            if (typeof val === 'number') {
                this._stack.push(val);
                this.next();
            } else {
                throw new Error('The digit of Counter must be number!')
            }
        },
        enumerable: true,
        configurable: true
    });
    Counter.prototype.formater = function (value) {
        return value.round(2).comma();
    };
    Counter.prototype.steper = function (delta) {
        if (delta < this._rate) {
            return 1;
        }
        return Math.floor(delta / this._rate);
    };
    Counter.prototype.next = function () {
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
            if (this.sound) {//播放音效
                var dur = delta / (this._step * this._rate);
                if (dur < 0.3) { dur = 0.3 }
                var sid = cc.audioEngine.play(this.sound, true, 1);
                this.scheduleOnce(function () {
                    cc.audioEngine.stop(sid);
                }, dur)
            }
        }
    };
    Counter.prototype.setText = function (val) {
        if (this._value !== val) {
            this._value = val;
            this.label.string = this.formater(val);
        }
    };
    Counter.prototype.update = function (dt) {
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

    var Shadow = ns.Shadow = cc.Class({
        name: 'cm.Shadow',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Shadow',
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
            },
        },
    });
    Shadow.prototype.onLoad = function () {
        var target = this.target || this.node.getComponent(cc.Label);
        if (!target) {
            cm.warn('Shadow target must be  a cc.Label Node or mount on a cc.Label!!')
            return;
        };
        this.label.string = target.string;
    }
    Object.defineProperty(Shadow.prototype, "label", {
        get: function () {
            if (this._label) return this._label;
            var target = this.target || this.node.getComponent(cc.Label);
            if (!target) {
                cm.warn('Shadow target must be  a cc.Label Node or mount on a cc.Label!!')
                return;
            };
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
            node.color = this.node.color;
            this.node.color = this.color;
            this.node.addChild(node);
            this._label = label;
            return label;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shadow.prototype, "string", {
        get: function () {
            return this.label && this.label.string;
        },
        set: function (val) {
            var target = this.target || this.node.getComponent(cc.Label)
            if (target) {
                this.label.string = val;
                target.string = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    var Corner = ns.Corner = cc.Class({
        name: 'cm.Corner',
        extends: cc.Component,
        editor: {
            menu: 'CMKit/Corner',
            requireComponent: cc.Mask,
        },
        properties: {
            _radius: 0,
            radius: {
                get: function () {
                    return this._radius;
                },
                set: function (value) {
                    this._radius = Math.min(this.node.width / 2, this.node.height / 2, Math.max(0, value));
                    var mask = this.node.getComponent(cc.Mask);
                    if (mask) {
                        mask._updateGraphics();
                    }
                },
                tooltip: '圆角半径'
            }
        },
    });
    var _updateGraphics = cc.Mask.prototype._updateGraphics;
    cc.Mask.prototype._updateGraphics = function () {
        var corner = this.node.getComponent(Corner)
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
            }
            else {
                graphics.fill();
            }
        } else {
            _updateGraphics.call(this);
        }
    }
})(window.cm || (window.cm = {}));