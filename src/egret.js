(function(ns) {
    var DigitLabel = (function(_super) {
        ns.__extends(DigitLabel, _super);
        function DigitLabel() {
            _super && _super.apply(this, arguments);
            this._value = 0;
            this._step = 0;
            this._goal = 0;
            this._stack = [];
            this._rate = 60;
        }
        DigitLabel.quiet = false;
        Object.defineProperty(DigitLabel.prototype, 'digit', {
            get: function() {
                return this._goal;
            },
            set: function(val) {
                if (typeof val === 'number') {
                    this._stack.push(val);
                    this.next();
                } else {
                    throw new Error('The digit of DigitLabel must be number!');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DigitLabel.prototype, 'sound', {
            get: function() {
                return this._sound;
            },
            set: function(val) {
                if (this._sound !== val) {
                    this._sound = val;
                    var audio = this._audio || (this._audio = new egret.Sound());
                    audio.load(val);
                }
            },
            enumerable: true,
            configurable: true
        });
        DigitLabel.prototype.formater = function(value) {
            return value.round().comma();
        };
        DigitLabel.prototype.steper = function(delta) {
            if (delta < this._rate) {
                return 1;
            }
            return Math.floor(delta / this._rate);
        };
        DigitLabel.prototype.next = function() {
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
                if (DigitLabel.quiet || this.quiet || !this._audio) return;
                //播放音效
                var dur = delta / (this._step * this._rate);
                if (dur < 0.3) {
                    dur = 0.3;
                }
                var hander = this._audio.play();
                setTimeout(function() {
                    hander.stop();
                }, dur * 1000);
            }
        };
        DigitLabel.prototype.setText = function(val) {
            if (this._value !== val) {
                this._value = val;
                this.text = this.formater(val);
            }
        };
        DigitLabel.prototype.update = function(dt) {
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
        return DigitLabel;
    })(eui.Label);
    ns.DigitLabel = DigitLabel;
})(window.cm || (window.cm = {}));
