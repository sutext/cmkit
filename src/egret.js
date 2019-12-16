var __reflect =
    (this && this.__reflect) ||
    function(p, c, t) {
        (p.__class__ = c), t ? t.push(c) : (t = [c]), (p.__types__ = p.__types__ ? t.concat(p.__types__) : t);
    };
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
        Button.prototype.partAdded = function(partName, instance) {
            _super.prototype.partAdded.call(this, partName, instance);
            if (instance === this.titleDisplay) {
                this.titleDisplay.text = this._title;
            } else if (instance === this.imageDisplay) {
                this.imageDisplay.source = this._image;
            } else if (instance === this.fillDisplay) {
                this.fillDisplay.fillColor = this._fill;
            }
        };
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
    Object.defineProperty(Button.prototype, 'fill', {
        get: function() {
            return this._fill;
        },
        set: function(val) {
            this._fill = val;
            if (this.fillDisplay) {
                this.fillDisplay.fillColor = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, 'title', {
        get: function() {
            return this._title;
        },
        set: function(val) {
            this._title = val;
            if (this.titleDisplay) {
                this.titleDisplay.text = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Button.prototype, 'image', {
        get: function() {
            return this._image;
        },
        set: function(val) {
            this._image = val;
            if (this.imageDisplay) {
                this.imageDisplay.source = val;
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
        if (opacity > 0) {
            egret.Tween.get(modal.background).to({ alpha: opacity }, 250);
        }
        if (modal.animator) {
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
        } else if (modal.content) {
            modal.content.alpha = 0;
            egret.Tween.get(modal.content)
                .to({ alpha: 1 }, 250)
                .call(function() {
                    modal.onPresent(opts);
                    _this.current = null;
                    _this.next();
                });
        } else {
            modal.onPresent(opts);
            _this.current = null;
            _this.next();
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
        egret.Tween.get(modal.background).to({ alpha: 0 }, 250);
        if (modal.content) {
            egret.Tween.get(modal.content)
                .to({ alpha: 0 }, 250)
                .call(function() {
                    modal.onDismiss();
                    _this.removeChild(modal);
                    ns.call(finish);
                    _this.current = null;
                    _this.next();
                });
        } else {
            modal.onDismiss();
            _this.removeChild(modal);
            ns.call(finish);
            _this.current = null;
            _this.next();
        }
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
            this.content = null;
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
            var _this = this;
            this.background.addEventListener(
                egret.TouchEvent.TOUCH_TAP,
                function() {
                    _this.onblur();
                },
                this
            );
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
(function(ns) {
    var PageView = (function(_super) {
        ns.__extends(PageView, _super);
        function PageView() {
            var _this = _super.call(this) || this;
            _this.$bounces = true;
            _this.$viewport = null;
            _this.$disabled = false;
            _this.$vertical = false;
            _this.$velocity = 0;
            _this.$pageIndex = 0;
            _this.$pageSize = 0;
            _this.$scrollThreshold = 5;
            _this.$changeThreshold = 0.4;

            _this.$canscroll = false;
            _this.$tweening = false;
            _this.$touchMoved = false;
            _this.$touchCancel = false;
            _this.$touchStart = 0;
            _this.$touchPoint = 0;
            _this.$touchTime = 0;
            _this.$viewprotRemovedEvent = false;
            return _this;
        }
        Object.defineProperty(PageView.prototype, 'moving', {
            get: function() {
                return this.$touchMoved || this.$tweening;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageView.prototype, 'bounces', {
            get: function() {
                return this.$bounces;
            },
            set: function(value) {
                this.$bounces = !!value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageView.prototype, 'vertical', {
            get: function() {
                return this.$vertical;
            },
            set: function(value) {
                if (!this.$touchMoved) {
                    this.$vertical = !!value;
                } else {
                    console.warn('Can not change vertical when scrolling');
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(PageView.prototype, 'pageSize', {
            get: function() {
                if (!this.$viewport) {
                    return 0;
                }
                return this.$getParamInfo().size;
            },
            set: function(value) {
                if (value > 0) {
                    this.$pageSize = value;
                } else {
                    throw new Error('pageSize must be greater than zero');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageView.prototype, 'pageIndex', {
            get: function() {
                return this.$pageIndex;
            },
            set: function(index) {
                if (!Number.isInteger(index) || index < 0) {
                    throw new Error('pageIndex must be unsigned ingeger');
                }
                if (this.$pageIndex !== index) {
                    if (this.$touchMoved || !this.$viewport) {
                        return;
                    }
                    this.stopAnimation();
                    var info = this.$getParamInfo();
                    this.$pageIndex = index;
                    var pos = index * info.size;
                    if (pos < 0) {
                        pos = 0;
                    } else if (pos > info.max) {
                        pos = info.max;
                    }
                    this.viewport[info.key] = pos;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageView.prototype, 'disabled', {
            get: function() {
                return this.$disabled;
            },
            set: function(value) {
                value = !!value;
                if (value !== this.$disabled) {
                    this.$disabled = value;
                    this.checkScrollAble();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageView.prototype, 'viewport', {
            get: function() {
                return this.$viewport;
            },
            set: function(value) {
                if (value !== this.$viewport) {
                    this.uninstallViewport();
                    this.$viewport = value;
                    this.$viewprotRemovedEvent = false;
                    this.installViewport();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageView.prototype, 'scrollThreshold', {
            get: function() {
                return this.$scrollThreshold;
            },
            set: function(value) {
                if (value < 1 || value > 100) {
                    throw new Error('scrollThreshold must be between 1 and 100');
                }
                this.$scrollThreshold = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageView.prototype, 'changeThreshold', {
            get: function() {
                return this.$changeThreshold;
            },
            set: function(value) {
                if (value < 0 || value > 1) {
                    throw new Error('changeThreshold must be between 0 and 1');
                }
                this.$changeThreshold = value;
            },
            enumerable: true,
            configurable: true
        });
        PageView.prototype.$getParamInfo = function() {
            var max, key, size;
            var viewport = this.$viewport;
            var uivalues = viewport.$UIComponent;
            if (this.$vertical) {
                key = 'scrollV';
                max = viewport.contentHeight - uivalues[11];
                size = uivalues[11];
            } else {
                key = 'scrollH';
                max = viewport.contentWidth - uivalues[10];
                size = uivalues[10];
            }
            if (this.$pageSize) {
                size = Math.min(this.$pageSize, size);
            }
            return { max: Math.max(0, max), key: key, size: size };
        };
        PageView.prototype.installViewport = function() {
            var viewport = this.viewport;
            if (viewport) {
                this.addChildAt(viewport, 0);
                viewport.scrollEnabled = true;
                viewport.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBeginCapture, this, true);
                viewport.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEndCapture, this, true);
                viewport.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTapCapture, this, true);
                viewport.addEventListener(egret.Event.REMOVED, this.onViewPortRemove, this);
            }
        };
        PageView.prototype.uninstallViewport = function() {
            var viewport = this.viewport;
            if (viewport) {
                viewport.scrollEnabled = false;
                viewport.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBeginCapture, this, true);
                viewport.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEndCapture, this, true);
                viewport.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTapCapture, this, true);
                viewport.removeEventListener(egret.Event.REMOVED, this.onViewPortRemove, this);
                if (this.$viewprotRemovedEvent == false) {
                    this.removeChild(viewport);
                }
            }
        };
        PageView.prototype.onViewPortRemove = function(event) {
            if (event.target == this.$viewport) {
                this.$viewprotRemovedEvent = true;
                this.viewport = null;
            }
        };
        PageView.prototype.setSkin = function(skin) {
            _super.prototype.setSkin.call(this, skin);
            if (this.$viewport) {
                this.addChildAt(this.$viewport, 0);
            }
        };
        PageView.prototype.onTouchBeginCapture = function(event) {
            if (!this.$stage) return;
            this.$touchCancel = false;
            if (this.checkScrollAble()) {
                this.onTouchBegin(event);
            }
        };
        PageView.prototype.onTouchEndCapture = function(event) {
            if (this.$touchCancel) {
                event.$bubbles = false;
                this.dispatchBubbleEvent(event);
                event.$bubbles = true;
                event.stopPropagation();
                this.onTouchEnd(event);
            }
        };
        PageView.prototype.onTouchTapCapture = function(event) {
            if (this.$touchCancel) {
                event.$bubbles = false;
                this.dispatchBubbleEvent(event);
                event.$bubbles = true;
                event.stopPropagation();
            }
        };
        PageView.prototype.checkScrollAble = function() {
            var viewport = this.$viewport;
            if (!viewport) return false;
            var uiValues = viewport.$UIComponent;
            if (this.$vertical) {
                this.$canscroll = !this.$disabled && viewport.contentHeight > uiValues[11];
            } else {
                this.$canscroll = !this.$disabled && viewport.contentWidth > uiValues[10];
            }
            return this.$canscroll;
        };
        PageView.prototype.onTouchBegin = function(event) {
            if (event.isDefaultPrevented()) {
                return;
            }
            if (!this.$canscroll) {
                return;
            }
            this.downTarget = event.target;
            this.stopAnimation();
            if (this.$vertical) {
                this.$touchStart = event.$stageY;
            } else {
                this.$touchStart = event.$stageX;
            }
            this.$touchTime = egret.getTimer();
            this.$touchPoint = this.$touchStart;
            var stage = this.$stage;
            this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this, true);
            this.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemoveListeners, this);
            this.tempStage = stage;
        };
        PageView.prototype.onTouchMove = function(event) {
            if (event.isDefaultPrevented()) {
                return;
            }
            if (!this.$touchMoved) {
                if (this.$disabled) {
                    return;
                }
                if (this.$vertical) {
                    if (Math.abs(this.$touchStart - event.$stageY) < this.$scrollThreshold) {
                        return;
                    }
                } else {
                    if (Math.abs(this.$touchStart - event.$stageX) < this.$scrollThreshold) {
                        return;
                    }
                }
                this.$touchCancel = true;
                this.$touchMoved = true;
                this.dispatchCancelEvent(event);
                this.$stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            }
            event.preventDefault();
            if (!this.$canscroll) {
                return;
            }
            if (this.$vertical) {
                this.update(event.$stageY);
            } else {
                this.update(event.$stageX);
            }
        };
        PageView.prototype.update = function(touchPoint) {
            var info = this.$getParamInfo();
            var key = info.key;
            var max = info.max;
            var time = egret.getTimer();
            var delta = touchPoint - this.$touchPoint;
            var pos = this.$viewport[key] - delta;
            this.$touchPoint = touchPoint;
            this.$velocity = delta / (time - this.$touchTime);
            this.$touchTime = time;
            if (pos < 0) {
                if (!this.$bounces) {
                    pos = 0;
                } else {
                    pos -= delta * 0.5;
                }
            }
            if (pos > max) {
                if (!this.$bounces) {
                    pos = max;
                } else {
                    pos -= delta * 0.5;
                }
            }
            this.$viewport[key] = pos;
        };
        PageView.prototype.onTouchCancel = function(event) {
            if (!this.$touchMoved) {
                this.onRemoveListeners();
            }
        };
        PageView.prototype.onTouchEnd = function(event) {
            this.$touchMoved = false;
            this.onRemoveListeners();
            var info = this.$getParamInfo();
            var max = info.max;
            var key = info.key;
            var current = this.$viewport[key];
            var pageSize = info.size;
            var fastMove = false;
            var index = current / pageSize;
            if (this.$touchPoint - this.$touchStart > this.$changeThreshold * pageSize) {
                index = Math.floor(index);
            } else if (this.$touchStart - this.$touchPoint > this.$changeThreshold * pageSize) {
                index = Math.ceil(index);
            } else if (this.$velocity > 1.2) {
                index = Math.floor(index);
                fastMove = true;
            } else if (this.$velocity < -1.2) {
                index = Math.ceil(index);
                fastMove = true;
            } else {
                index = this.$pageIndex;
            }
            var pos = index * pageSize;
            if (pos < 0) {
                pos = 0;
            } else if (pos > max) {
                pos = max;
            }
            var param = {};
            param[key] = pos;
            var duration = fastMove ? Math.abs(pos - current) / 4 : 250;
            this.$tweening = true;
            var _this = this;
            egret.Tween.get(this.viewport)
                .to(param, duration, egret.Ease.sineInOut)
                .call(function() {
                    _this.$tweening = false;
                });
            if (index !== this.$pageIndex) {
                this.$pageIndex = index;
                if (typeof this.onchanged === 'function') {
                    this.onchanged(index);
                }
            }
        };
        PageView.prototype.dispatchBubbleEvent = function(event) {
            var viewport = this.$viewport;
            if (!viewport) return;
            var cancelEvent = egret.Event.create(egret.TouchEvent, event.type, event.bubbles, event.cancelable);
            cancelEvent.$initTo(event.$stageX, event.$stageY, event.touchPointID);
            var target = this.downTarget;
            cancelEvent.$setTarget(target);
            var list = this.$getPropagationList(target);
            var length = list.length;
            var targetIndex = list.length * 0.5;
            var startIndex = -1;
            for (var i = 0; i < length; i++) {
                if (list[i] === viewport) {
                    startIndex = i;
                    break;
                }
            }
            list.splice(0, list.length - startIndex + 1);
            targetIndex = 0;
            this.$dispatchPropagationEvent(cancelEvent, list, targetIndex);
            egret.Event.release(cancelEvent);
        };

        PageView.prototype.dispatchCancelEvent = function(event) {
            var viewport = this.$viewport;
            if (!viewport) return;
            var cancelEvent = egret.Event.create(egret.TouchEvent, egret.TouchEvent.TOUCH_CANCEL, event.bubbles, event.cancelable);
            cancelEvent.$initTo(event.$stageX, event.$stageY, event.touchPointID);
            var target = this.downTarget;
            cancelEvent.$setTarget(target);
            var list = this.$getPropagationList(target);
            var length = list.length;
            var targetIndex = list.length * 0.5;
            var startIndex = -1;
            for (var i = 0; i < length; i++) {
                if (list[i] === viewport) {
                    startIndex = i;
                    break;
                }
            }
            list.splice(0, startIndex + 1 - 2);
            list.splice(list.length - 1 - startIndex + 2, startIndex + 1 - 2);
            targetIndex -= startIndex + 1;
            this.$dispatchPropagationEvent(cancelEvent, list, targetIndex);
            egret.Event.release(cancelEvent);
        };

        PageView.prototype.onRemoveListeners = function() {
            var stage = this.tempStage || this.$stage;
            stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this, true);
            stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            this.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            this.removeEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.removeEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemoveListeners, this);
        };

        PageView.prototype.stopAnimation = function() {
            if (this.$viewport) {
                egret.Tween.removeTweens(this.$viewport);
            }
            this.$tweening = false;
        };

        PageView.prototype.updateDisplayList = function(unscaledWidth, unscaledHeight) {
            _super.prototype.updateDisplayList.call(this, unscaledWidth, unscaledHeight);
            var viewport = this.$viewport;
            if (viewport) {
                viewport.setLayoutBoundsSize(unscaledWidth, unscaledHeight);
                viewport.setLayoutBoundsPosition(0, 0);
            }
        };
        return PageView;
    })(eui.Component);
    ns.PageView = PageView;
    __reflect(PageView.prototype, 'cm.PageView');
    eui.registerProperty(PageView, 'viewport', 'eui.IViewport', true);
})(window.cm || (window.cm = {}));
