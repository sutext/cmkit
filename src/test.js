global.window = { localStoage: {}, WebSocket: {} };
global.WebSocket = {};
require('../web/index');
var emter = window.cm.notice;
var center = { name: 'hellow emiter' };
emter.once('test1', center, function (test1) {
    console.log('once this arg=', this);
    console.log(test1);
});
emter.on('test1', center, function (test1) {
    console.log('this arg=', this);
    console.log(test1);
});
emter.emit('test1', 'i am msg1', 'i am msg2');
emter.emit('test1', 'i am msg1', 'i am msg2');
emter.offall();
emter.off('test1');
console.log(window.cm.Socket.Client);
