var ObjectUtils = require("./objects");
var LogUtils = require("./logs");
var FunctionUtils = require("./functions");

var Utils = {
  is_object: ObjectUtils.is_object,
  is_big_number: ObjectUtils.is_big_number,
  merge: ObjectUtils.merge,
  decodeLogs: LogUtils.decodeLogs,
  promisifyFunction: FunctionUtils.promisifyFunction,
  synchronizeFunction: FunctionUtils.synchronizeFunction,
  parallel: FunctionUtils.parallel,
  bootstrap: function(fn) {
    // Add our static methods
    Object.keys(fn._static_methods).forEach(function(key) {
      fn[key] = fn._static_methods[key].bind(fn);
    });

    // Add our properties.
    Object.keys(fn._properties).forEach(function(key) {
      fn.addProp(key, fn._properties[key]);
    });

    return fn;
  },
  linkBytecode: function(bytecode, links) {
    Object.keys(links).forEach(function(library_name) {
      var library_address = links[library_name];
      var regex = new RegExp("__" + library_name + "_+", "g");

      bytecode = bytecode.replace(regex, library_address.replace("0x", ""));
    });

    return bytecode;
  }
};

module.exports = Utils;
