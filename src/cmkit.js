(function() {
    'use strict';
    Number.prototype.fixlen = function(len) {
        if (typeof len !== 'number' || len < 1) {
            len = 2;
        }
        return (Array(len).join('0') + this).slice(-len);
    };
    Number.prototype.round = function(len) {
        if (typeof len !== 'number' || len < 0) {
            len = 0;
        }
        var pow = Math.pow(10, len);
        return Math.round(this * pow) / pow;
    };
    Number.prototype.floor = function(len) {
        if (typeof len !== 'number' || len < 0) {
            len = 0;
        }
        var pow = Math.pow(10, len);
        return Math.floor(this * pow) / pow;
    };
    Number.prototype.ceil = function(len) {
        if (typeof len !== 'number' || len < 0) {
            len = 0;
        }
        var pow = Math.pow(10, len);
        return Math.ceil(this * pow) / pow;
    };
    Number.prototype.comma = function() {
        var str = this.toString();
        var strary = str.split('.');
        var head = strary[0];
        var result = '';
        if (head.length <= 3) {
            result = head || '0';
        } else {
            while (head.length > 3) {
                result = ',' + head.slice(-3) + result;
                head = head.slice(0, head.length - 3);
            }
            result = head + result;
        }
        if (strary.length > 1) {
            result = result + '.' + (strary[1] || '0');
        }
        return result;
    };
    Object.defineProperty(Number.prototype, 'symidx', {
        get: function() {
            if (this > 3 && this <= 20) {
                return 'th';
            }
            switch (this % 10) {
                case 1:
                    return 'st';
                case 2:
                    return 'nd';
                case 3:
                    return 'rd';
                default:
                    return 'th';
            }
        },
        enumerable: true,
        configurable: true
    });
    String.prototype.fixlen = function(len) {
        if (typeof len !== 'number' || len < 1) {
            len = 2;
        }
        return (Array(len).join('0') + this).slice(-len);
    };
    String.prototype.parsed = function() {
        var result = {};
        if (this.length == 0) return result;
        var strs = this.split('?');
        var ary = strs[0].split('://');
        if (ary.length < 2) return result;
        result.schema = ary[0];
        var sary = ary[1].split('/');
        result.host = sary[0];
        if (sary.length > 1) result.query = sary[sary.length - 1];
        if (strs.length < 2) return result;
        var paramStrs = strs[1].split('&');
        for (var index = 0; index < paramStrs.length; index++) {
            var keys = paramStrs[index].split('=');
            if (keys.length < 2) continue;
            var key = keys[0];
            var value = keys[1];
            if (key) result[key] = value;
        }
        return result;
    };
    Object.defineProperty(Array.prototype, 'first', {
        get: function() {
            if (this.length > 0) {
                return this[0];
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Array.prototype, 'last', {
        get: function() {
            if (this.length > 0) {
                return this[this.length - 1];
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Array.prototype, 'ranidx', {
        get: function() {
            if (this.length === 0) return -1;
            return Math.floor(Math.random() * this.length);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Array.prototype, 'random', {
        get: function() {
            return this[this.ranidx];
        },
        enumerable: true,
        configurable: true
    });
    Array.prototype.insert = function(obj, index) {
        if (typeof index !== 'number') return;
        if (index < 0 || index > this.length) return;
        this.splice(index, 0, obj);
    };
    Array.prototype.append = function(ary) {
        return this.push.apply(this, ary);
    };
    Array.prototype.remove = function(index) {
        if (typeof index !== 'number') return undefined;
        if (index < 0 || index >= this.length) return undefined;
        return this.splice(index, 1)[0];
    };
    Array.prototype.delete = function(item) {
        if (this.length === 0) return -1;
        var idx = this.findIndex(function(ele) {
            return ele === item;
        });
        this.remove(idx);
        return idx;
    };
    Array.prototype.contains = function(item) {
        if (this.length === 0) return false;
        var idx = this.findIndex(function(ele) {
            return ele === item;
        });
        return idx !== -1;
    };
    Date.prototype.format = function(fmt) {
        var o = {
            'M+': this.getMonth() + 1, //月份
            'd+': this.getDate(), //日
            'h+': this.getHours(), //小时
            'm+': this.getMinutes(), //分
            's+': this.getSeconds() //秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        for (var k in o) if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        return fmt;
    };
    Object.defineProperty(Date.prototype, 'hhmmss', {
        get: function() {
            var h = this.getUTCHours();
            var m = this.getUTCMinutes();
            var s = this.getUTCSeconds();
            return h.fixlen(2) + ':' + m.fixlen(2) + ':' + s.fixlen(2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Date.prototype, 'hhmm', {
        get: function() {
            var h = this.getUTCHours();
            var m = this.getUTCMinutes();
            return h.fixlen(2) + ':' + m.fixlen(2);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Date.prototype, 'mmss', {
        get: function() {
            var h = this.getUTCMinutes();
            var m = this.getUTCSeconds();
            return h.fixlen(2) + ':' + m.fixlen(2);
        },
        enumerable: true,
        configurable: true
    });
})();

//---------------------uitls----------------------
(function(ns) {
    'use strict';
    ns.log = function() {
        if (ns.debug) {
            console.log.apply(console, arguments);
        }
    };
    ns.warn = function() {
        if (ns.debug) {
            console.warn.apply(console, arguments);
        }
    };
    ns.call = function() {
        var argc = arguments.length;
        if (argc <= 0) return;
        var func = arguments[0];
        if (typeof func !== 'function') return;
        if (argc === 1) {
            func();
        } else {
            var args = [];
            for (var i = 1; i < argc; i++) {
                args.push(arguments[i]);
            }
            func.apply(null, args);
        }
    };
    ns.okstr = function(value) {
        var type = typeof value;
        switch (type) {
            case 'string':
                return value.length !== 0;
            case 'number':
                return true;
            default:
                return false;
        }
    };
    ns.okint = function(value) {
        var type = typeof value;
        switch (type) {
            case 'string':
                return /^\d+$/.test(value);
            case 'number':
                return Number.isInteger(value);
            default:
                return false;
        }
    };
    ns.oknum = function(value) {
        var type = typeof value;
        switch (type) {
            case 'string':
                return /^\d+(\.\d+)?$/.test(value);
            case 'number':
                return true;
            default:
                return false;
        }
    };
    ns.config = function(host, debug) {
        ns.apihost = host;
        ns.debug = debug;
    };
    ns.mapkey = function(target, field) {
        if (!target || !target.constructor) {
            throw new Error('The mapkey must mark on a MetaClass property');
        }
        if (target.constructor.__mapkey) {
            throw new Error('The mapkey of MetaClass must be unique');
        }
        target.constructor.__mapkey = field;
    };
})((window.cm = window.cm || {}));

//--------------------Network Socket Storage ----------------
(function(ns) {
    var __extends =
        (this && this.__extends) ||
        (function() {
            var extendStatics = function(d, b) {
                extendStatics =
                    Object.setPrototypeOf ||
                    ({ __proto__: [] } instanceof Array &&
                        function(d, b) {
                            d.__proto__ = b;
                        }) ||
                    function(d, b) {
                        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                    };
                return extendStatics(d, b);
            };
            return function(d, b) {
                extendStatics(d, b);
                function __() {
                    this.constructor = d;
                }
                d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
            };
        })();
    ns.Network = (function() {
        function Network() {
            var _this = this;
            this.upload = function(path, upload) {
                var data = new FormData();
                data.append(upload.name, upload.data);
                if (upload.params) {
                    for (var key in upload.params) {
                        data.append(upload.params[key], key);
                    }
                }
                var headers = (upload.opts && upload.opts.headers) || _this.headers;
                headers['Content-Type'] = upload.type;
                var options = Object.assign({ headers: headers }, upload.opts);
                var values = Network.post(_this.url(path), _this.params(data), options);
                var promiss = values[0].then(function(json) {
                    var parser = (options && options.parser) || _this.resolve.bind(_this);
                    var value = parser(json);
                    return value;
                });
                return new Network.UploadTask(promiss, values[1]);
            };
            this.anyreq = function(req) {
                return _this.anytask(req.path, req.data, req.options);
            };
            this.objreq = function(req) {
                if (typeof req.meta !== 'function') throw new Error('the meta of objreq must be a Constructor');
                return _this.objtask(req.meta, req.path, req.data, req.options);
            };
            this.aryreq = function(req) {
                if (typeof req.meta !== 'function') throw new Error('the meta of aryreq must be a Constructor');
                return _this.arytask(req.meta, req.path, req.data, req.options);
            };
            this.mapreq = function(req) {
                if (typeof req.meta !== 'function') throw new Error('the meta of mapreq must be a Constructor');
                return _this.maptask(req.meta, req.path, req.data, req.options);
            };
            this.anytask = function(path, data, opts) {
                var options = Object.assign({ method: _this.method, headers: _this.headers }, opts);
                var values = Network.http(_this.url(path), _this.params(data), options);
                var promiss = values[0].then(function(json) {
                    var parser = (options && options.parser) || _this.resolve.bind(_this);
                    var value = parser(json);
                    return value;
                });
                return new Network.DataTask(promiss, values[1]);
            };
            this.objtask = function(meta, path, data, opts) {
                var options = Object.assign({ method: _this.method, headers: _this.headers }, opts);
                var values = Network.http(_this.url(path), _this.params(data), options);
                var promiss = values[0]
                    .then(function(json) {
                        var parser = (options && options.parser) || _this.resolve.bind(_this);
                        return parser(json);
                    })
                    .then(function(value) {
                        return new meta(value);
                    });
                return new Network.DataTask(promiss, values[1]);
            };
            this.arytask = function(meta, path, data, opts) {
                var options = Object.assign({ method: _this.method, headers: _this.headers }, opts);
                var values = Network.http(_this.url(path), _this.params(data), options);
                var promiss = values[0]
                    .then(function(json) {
                        var parser = (options && options.parser) || _this.resolve.bind(_this);
                        return parser(json);
                    })
                    .then(function(value) {
                        return Array.isArray(value)
                            ? value.map(function(ele) {
                                  return new meta(ele);
                              })
                            : [];
                    });
                return new Network.DataTask(promiss, values[1]);
            };
            this.maptask = function(meta, path, data, opts) {
                var options = Object.assign({ method: _this.method, headers: _this.headers }, opts);
                var values = Network.http(_this.url(path), _this.params(data), options);
                var promiss = values[0]
                    .then(function(json) {
                        var parser = (options && options.parser) || _this.resolve.bind(_this);
                        return parser(json);
                    })
                    .then(function(value) {
                        var result = {};
                        var mapkey = meta.__mapkey || 'id';
                        if (Array.isArray(value)) {
                            value.forEach(function(ele) {
                                var obj = new meta(ele);
                                var keyvalue = obj[mapkey];
                                if (keyvalue) {
                                    result[keyvalue] = obj;
                                } else {
                                    ns.warn('the mapkey:', mapkey, 'not exist in object:', obj);
                                }
                            });
                        }
                        if (typeof value === 'object') {
                            for (var key in value) {
                                if (value.hasOwnProperty(key)) {
                                    var obj = new meta(value[key]);
                                    var keyvalue = obj[mapkey];
                                    if (keyvalue === key) {
                                        result[keyvalue] = obj;
                                    }
                                }
                            }
                        }
                        return result;
                    });
                return new Network.DataTask(promiss, values[1]);
            };
        }
        Object.defineProperty(Network.prototype, 'headers', {
            get: function() {
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Network.prototype, 'method', {
            get: function() {
                return 'POST';
            },
            enumerable: true,
            configurable: true
        });
        Network.prototype.url = function(path) {
            throw new Error('Network.url(path:string) must be implement');
        };
        Network.prototype.resolve = function(json) {
            throw new Error('Network.resolve must be implement');
        };
        Network.prototype.params = function(data) {
            return data;
        };
        return Network;
    })();
    (function(Network) {
        var Error = /** @class */ (function() {
            function Error(type, status, message) {
                this.type = type;
                this.status = status;
                this.message = message;
            }
            Error.abort = function(status) {
                return new Error('abort', status, 'The request has been abort!');
            };
            Error.timeout = function(status) {
                return new Error('timeout', status, 'Request timeout!');
            };
            Error.service = function(status) {
                return new Error('service', status, '[' + status + ']:' + 'The service unavailable!');
            };
            return Error;
        })();
        Network.Error = Error;
        var DataTask = /** @class */ (function() {
            function DataTask(promiss, handler) {
                this.promiss = promiss;
                this.handler = handler;
                this[Symbol.toStringTag] = 'Promise';
                var _this = this;
                this.then = function(onfulfilled, onrejected) {
                    return _this.promiss.then(onfulfilled, onrejected);
                };
                this.catch = function(onrejected) {
                    return _this.promiss.catch(onrejected);
                };
                this.abort = function() {
                    if (this.handler.readyState < 4) {
                        _this.handler.abort();
                    }
                };
                this.onProgress = function(func) {
                    _this.handler.onprogress = func;
                };
            }
            return DataTask;
        })();
        Network.DataTask = DataTask;
        var UploadTask = /** @class */ (function(_super) {
            __extends(UploadTask, _super);
            function UploadTask() {
                var _this = (_super !== null && _super.apply(this, arguments)) || this;
                _this.onProgress = function(func) {
                    _this.handler.upload.onprogress = func;
                };
                return _this;
            }
            return UploadTask;
        })(DataTask);
        Network.UploadTask = UploadTask;
        Network.http = function(url, data, opts) {
            return (opts && opts.method) === 'POST' ? Network.post(url, data, opts) : Network.get(url, data, opts);
        };
        Network.get = function(url, data, opts) {
            var handler;
            var promiss = new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                handler = xhr;
                xhr.onabort = function() {
                    return reject(Network.Error.abort(xhr.status));
                };
                xhr.ontimeout = function() {
                    return reject(Network.Error.timeout(xhr.status));
                };
                xhr.onerror = function() {
                    return reject(Network.Error.service(xhr.status));
                };
                xhr.onloadend = function() {
                    ns.log('\nrequest:url=', url, '\nrequest:data=', data, '\nresponse=', xhr.response);
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                        resolve(xhr.responseType === 'json' ? xhr.response : xhr.responseText);
                    } else {
                        reject(Error.service(xhr.status));
                    }
                };
                var params = data || {};
                var keys = Object.keys(params);
                if (keys.length > 0) {
                    url = url + '?' + keys[0] + '=' + params[keys[0]];
                    for (var index = 1; index < keys.length; index++) {
                        var key = keys[index];
                        url = url + '&' + key + '=' + params[key];
                    }
                }
                xhr.open('GET', url, true);
                xhr.timeout = (opts && opts.timeout) || 20000;
                xhr.responseType = (opts && opts.resptype) || 'json';
                var headers = (opts && opts.headers) || {};
                for (var key in headers) {
                    xhr.setRequestHeader(key, headers[key]);
                }
                xhr.send();
            });
            return [promiss, handler];
        };
        var _reqidx = 0;
        Network.post = function(url, data, opts) {
            var handler;
            var promiss = new Promise(function(resolve, reject) {
                var xhr = new XMLHttpRequest();
                handler = xhr;
                xhr.onabort = function() {
                    return reject(Network.Error.abort(xhr.status));
                };
                xhr.ontimeout = function() {
                    return reject(Network.Error.timeout(xhr.status));
                };
                xhr.onerror = function() {
                    return reject(Network.Error.service(xhr.status));
                };
                xhr.onloadend = function() {
                    ns.log('\nrequest:url=', url, '\nrequest:data=', data, '\nresponse=', xhr.response);
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                        resolve(xhr.responseType === 'json' ? xhr.response : xhr.responseText);
                    } else {
                        reject(Error.service(xhr.status));
                    }
                };
                xhr.open('POST', url, true);
                xhr.timeout = (opts && opts.timeout) || 20000;
                xhr.responseType = (opts && opts.resptype) || 'json';
                xhr.setRequestHeader('Content-Type', 'application/json');
                var headers = (opts && opts.headers) || {};
                for (var key in headers) {
                    xhr.setRequestHeader(key, headers[key]);
                }
                var body = data || {};
                body._reqidx = _reqidx++;
                xhr.send(JSON.stringify(body));
            });
            return [promiss, handler];
        };
    })(ns.Network);

    ns.Socket = (function() {
        function Socket(builder, protocols) {
            var _this = this;
            this._retrying = false;
            this.retryable = false;
            this.open = function() {
                if (_this.readyState === Socket.CONNECTING || _this.readyState === Socket.OPEN || typeof _this.buildurl !== 'function') {
                    return;
                }
                if (_this.ws) {
                    _this.ws.onopen = null;
                    _this.ws.onclose = null;
                    _this.ws.onerror = null;
                    _this.ws.onmessage = null;
                }
                _this.ws = new WebSocket(_this.buildurl(), _this.protocols);
                _this.ws.onclose = _this.onCloseCallback.bind(_this);
                _this.ws.onerror = _this.onErrorCallback.bind(_this);
                _this.ws.onmessage = _this.onMessageCallback.bind(_this);
                _this.ws.onopen = _this.onOpenCallback.bind(_this);
            };
            this.close = function(code, reason) {
                if (!_this.ws) return;
                if (_this.ws.readyState === Socket.CLOSED || _this.ws.readyState === Socket.CLOSING) return;
                _this.ws.close(code, reason);
            };
            this.send = function(data) {
                _this.ws && _this.ws.send(data);
            };
            this.buildurl = builder;
            this.protocols = protocols;
            this.retry = new Socket.Retry(this.onRetryCallback.bind(this), this.onRetryFailed.bind(this));
        }
        Socket.prototype.onRetryCallback = function() {
            this.open();
            this._retrying = true;
        };
        Socket.prototype.onRetryFailed = function(e) {
            this._retrying = false;
            if (typeof this.onclose === 'function') {
                this.onclose(e, 'retry');
            }
        };
        Socket.prototype.onOpenCallback = function(e) {
            if (typeof this.onopen === 'function') {
                this.onopen.call(null, e, this._retrying);
            }
            this._retrying = false;
        };
        Socket.prototype.onCloseCallback = function(e) {
            if (this.retryable && e.code < 3000) {
                this.retry.attempt(e);
            } else if (typeof this.onclose === 'function') {
                this._retrying = false;
                var reason = 'server';
                if (e.reason === 'ping' || e.reason === 'user') {
                    reason = e.reason;
                }
                this.onclose(e, reason);
            }
        };
        Socket.prototype.onErrorCallback = function() {
            if (typeof this.onerror === 'function') {
                this.onerror.apply(null, arguments);
            }
        };
        Socket.prototype.onMessageCallback = function() {
            if (typeof this.onmessage === 'function') {
                this.onmessage.apply(null, arguments);
            }
        };
        Object.defineProperty(Socket.prototype, 'isRetrying', {
            get: function() {
                return this._retrying;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Socket.prototype, 'protocol', {
            get: function() {
                return this.ws && this.ws.protocol;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Socket.prototype, 'extensions', {
            get: function() {
                return this.ws && this.ws.extensions;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Socket.prototype, 'readyState', {
            get: function() {
                return (this.ws && this.ws.readyState) || WebSocket.CLOSED;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Socket.prototype, 'bufferedAmount', {
            get: function() {
                return this.ws && this.ws.bufferedAmount;
            },
            enumerable: true,
            configurable: true
        });
        return Socket;
    })();
    (function(Socket) {
        Socket.OPEN = WebSocket.OPEN;
        Socket.CLOSED = WebSocket.CLOSED;
        Socket.CLOSING = WebSocket.CLOSING;
        Socket.CONNECTING = WebSocket.CONNECTING;
        var Observers = /** @class */ (function() {
            function Observers() {
                this.open = [];
                this.error = [];
                this.close = [];
                this.message = [];
            }
            return Observers;
        })();
        Socket.Observers = Observers;
        var Retry = /** @class */ (function() {
            function Retry(attempt, failed) {
                var _this = this;
                this.delay = 100;
                this.times = 8;
                this.count = 0; //已经尝试次数
                this.reset = function() {
                    _this.count = 0;
                };
                this.attempt = function(evt) {
                    if (_this.count < _this.times) {
                        setTimeout(function() {
                            return _this.onAttempt(evt);
                        }, _this.random(_this.count++, _this.delay));
                    } else {
                        _this.onFailed(evt);
                    }
                };
                this.onAttempt = attempt;
                this.onFailed = failed;
            }
            Retry.prototype.random = function(attempt, delay) {
                return Math.floor((0.5 + Math.random() * 0.5) * Math.pow(2, attempt) * delay);
            };
            return Retry;
        })();
        Socket.Retry = Retry;
        var Ping = (function() {
            function Ping(socket, allow) {
                if (allow === void 0) {
                    allow = true;
                }
                var _this = this;
                this.timer = null;
                this.timeout = null;
                this.interval = 30;
                this.send = function() {
                    if (!_this.allow || _this.timeout) return;
                    if (_this.socket.readyState !== Socket.OPEN) return;
                    var data = '{"type":"PING"}';
                    _this.socket.send(data);
                    ns.log('Send PING:', data);
                    _this.timeout = setTimeout(function() {
                        ns.log('PING timeout');
                        _this.timeout = null;
                        _this.socket.close(1000, 'ping');
                    }, 3 * 1000);
                };
                this.receive = function(msg) {
                    ns.log('Received PONG', msg);
                    if (!_this.allow || !_this.timeout) return;
                    clearTimeout(_this.timeout);
                    _this.timeout = null;
                };
                this.start = function() {
                    if (!_this.allow || _this.timer) return;
                    _this.timer = setInterval(_this.send.bind(_this), _this.interval * 1000);
                };
                this.stop = function() {
                    if (!_this.allow || !_this.timer) return;
                    clearInterval(_this.timer);
                    _this.timer = null;
                };
                this.allow = allow;
                this.socket = socket;
            }
            return Ping;
        })();
        var Client = /** @class */ (function() {
            function Client() {
                var _this = this;
                this.observers = new Observers();
                this.on = function(evt, target, callback) {
                    var idx = _this.observers[evt].findIndex(function(ele) {
                        return ele.target === target;
                    });
                    if (idx === -1) {
                        _this.observers[evt].push({ callback: callback, target: target });
                    }
                };
                this.off = function(evt, target) {
                    var idx = _this.observers[evt].findIndex(function(ele) {
                        return ele.target === target;
                    });
                    if (idx !== -1) {
                        _this.observers[evt].splice(idx, 1);
                    }
                };
                this.stop = function() {
                    if (_this.socket.readyState === Socket.CLOSED || _this.socket.readyState === Socket.CLOSING) {
                        return;
                    }
                    _this.socket.retryable = false;
                    _this.socket.close(1000, 'user');
                    _this.ping.stop();
                };
                this.start = function() {
                    if (!_this.isLogin || _this.socket.isRetrying || _this.socket.readyState === Socket.OPEN || _this.socket.readyState === Socket.CONNECTING) {
                        return;
                    }
                    _this.socket.retry.reset();
                    _this.socket.retryable = true;
                    _this.socket.open();
                    _this.ping.start();
                };
                this.socket = new Socket(function() {
                    return _this.buildurl();
                });
                this.ping = new Ping(this.socket, this.allowPing);
                this.socket.onopen = function(evt, isRetry) {
                    ns.log('Socket Client Opend', evt);
                    _this.onOpened(evt, isRetry);
                };
                this.socket.onerror = function(evt) {
                    ns.warn('Socket Client Connect Failed！', evt);
                    _this.onError(evt);
                };
                this.socket.onmessage = function(evt) {
                    ns.log('Socket Client Received message=', evt);
                    if (typeof evt.data !== 'string') return;
                    var msg = JSON.parse(evt.data);
                    if (msg.type == 'PONG') {
                        _this.ping.receive(msg);
                    } else {
                        _this.onMessage(msg);
                    }
                };
                this.socket.onclose = function(evt, reason) {
                    ns.log('Socket Client  Closed', evt);
                    _this.ping.stop();
                    _this.onClosed(evt, reason);
                };
            }
            Object.defineProperty(Client.prototype, 'allowPing', {
                get: function() {
                    return true;
                },
                enumerable: true,
                configurable: true
            });
            Client.prototype.buildurl = function() {
                return '';
            };
            Client.prototype.onError = function(res) {};
            Client.prototype.onOpened = function(res, isRetry) {};
            Client.prototype.onClosed = function(res) {};
            Client.prototype.onMessage = function(msg) {};
            Object.defineProperty(Client.prototype, 'isConnected', {
                get: function() {
                    return this.socket.readyState === Socket.OPEN;
                },
                enumerable: true,
                configurable: true
            });
            return Client;
        })();
        Socket.Client = Client;
    })(ns.Socket);

    ns.orm = {};
    (function(orm) {
        var FIELD_KEY = '__orm_field';
        var CLASS_KEY = '__orm_class';
        var INDEX_KEY = '__orm_index';
        var _stored = {};
        orm._storage = window.localStorage;
        function awake(cls, json) {
            if (!json) return undefined;
            var obj = new cls();
            Object.assign(obj, json);
            var fields = cls[FIELD_KEY];
            if (fields) {
                var _loop_1 = function(field_1) {
                    var subjson = obj[field_1];
                    if (!subjson) return 'continue';
                    if (Array.isArray(subjson)) {
                        obj[field_1] = subjson.map(function(json) {
                            return awake(fields[field_1], json);
                        });
                    } else {
                        obj[field_1] = awake(fields[field_1], subjson);
                    }
                };
                for (var field_1 in fields) {
                    _loop_1(field_1);
                }
            }
            return obj;
        }
        function getClskey(cls) {
            var clskey = cls && cls[CLASS_KEY];
            if (!clskey) {
                throw new Error('The Class:' + cls.name + " did't  mark with decorate @store(clsname,primary)");
            }
            return clskey;
        }
        function getIdxkey(cls) {
            var idxkey = cls && cls[INDEX_KEY];
            if (!idxkey) {
                throw new Error('The privkey:' + idxkey + ' of ' + cls.name + ' is invalid!');
            }
            return idxkey;
        }
        function getObjkey(clskey, id) {
            if (!clskey || !id) return null;
            return clskey + '.' + id;
        }
        function getItem(key) {
            var str = orm._storage.getItem(key);
            return str && JSON.parse(str);
        }
        function setItem(key, value) {
            var str = value && JSON.stringify(value);
            orm._storage.setItem(key, str);
        }
        function removeItem(key) {
            orm._storage.removeItem(key);
        }
        orm.store = function(clskey, idxkey) {
            if (!ns.okstr(clskey)) {
                throw new Error('The clskey:' + clskey + ' invalid!');
            }
            if (!ns.okstr(idxkey)) {
                throw new Error('The privkey:' + idxkey + ' invalid!');
            }
            if (_stored[clskey]) {
                throw new Error('The clskey:' + clskey + " already exist!!You can't mark different class with same name!!");
            }
            _stored[clskey] = true;
            return function(target) {
                target[CLASS_KEY] = clskey;
                target[INDEX_KEY] = idxkey;
            };
        };
        orm.field = function(cls) {
            return function(target, field) {
                var fields = target.constructor[FIELD_KEY] || (target.constructor[FIELD_KEY] = {});
                fields[field] = cls;
            };
        };
        orm.save = function(model) {
            if (!model) return;
            var clskey = getClskey(model.constructor);
            var idxkey = getIdxkey(model.constructor);
            var objkey = getObjkey(clskey, model[idxkey]);
            var keys = getItem(clskey) || {};
            keys[objkey] = '';
            setItem(clskey, keys);
            setItem(objkey, model);
        };
        orm.find = function(cls, id) {
            var clskey = getClskey(cls);
            var objkey = getObjkey(clskey, id);
            return awake(cls, getItem(objkey));
        };
        orm.ids = function(cls) {
            var clskey = getClskey(cls);
            var keys = getItem(clskey);
            return keys ? Object.keys(keys) : [];
        };
        orm.all = function(cls) {
            var keys = orm.ids(cls);
            var result = [];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                var obj = awake(cls, getItem(key));
                if (obj) {
                    result.push(obj);
                }
            }
            return result;
        };
        orm.count = function(cls) {
            return orm.ids(cls).length;
        };
        orm.clear = function(cls) {
            var clskey = getClskey(cls);
            var keys = getItem(clskey);
            if (keys) {
                for (var key in keys) {
                    removeItem(key);
                }
            }
            removeItem(clskey);
        };
        orm.remove = function(cls, id) {
            var clskey = getClskey(cls);
            var objkey = getObjkey(clskey, id);
            var keys = getItem(clskey);
            if (keys && keys[objkey]) {
                delete keys[objkey];
                removeItem(objkey);
                setItem(clskey, keys);
            }
        };
    })(ns.orm);
})(window.cm || (window.cm = {}));
