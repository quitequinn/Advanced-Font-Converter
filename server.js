'use strict';

var express = require('express');
var multer = require('multer');

var newFilePath;
var oldFilePath;
var done = false;

var cmd = require('child_process');
var app = express();

app.use(multer({ dest: 'uploads',
  rename: function (fieldname, filename) {
    return filename + Date.now();
  },

  onFileUploadStart: function (file) {
    console.log(file.originalname + ' is starting ...');
  },

  onFileUploadComplete: function (file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path);
    convert_font(file.path);
  }
}));

app.post('/files',function(req,res) {
  if (done === true) {
    console.log(req.files);
    res.sendFile(newFilePath, function (err) {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      }
      else {
        console.log('Sent:', newFilePath);
        res.status('200').end();
        remove_file_sync(newFilePath);
      }
    });
  }
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});


////////////////////////
/// HELPER FUNCTIONS ///
////////////////////////
// (should probably reference these as modules from another file) // 

function convert_font(filePath) {
  // convert the font file to woff
  convert_file_sync(filePath);

  // give the files an absolute path
  name_old_file(filePath);
  name_new_file(filePath);

  // remove the old font file
  remove_file_sync(oldFilePath);

  // change permissions on converted file so we can send it in response body
  chmod_file_sync(newFilePath);
  done = true;
}

function name_old_file(file){
  oldFilePath = __dirname + '/' + file;
}

function name_new_file(file){
  newFilePath = __dirname + '/' + file.replace('.otf', '.woff2');
}

function remove_file_sync(filePath){
  cmd.spawnSync('rm', ['-rf', filePath]);
}

function convert_file_sync(filePath){
  cmd.spawnSync('./woff/woff2_compress', [filePath]);
}

function chmod_file_sync(filePath){
  require('fs').chmod(filePath, '0777', function(err){
    if(err) return err;
  });
}