var
  os = require('os'),
  fs = require('fs'),
  stream = require('stream'),
  Redis = require('redis-stream'),
  uuid = require('node-uuid'),
  lorem = require('lorem-ipsum'),
  type = {
    'string': 'SET',
    'list': 'LPUSH',
    'set': 'SADD',
    'sorted': 'ZADD',
    'hash': 'HMSET',
    'lpush': 'LPUSH',
    'sadd': 'SADD',
    'zadd': 'ZADD',
    'hmset': 'HMSET'
  },
  trans = {
    'm': '000000',
    't': '000',
    'h': '00',
    'mill': '000000',
    'mil': '000000',
    'thou': '000',
    'hundred': '00',
    'million': '000000'
  },
  config = {
    "server": "127.0.0.1",
    "port": "6379"
  }
;

var 
  params = process.argv.splice(2),
  redis = null,
  rStream = null,
  start = Date.now(),
  end = null,
  elapsed = null
;

Generator.prototype = Object.create(stream.Readable.prototype, {
  constructor: {value: Generator }
});

function Generator( options ){
  stream.Readable.call(this, options);
  if( ! this._checkParams(params) ) process.exit();
  this._setConnection();
}

Generator.prototype._help = function( params ) {
  var helpOutput = fs.readFileSync('./help.txt');
  process.stdout.write( helpOutput );
};

Generator.prototype._setConnection = function(){
  try{
    config = JSON.parse(fs.readFileSync('../config.json'));
  }
  catch(e) {}
    
  if( ! config.server ) {
    process.stdout.write('using default redis server');
    config.server = "127.0.0.1";
  }

  if( ! config.port ) {
    process.stdout.write('using default redis port')
    config.port = "6379";
  }

  redis = new Redis(config.port, config.server);
  rStream = redis.stream();
}

Generator.prototype._checkParams = function( p ) {

  if( p.length && p[0].match(/^--?h(elp)?/)) {
    this._help(p);
    process.exit();
  }

  if( p.length < 2 || p.length > 2 ) {
    process.stdout.write('please pass <type> <qty> as command line parameters\ne.g. node generator.js string 100\n');
    return false;
  }
  else if( p.length === 2) {
    //check to see what we have (in whatever order - check for isNaN)
    if((typeof +p[0] === 'number' && +p[0] === +p[0] ) && typeof p[1] === 'string' ) {
      this.qty = +p[0];
      this.createType = p[1];
    }
    else if ((typeof (+p[1]) === 'number' && +p[1] === +p[1]) && typeof p[0] === 'string') {
      this.qty = +p[1];
      this.createType = p[0];
    }
    else {
      process.stdout.write('please pass <type> <qty> as command line parameters\ne.g. node generator.js string 100\n');
      return false;
    }

    if( this.qty > 1000000) {
      process.stdout.write('current max qty is 1 million records\n');
      return false;
    }

    if( ! (this.createType in type)) {
      process.stdout.write('valid redis types are; string [SET], list [LPUSH], set [SADD], sorted[ZADD] and hash [HMSET]\n');
      return false;
    }

    this.type = type[this.createType];
    this.limit = this.qty;
    return true;
  }
  return false;
}

Generator.prototype._getKey = function(){
  return uuid.v4(); 
};

Generator.prototype._getValue = function(){
  var
    input = []
  ;

  function random( fp ){
    if( !! fp ) return (Math.random() * 10);
    return Math.ceil( Math.random() * 10 );
  }

  switch( this.type ) {
    case 'SET':
      input.push( this.type );
      input.push( this._getKey() );
      input.push(lorem({count: random(), units: 'words'}));
      break;
    case 'SADD':
    case 'LPUSH':
      input.push( this.type );
      input.push( this._getKey());
      values = lorem({count: random(), units: 'words'}).split(' ');
      values.forEach((d) => {
        input.push(d);
      })
      break;
    case 'ZADD':
      input.push( this.type );
      input.push( this._getKey());
      values = lorem({count: random(), units: 'words'}).split(' ');
      var scores = values.reduce((r, n) => {
        r.push( random(true));
        r.push(n);
        return r;
      }, input);
      break;
    case 'HMSET':
      input.push( this.type );
      input.push( this._getKey());
      values = lorem({count: random(), units: 'words'}).split(' ');
      var fields = values.reduce((r, n, i) => {
        r.push( 'field_' + i);
        r.push(n);
        return r;
      }, input);
      break;
  }
  return input;
};

Generator.prototype._read = function(){
  if(this.limit === 0) {
    this.push(null);
  }
  else {
    this.push( Redis.parse( this._getValue()));
    this.limit--;
  }
}

var generator = new Generator();
generator.pipe(rStream.redis);
generator.on('end', function(err){
  end = Date.now();
  elapsed = (end - start);
  process.stdout.write('\033[32m' + this.qty + ' records of type ' + this.createType + ' were generated and inserted [' + this.type + '] into ' + config.server+ ':' + config.port + ' in ' + elapsed + 'ms.\033[39m \n');
  rStream.end();
});

