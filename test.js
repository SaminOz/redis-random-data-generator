var assert = require('assert');
var cp = require('child_process');
var fs = require('fs');
var Redis = require('redis-stream');
var config = {
  "server" : "127.0.0.1",
  "port" : "6379" 
};

cp.execFile('node', ['generator.js', 'string'], function(err, stdout, stderr){
  if (err) console.error(err);
  assert.equal(
    stdout, 
    'please pass <type> <qty> as command line parameters\ne.g. node generator.js string 100\n',
    '\033[31mFAILED!\033[39m one param: generator.js did NOT pass the correct error message to stdout'
  );
  process.stdout.write('\033[32mPASSED!\033[39m passing only one parameter throws the correct error message and exits\n');
});

cp.execFile('node', ['generator.js', 'string', '100', 'extra'], function(err, stdout, stderr){
  if (err) console.error(err);
  assert.equal(
    stdout, 
    'please pass <type> <qty> as command line parameters\ne.g. node generator.js string 100\n',
    '\033[31mFAILED!\033[39m three params: generator.js did NOT pass the correct error message to stdout'
  );
  process.stdout.write('\033[32mPASSED!\033[39m passing too many parameters throws the correct error message and exits\n');
});

cp.execFile('node', ['generator.js', 'string', 'string'], function(err, stdout, stderr){
  if (err) console.error(err);
  assert.equal(
    stdout, 
    'please pass <type> <qty> as command line parameters\ne.g. node generator.js string 100\n',
    '\033[31mFAILED!\033[39m wrong types: generator.js did NOT pass the correct error message to stdout'
  );
  process.stdout.write('\033[32mPASSED!\033[39m passing wrong parameter types throws the correct error message and exits\n');
});

cp.execFile('node', ['generator.js', 'string', '10000000'], function(err, stdout, stderr){
  if (err) console.error(err);
  assert.equal(
    stdout, 
    'current max qty is 1 million records\n',
    '\033[31mFAILED!\033[39m too many records requested: generator.js did NOT pass the correct error message to stdout'
  );
  process.stdout.write('\033[32mPASSED!\033[39m passing > 1000000 records requested throws the correct error message and exits\n');
});

cp.execFile('node', ['generator.js', 'unknownType', '100'], function(err, stdout, stderr){
  if (err) console.error(err);
  assert.equal(
    stdout, 
    'valid redis types are; string [SET], list [LPUSH], set [SADD], sorted[ZADD] and hash [HMSET]\n',
    '\033[31mFAILED!\033[39m unrecognized type: generator.js did NOT pass the correct error message to stdout' + stdout.toString()
  );
  process.stdout.write('\033[32mPASSED!\033[39m passing an unrecognized type throws the correct error message and exits\n');
});

;(function(){
  try {
    var checkConfig = fs.readFileSync('./config.json');
    assert.equal(
      typeof checkConfig,
      'object',
      '\033[31mFAILED!\033[39m config.json: no json object returned by config.json - it may or may not exist'
    );
    if( typeof checkConfig === 'object' ) config = JSON.parse(checkConfig.toString());
    process.stdout.write('\033[32mPASSED!\033[39m config.json exists\n');
  }
  catch( e ) {
    process.stdout.write('\033[31mFAILED!\033[39m config.json: no json object returned by config.json - it may or may not exist\n');
  }

}());

cp.exec('redis-cli -h ' + config.server + ' -p ' + config.port + ' ping' , (err, stdout, stderr ) => {
  if( err ) console.error( err );
  assert.equal(
    stdout,
    'PONG\n',
    '\033[31mFAILED!\033[39m no redis connection available on ' + config.server + ':' + config.port
  );
  process.stdout.write('\033[32mPASSED!\033[39m redis connection available on ' + config.server + ':' + config.port + '\n');
});

cp.execFile('node', ['generator.js', '-h'], function(err, stdout, stderr){
  if (err) console.error(err);
  var helpText = fs.readFileSync('help.txt');
  assert.equal(
    stdout, 
    helpText,
    '\033[31mFAILED!\033[39m help file (-h or --help): generator.js did NOT pass the correct error message to stdout' + stdout.toString()
  );
  process.stdout.write('\033[32mPASSED!\033[39m help file (-h or --help): outputs help file text via stdout\n');
});
