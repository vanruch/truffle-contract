var Web3 = require("../web3");
var BigNumber = (new Web3()).toBigNumber(0).constructor;

module.exports = {
  is_object: function(val) {
    return typeof val == "object" && !Array.isArray(val);
  },
  is_big_number: function(val) {
    if (typeof val != "object") return false;

    // Instanceof won't work because we have multiple versions of Web3.
    try {
      new BigNumber(val);
      return true;
    } catch (e) {
      return false;
    }
  },
  merge: function() {
    var merged = {};
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < args.length; i++) {
      var object = args[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        merged[key] = value;
      }
    }

    return merged;
  }
}
