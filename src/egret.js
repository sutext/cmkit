(function() {
    egret.DisplayObject.prototype.setRect = function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    };
    egret.DisplayObject.prototype.setSize = function(width, height) {
        this.width = width;
        this.height = height;
    };
    egret.DisplayObject.prototype.setEdge = function(edge) {
        if (typeof edge === 'number') {
            this.top = this.left = this.bottom = this.right = 0;
            return;
        } else {
            for (var key in edge) {
                var val = edge[key];
                if (typeof val === 'number') {
                    this[key] = val;
                }
            }
        }
    };
    eui.Image.prototype.adjust = function() {
        if (!this.texture || arguments.length === 0) return;
        var texsize = { width: this.texture.textureWidth, height: this.texture.textureHeight };
        if (!texsize.width || !texsize.height) return;
        var sizeOrBoth = arguments[0];
        var width = sizeOrBoth;
        var height = sizeOrBoth;
        if (typeof sizeOrBoth === 'object') {
            width = sizeOrBoth.width;
            height = sizeOrBoth.height;
        } else if (typeof arguments[1] === 'number') {
            height = arguments[1];
        }
        var scaleX = typeof width === 'number' && width / texsize.width;
        var scaleY = typeof height === 'number' && height / texsize.height;
        var scale = scaleX || scaleY;
        if (!scale) return;
        scale = (scaleX && scaleY && Math.min(scaleX, scaleY)) || scale;
        this.width = texsize.width * scale;
        this.height = texsize.height * scale;
    };
})();
(function(ns) {
    var Button = (function(_super) {
        ns.__extends(Button, _super);
        function Button() {
            _super && _super.apply(this, arguments);
            this._delay = 200;
            this.quiet = false;
            this.audio = RES.getRes(Button.sound);
            this.hostComponentKey = 'cm.Button';
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClicked, this);
        }
        return Button;
    })(eui.Button);
    Button.quiet = false;
    Button.sound = 'btn_tap_mp3';
    Button.prototype.onClicked = function() {
        if (this.__suspend) return;
        var _this = this;
        _this.__suspend = true;
        setTimeout(function() {
            _this.__suspend = false;
        }, _this._delay);
        ns.call(_this.onclick);
        if (Button.quiet || _this.quiet) return;
        if (_this.audio) {
            _this.audio.play(0, 1);
        }
    };
    Object.defineProperty(Button.prototype, 'title', {
        get: function() {
            return this.titleDisplay && this.titleDisplay.text;
        },
        set: function(val) {
            if (this.titleDisplay) {
                this.titleDisplay.text = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, 'sound', {
        get: function() {
            return this.audio && this.audio.source;
        },
        set: function(val) {
            var audio = RES.getRes(val);
            if (audio) {
                this.audio = audio;
            } else {
                ns.warn('Button sound:', val, 'resource not found!');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, 'delay', {
        get: function() {
            return this._delay;
        },
        set: function(val) {
            if (val < 0) val = 0;
            if (val > 10000) val = 10000;
            this._delay = val;
        },
        enumerable: true,
        configurable: true
    });
    ns.Button = Button;
    var Label = (function(_super) {
        ns.__extends(Label, _super);
        function Label() {
            _super && _super.apply(this, arguments);
            var _this = this;
            this._value = 0;
            this._step = 0;
            this._goal = 0;
            this._stack = [];
            this._rate = 60;
            this.formater = function(value) {
                return value.round().comma();
            };
            this.steper = function(delta) {
                if (delta < _this._rate) {
                    return 1;
                }
                return Math.floor(delta / _this._rate);
            };
        }
        return Label;
    })(eui.Label);
    Label.quiet = false;
    Object.defineProperty(Label.prototype, 'sound', {
        get: function() {
            return this.audio && this.audio.source;
        },
        set: function(val) {
            var audio = RES.getRes(val);
            if (audio) {
                this.audio = audio;
            } else {
                ns.warn('Label sound:', val, 'resource not found!');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Label.prototype, 'digit', {
        get: function() {
            return this._goal;
        },
        set: function(val) {
            if (typeof val === 'number') {
                this._stack.push(val);
                this.next();
            } else {
                throw new Error('The digit of Label must be number!');
            }
        },
        enumerable: true,
        configurable: true
    });
    Label.prototype.next = function() {
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
            egret.startTick(this.update, this);
            if (Label.quiet || this.quiet || !this.audio) return;
            var dur = delta / (this._step * this._rate);
            if (dur < 0.3) {
                dur = 0.3;
            }
            var hander = this.audio.play();
            setTimeout(function() {
                hander.stop();
            }, dur * 1000);
        }
    };
    Label.prototype.setText = function(val) {
        if (this._value !== val) {
            this._value = val;
            this.text = this.formater(val);
        }
    };
    Label.prototype.update = function(dt) {
        if (this._step > 0 && this._goal > this._value) {
            var value = this._value + this._step;
            if (value > this._goal) {
                value = this._goal;
            }
            this.setText(value);
            if (this._value === this._goal) {
                this._step = 0;
                egret.stopTick(this.update, this);
                this.next();
            }
        }
        return false;
    };
    ns.Label = Label;
})(window.cm || (window.cm = {}));
(function(ns) {
    var Stack = (function(_super) {
        ns.__extends(Stack, _super);
        function Stack() {
            _super && _super.apply(this, arguments);
        }
        Stack.prototype.onResize = function() {
            _super.prototype.onResize.call(this);
            if (!this._root) return;
            var _this = this;
            this._root.setRect(0, 0, this.width, this.height);
            this.pageStack.forEach(function(page) {
                page.setRect(0, 0, _this.width, _this.height);
            });
        };
        return Stack;
    })(eui.UILayer);

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
    Stack.prototype.reload = function(root) {
        if (!root instanceof Stack.Page) {
            throw new Error('Root class must be subclass of cm.Stack.Page!');
        }
        this.removeChildren();
        this.pageStack = [];
        root.stack = this;
        root.alpha = 0;
        root.setRect(0, 0, this.width, this.height);
        this.addChild(root);
        this._root = root;
        root.willShow();
        egret.Tween.get(root)
            .to({ alpha: 1 }, 150)
            .call(function() {
                root.didShow();
            });
    };
    Stack.prototype.push = function(page, props, finish) {
        if (!this._root) throw new Error('You must set root page using Stack.reload(root)');
        if (!page) throw new Error('stack push: page must be provide');
        var top = this.top;
        var width = this.width;
        page.stack = this;
        page.setRect(0, 0, width, this.height);
        page.props = props;
        page.x = width;
        this.pageStack.push(page);
        this.addChild(page);
        top.willHide();
        egret.Tween.get(top)
            .to({ x: -width / 3 }, 250, egret.Ease.sineInOut)
            .call(function() {
                top.visible = false;
                top.didHide();
                ns.call(finish);
            });
        page.visible = true;
        page.willShow();
        egret.Tween.get(page)
            .to({ x: 0 }, 250, egret.Ease.sineInOut)
            .call(function() {
                page.didShow();
                ns.call(finish);
            });
    };
    Stack.prototype.pop = function() {
        var _this = this;
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
            var ele = _this.pageStack.pop();
            _this.removeChild(ele);
        }
        var width = this.width;
        var top = this.top;
        ani.willHide();
        egret.Tween.get(ani)
            .to({ x: width }, 250, egret.Ease.sineInOut)
            .call(function() {
                ani.visible = false;
                ani.didHide();
                _this.removeChild(ani);
                ns.call(finish);
            });
        top.visible = true;
        top.willShow();
        egret.Tween.get(top)
            .to({ x: 0 }, 250, egret.Ease.sineInOut)
            .call(function() {
                top.didShow();
            });
    };
    Stack.prototype.remove = function(page) {
        if (this.pageStack.delete(page) >= 0) {
            this.removeChild(page);
        }
    };
    ns.Stack = Stack;
    var Page = (function(_super) {
        ns.__extends(Page, _super);
        function Page() {
            _super && _super.apply(this, arguments);
        }
        return Page;
    })(eui.Component);
    Page.prototype.willShow = function() {};
    Page.prototype.didShow = function() {};
    Page.prototype.willHide = function() {};
    Page.prototype.didHide = function() {};
    Stack.Page = Page;
})(window.cm || (window.cm = {}));
(function(ns) {
    var Popup = (function(_super) {
        ns.__extends(Popup, _super);
        function Popup() {
            _super && _super.apply(this, arguments);
            this.showed = {};
            this.opqueue = [];
            this.errmsg = 'System Error!';
            this.opacity = 0.4;
            this.touchEnabled = false;
            this.Wait = Popup.Wait;
            this.Alert = Popup.Alert;
            this.Remind = Popup.Remind;
        }
        return Popup;
    })(eui.UILayer);
    Popup.prototype.present = function(meta, opts) {
        this.add({ type: 'present', meta: meta, opts: opts });
    };
    Popup.prototype.remind = function(msg, title, duration) {
        if (!this.Remind) {
            ns.warn('the Remind class must be set!');
            return;
        }
        if (!duration) {
            duration = 2;
        }
        this.add({ type: 'remind', title: title, msg: msg, duration: duration });
    };
    Popup.prototype.dismiss = function(meta, finish) {
        if (meta) {
            if (typeof meta === 'function' && meta.NAME) {
                this.add({ type: 'dismiss', name: meta.NAME, finish: finish });
            } else {
                ns.warn('Popup.dismiss : meta must be subclass of Popup.Modal!');
            }
        } else {
            this.add({ type: 'clear', finish: finish });
        }
    };
    Popup.prototype.alert = function(msg, opts) {
        if (!this.Alert) {
            ns.warn('the Alert class must be set!');
            return;
        }
        opts = opts || {};
        opts.msg = msg;
        this.add({ type: 'present', meta: this.Alert, opts: opts });
    };
    Popup.prototype.wait = function(msg) {
        if (!this.Wait) {
            ns.warn('the Wait class must be set!');
            return;
        }
        this.add({ type: 'wait', msg: msg });
    };
    Popup.prototype.idle = function() {
        if (!this.Wait) {
            ns.warn('the Wait class must be set!');
            return;
        }
        this.add({ type: 'idle' });
    };
    Popup.prototype.error = function(e) {
        this.remind((e && e.message) || this.errmsg);
    };

    Popup.prototype.add = function(op) {
        this.opqueue.push(op);
        this.next();
    };
    Popup.prototype.next = function() {
        if (this.current) return;
        this.current = this.opqueue.shift();
        if (!this.current) return;
        var _a = this.current,
            type = _a.type,
            name = _a.name,
            meta = _a.meta,
            finish = _a.finish,
            opts = _a.opts,
            title = _a.title,
            msg = _a.msg,
            duration = _a.duration;
        switch (type) {
            case 'clear':
                this._clear(finish);
                break;
            case 'dismiss':
                this._dismiss(name, finish);
                break;
            case 'present':
                this._present(meta, opts);
                break;
            case 'wait':
                this._wait(msg);
                break;
            case 'idle':
                this._idle();
                break;
            case 'remind':
                this._remind(title, msg, duration);
                break;
        }
    };
    Popup.prototype._remind = function(title, msg, duration) {
        var _this = this;
        var modal = this.genModal(this.Remind);
        if (!modal) {
            this.current = null;
            this.next();
            return;
        }
        var opts = { title: title, msg: msg };
        modal.onCreate(opts);
        modal.alpha = 0;
        egret.Tween.get(modal)
            .to({ alpha: 1 }, 250)
            .call(function() {
                modal.onPresent(opts);
            })
            .wait(duration * 1000)
            .to({ alpha: 0 }, 250)
            .call(function() {
                _this.delete(this.Remind);
                _this.current = null;
                _this.next();
            });
        return modal;
    };
    Popup.prototype._present = function(meta, opts) {
        var _this = this;
        var modal = this.genModal(meta);
        if (!modal) {
            this.current = null;
            this.next();
            return;
        }
        modal.onCreate(opts);
        var opacity = modal.opacity < 0 ? this.opacity : modal.opacity;
        if (modal.animator) {
            if (opacity > 0) {
                egret.Tween.get(modal.background).to({ alpha: opacity }, 250);
            }
            modal.animator.alpha = 0;
            egret.Tween.get(modal.animator)
                .wait(50)
                .to({ scaleX: 0, scaleY: 0, alpha: 1 }, 0)
                .to({ scaleX: 1, scaleY: 1 }, 300, egret.Ease.elasticInOut)
                .call(function() {
                    modal.onPresent(opts);
                    _this.current = null;
                    _this.next();
                });
        } else {
            if (opacity > 0) {
                modal.background.alpha = opacity;
            }
            modal.alpha = 0;
            egret.Tween.get(modal)
                .to({ alpha: 1 }, 250)
                .call(function() {
                    modal.onPresent(opts);
                    _this.current = null;
                    _this.next();
                });
        }
        return modal;
    };
    Popup.prototype._dismiss = function(name, finish) {
        var _this = this;
        var modal = name && this.showed[name];
        if (!modal) {
            ns.call(finish);
            this.current = null;
            this.next();
            return;
        }
        delete this.showed[name];
        egret.Tween.get(modal)
            .to({ alpha: 0 }, 250)
            .call(function() {
                modal.onDismiss();
                _this.removeChild(modal);
                ns.call(finish);
                _this.current = null;
                _this.next();
            });
    };
    Popup.prototype._clear = function(finish) {
        var _this = this;
        var showed = this.showed;
        if (!showed) {
            ns.call(finish);
            this.current = null;
            this.next();
            return;
        }
        this.showed = {};
        egret.Tween.get(this)
            .to({ alpha: 0 }, 250)
            .call(function() {
                for (var key in showed) {
                    var ele = showed[key];
                    ele.onDismiss();
                    _this.removeChild(ele);
                }
                ns.call(finish);
                _this.alpha = 1;
                _this.current = null;
                _this.next();
            });
    };
    Popup.prototype._wait = function(msg) {
        var modal = this.genModal(this.Wait);
        if (modal) {
            modal.onCreate({ msg: msg });
        }
        this.current = null;
        this.next();
        return modal;
    };
    Popup.prototype._idle = function() {
        this.delete(this.Wait);
        this.current = null;
        this.next();
    };
    Popup.prototype.delete = function(meta) {
        var name = meta && meta.NAME;
        var modal = name && this.showed[name];
        if (modal) {
            delete this.showed[name];
            modal.onDismiss();
            this.removeChild(modal);
        }
    };
    Popup.prototype.genModal = function(meta) {
        if (!meta) {
            ns.warn('Modal meta class can not be empty!');
            return;
        }
        if (!meta.NAME) {
            ns.warn('Modal meta class NAME can not be empty!');
            return;
        }
        var name = meta.NAME;
        if (this.showed[name]) return;
        var modal = new meta();
        this.showed[name] = modal;
        modal.setEdge(0);
        modal.pop = this;
        this.addChild(modal);
        return modal;
    };
    ns.Popup = Popup;
    var Modal = (function(_super) {
        ns.__extends(Modal, _super);
        function Modal() {
            _super && _super.apply(this, arguments);
            var _this = this;
            this.animator = null;
            this.opacity = -1;
            this.touchEnabled = true;
            this.onblur = function() {
                _this.dismiss();
            };
        }
        Modal.prototype.createChildren = function() {
            _super.prototype.createChildren.call(this);
            this.background = new eui.Rect();
            this.background.fillColor = 0x000000;
            this.background.fillAlpha = 1;
            this.background.alpha = 0;
            this.background.setEdge(0);
            this.background.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onblur, this);
            this.addChildAt(this.background, 0);
        };
        return Modal;
    })(eui.Component);
    Modal.NAME = 'COMMON';
    Modal.prototype.onCreate = function(opts) {
        this.onhide = opts && opts.onhide;
    };
    Modal.prototype.onPresent = function(opts) {};
    Modal.prototype.onDismiss = function() {
        ns.call(this.onhide);
    };
    Modal.prototype.dismiss = function(finish) {
        this.pop && this.pop.dismiss(this.constructor, finish);
    };
    Popup.Modal = Modal;
    var Wait = (function(_super) {
        ns.__extends(Wait, _super);
        function Wait() {
            _super && _super.apply(this, arguments);
            this.zIndex = 1001;
            this.hostComponentKey = 'cm.Wait';
        }
        Wait.prototype.createChildren = function() {
            _super.prototype.createChildren.call(this);
            var _this = this;
            this.background.touchEnabled = false;
            if (this.animator) {
                egret.Tween.get(this.animator, { loop: true }).to({ rotation: 360 }, 2200);
                setTimeout(function() {
                    _this.background.touchEnabled = true;
                }, (_this.keepTime || 20) * 1000);
            } else {
                ns.warn('The part animator must be provide!');
            }
        };
        return Wait;
    })(Modal);
    Wait.NAME = 'WAIT';

    Popup.Wait = Wait;
    var Alert = (function(_super) {
        ns.__extends(Alert, _super);
        function Alert() {
            _super && _super.apply(this, arguments);
            this.zIndex = 1000;
            this.hostComponentKey = 'cm.Alert';
        }
        return Alert;
    })(Modal);
    Alert.NAME = 'ALERT';
    Alert.prototype.onCreate = function(opts) {
        var title = opts.title,
            msg = opts.msg,
            confirm = opts.confirm,
            cancel = opts.cancel,
            onhide = opts.onhide;
        this.onhide = onhide;
        this.message && (this.message.text = msg || '');
        this.title && (this.title.text = title || '');
        var onconfirm;
        if (typeof confirm === 'function') {
            onconfirm = confirm;
        } else if (typeof confirm === 'string') {
            this.confirmText && confirm && (this.confirmText.text = confirm);
        } else if (typeof confirm === 'object') {
            this.confirmText && confirm.title && (this.confirmText.text = confirm.title);
            onconfirm = confirm.block;
        }
        this.confirm.onclick = function() {
            return _this.dismiss(onconfirm);
        };
        if (!cancel) return;
        if (this.cancel) {
            this.cancel.visible = true;
            this.confirm.width = this.cancel.width;
            var oncancel;
            if (typeof cancel === 'function') {
                oncancel = cancel;
            } else if (typeof cancel === 'string') {
                this.cancelText && (this.cancelText.string = cancel);
            } else if (typeof cancel === 'object') {
                this.cancelText && cancel.title && (this.cancelText.string = cancel.title);
                oncancel = cancel.block;
            }
            this.cancel.onclick = function() {
                return _this.dismiss(oncancel);
            };
        }
    };
    Popup.Alert = Alert;
    var Remind = (function(_super) {
        ns.__extends(Remind, _super);
        function Remind() {
            _super && _super.apply(this, arguments);
            this.zIndex = 1002;
            this.hostComponentKey = 'cm.Remind';
        }
        return Remind;
    })(Modal);
    Remind.NAME = 'REMIND';
    Remind.prototype.onCreate = function(opts) {
        var title = opts.title;
        var msg = opts.msg;
        this.message && (this.message.text = msg || '');
        this.title && (this.title.text = title || '');
        this.onhide = opts && opts.onhide;
    };
    Popup.Remind = Remind;
})(window.cm || (window.cm = {}));
