var vm = require('vm');
var fs = require('fs');

var filename = process.argv[2];
var isCoffee = /\.coffee$/.test(filename);
var code = fs.readFileSync(filename, 'utf8');

var context = { console, require };
for (var prop in global) {
  context[prop] = global[prop];
}

require('domain')
  .create()
  .on('error', function(error) {
    console.error("\u001b[31m" + error.stack + "\u001b[39m");
  })
  .run(function() {
    process.nextTick(function() {
      if (isCoffee) {
        code = require('coffeescript').compile(code, { bare: true });
      }
      vm.runInNewContext('"use strict";\n' + code, context, {
        filename: filename,
        lineOffset: -1
      });
    });
  });

var checkCompletion = function() {
  if (process._getActiveHandles().length + process._getActiveRequests().length > 3) return;

  clearInterval(interval);

  setTimeout(function() {
    var repl = require(isCoffee ? 'coffeescript/repl' : 'repl');

    repl = repl.start({
      prompt:    isCoffee ? '>  ' : '>  ',
      terminal:  true,
      useColors: true
    });

    for (var prop in context) {
      repl.context.hahaha = 'abc';
      repl.context[prop] = context[prop];
    }
  }, 25); // gives chance for buffer to clear before starting prompt
};

var interval = setInterval(checkCompletion, 25);