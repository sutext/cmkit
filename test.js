global.window = {};
global.WebSocket = function() {};
require('./src/cmkit');
console.log((999).kmgtify(3)); //1M
console.log((1000000).kmgtify(4)); //1,000K
console.log((1000000).kmgtify(5)); //1,000K
console.log((1000000).kmgtify(6)); //1,000K
console.log((10000000).kmgtify(3)); //10M
console.log((10000000).kmgtify(4)); //10M
console.log((10000000).kmgtify(5)); //10,000K
console.log((999999999999999).kmgtify(6)); //1G
