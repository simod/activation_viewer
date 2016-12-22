var browserify = require('browserify');
var watchify = require('watchify');
var through = require('through');
var archiver = require('archiver');
var fs = require('fs-extra');
var path = require('path');
var replaceStream = require('replacestream');
var cp = require('child_process');

var exports = module.exports;

exports.createBuildDir = function() {
  var dir = 'build';
  fs.ensureDir(dir, function (err) {
    if (err) {
      console.log(err);
    }
  });
};

exports.startServer = function(entryPoint) {
  function globalOl(file) {
    var data = '';
    function write(buf) { data += buf; }
    function end() {
      this.queue(data.replace(/require\(["']openlayers['"]\)/g, 'window.ol'));
      this.queue(null);
    }
    return through(write, end);
  }

  var b_home = browserify({
    entries: ['./home.jsx'],
    debug: true,
    plugin: [watchify],
    cache: {},
    packageCache: {}
  }).transform(globalOl, {global: true});

  var b_composer = browserify({
    entries: ['./composer.jsx'],
    debug: true,
    plugin: [watchify],
    cache: {},
    packageCache: {}
  }).transform(globalOl, {global: true});

  var homeOutFile = './build/home-debug.js';
  var composerOutFile = './build/composer-debug.js';
  var childProcess;

  b_home.on('update', function bundle(onError) {
    var stream = b_home.bundle();
    if (onError) {
      stream.on('error', function(err) {
        console.log(err.message);
        childProcess.kill('SIGINT');
        process.exit(1);
      });
    }
    stream.pipe(fs.createWriteStream(homeOutFile));
  });

  b_home.bundle(function(err, buf) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    } else {
      fs.writeFile(homeOutFile, buf, 'utf-8');
      childProcess = cp.fork(path.join(path.dirname(require.resolve('openlayers')),
          '../tasks/serve-lib.js'), []);
    }
  });

  b_composer.on('update', function bundle(onError) {
    var stream = b_composer.bundle();
    if (onError) {
      stream.on('error', function(err) {
        console.log(err.message);
        childProcess.kill('SIGINT');
        process.exit(1);
      });
    }
    stream.pipe(fs.createWriteStream(composerOutFile));
  });

  b_composer.bundle(function(err, buf) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    } else {
      fs.writeFile(composerOutFile, buf, 'utf-8');
    }
  });
};
