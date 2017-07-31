var LogUtils = require("./logs");
var ObjectUtils = require("./objects");

module.exports = {
  promisifyFunction: function(fn, C) {
    return function() {
      var instance = this;

      var args = Array.prototype.slice.call(arguments);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (ObjectUtils.is_object(last_arg) && !ObjectUtils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = ObjectUtils.merge(C.class_defaults, tx_params);

      return C.detectNetwork().then(function() {
        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      });
    };
  },
  synchronizeFunction: function(fn, instance, C) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (ObjectUtils.is_object(last_arg) && !ObjectUtils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = ObjectUtils.merge(C.class_defaults, tx_params);

      return C.detectNetwork().then(function() {
        return new Promise(function(accept, reject) {
          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  return accept({
                    tx: tx,
                    receipt: receipt,
                    logs: LogUtils.decodeLogs(C, instance, receipt.logs)
                  });
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      });
    };
  },
  parallel: function (arr, callback) {
    callback = callback || function () {};
    if (!arr.length) {
      return callback(null, []);
    }
    var index = 0;
    var results = new Array(arr.length);
    arr.forEach(function (fn, position) {
      fn(function (err, result) {
        if (err) {
          callback(err);
          callback = function () {};
        } else {
          index++;
          results[position] = result;
          if (index >= arr.length) {
            callback(null, results);
          }
        }
      });
    });
  }
}
