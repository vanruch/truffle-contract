var ethJSABI = require("ethjs-abi");

var ObjectUtils = require("./objects");

module.exports = {
  decodeLogs: function(C, instance, logs) {
    return logs.map(function(log) {
      var logABI = C.events[log.topics[0]];

      if (logABI == null) {
        return null;
      }

      // This function has been adapted from web3's SolidityEvent.decode() method,
      // and built to work with ethjs-abi.

      var copy = ObjectUtils.merge({}, log);

      function partialABI(fullABI, indexed) {
        var inputs = fullABI.inputs.filter(function (i) {
          return i.indexed === indexed;
        });

        var partial = {
          inputs: inputs,
          name: fullABI.name,
          type: fullABI.type,
          anonymous: fullABI.anonymous
        };

        return partial;
      }

      var argTopics = logABI.anonymous ? copy.topics : copy.topics.slice(1);
      var indexedData = "0x" + argTopics.map(function (topics) { return topics.slice(2); }).join("");
      var indexedParams = ethJSABI.decodeEvent(partialABI(logABI, true), indexedData);

      var notIndexedData = copy.data;
      var notIndexedParams = ethJSABI.decodeEvent(partialABI(logABI, false), notIndexedData);

      copy.event = logABI.name;

      copy.args = logABI.inputs.reduce(function (acc, current) {
        var val = indexedParams[current.name];

        if (val === undefined) {
          val = notIndexedParams[current.name];
        }

        acc[current.name] = val;
        return acc;
      }, {});

      Object.keys(copy.args).forEach(function(key) {
        var val = copy.args[key];

        // We have BN. Convert it to BigNumber
        if (val.constructor.isBN) {
          copy.args[key] = C.web3.toBigNumber("0x" + val.toString(16));
        }
      });

      delete copy.data;
      delete copy.topics;

      return copy;
    }).filter(function(log) {
      return log != null;
    });
  }
}
