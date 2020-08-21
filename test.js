global.window = {};
global.WebSocket = function () {};
require('./src/cmkit');
window.cm.kmbtfmt = function (value, symbol) {
    return value.toFixed(2) + symbol;
};
// var okint = window.cm.okint;
// var oknum = window.cm.oknum;
// console.log(Number(okint));
// console.log(okint('10'));
// console.log(okint('3213.11'));
// console.log(parseInt('-10.42423423a'));
// console.log((999).kmgtify(3)); //1M
// console.log((1000000).kmgtify(4)); //1,000K
// console.log((1010101).kmgtify(5)); //1,000K
// console.log((1000000).kmgtify(6)); //1,000K
// console.log((10000000).kmgtify(3)); //10M
// console.log((10000000).kmgtify(4)); //10M
// console.log((10000000).kmgtify(5)); //10,000K
// console.log((999999999999999).kmgtify(6)); //1G
// console.log((-100000).kmgtify(3));
// console.log(new Date().format('yyY MMM ddd hhh mmm sss'));

// console.log(window.cm.Network.encodeQuery({ a: 1, b: 2, c: [4, 5, 'haa'], d: true }));
// console.log(window.cm.Network.encodeQuery(true));

// var emter = window.cm.notice;
// var center = { name: 'hellow emiter' };
// emter.once('test1', center, function (test1) {
//     console.log('once this arg=', this);
//     console.log(test1);
// });
// emter.on('test1', center, function (test1) {
//     console.log('this arg=', this);
//     console.log(test1);
// });
// emter.emit('test1', 'i am msg1', 'i am msg2');
// emter.emit('test1', 'i am msg1', 'i am msg2');
// emter.offall();
// emter.off('test1');
// console.log(window.cm.Socket.Client);
var i18n = window.cm.i18n;
i18n.setData({ YOUR_KEY: 'example for i18n ${1} ${2}' });
console.log(i18n.localize('YOUR_KEY', 'hello', 'world'));
