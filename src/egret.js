(function(ns) {
    function Counter(label, sound) {
        this._value = 0;
        this._step = 0;
        this._goal = 0;
        this._stack = [];
        this._rate = 60;
        this.quiet = false;
        this.label = label;
        this.sound = sound;
    }
    ns.Counter = Counter;
    Counter.quiet = false;
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
            if (Counter.quiet || this.quiet || !this.sound) return;
            //播放音效
            var dur = delta / (this._step * this._rate);
            if (dur < 0.3) {
                dur = 0.3;
            }
            // var sid = cc.audioEngine.play(this.sound, true, 1);
            // setTimeout(function() {
            //     cc.audioEngine.stop(sid);
            // }, dur * 1000);
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
})(window.cm || (window.cm = {}));
