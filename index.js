var Schema = require("truffle-contract-schema");
var Contract = require("./contract.js");
var fromSolJS = require("./lib/soljs.js");

var contract = function(options) {
  var binary = Schema.normalize(options || {});

  // Note we don't use `new` here at all. This will cause the class to
  // "mutate" instead of instantiate an instance.
  return Contract.clone(binary);
};

// To be used to upgrade old .sol.js abstractions
contract.fromSolJS = function(soljs_abstraction, ignore_default_network) {
  var json = fromSolJS(soljs_abstraction, ignore_default_network);

  return contract(json);
};

module.exports = contract;

if (typeof window !== "undefined") {
  window.TruffleContract = contract;
}
