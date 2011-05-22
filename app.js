
/**
 * Module dependencies.
 */

var express = require('express');
var sys = require('sys');

var app = express.createServer();

// Mongo Setup
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var Connection = require('mongodb').Connection;


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['sass'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

function loadCompanies(req, res, next) {
  var db = new Db('express-test', new Server('localhost', Connection.DEFAULT_PORT, {}), {native_parser:true});

  db.open(function(err, db) {
    db.collection('companies', function(err, collection) {
      collection.find(function(err, cursor) {
        cursor.toArray(function(err, docs) {
          req.companies = docs;
          db.close();
          next();
        });
      });
    });
  });
}

app.get('/', loadCompanies, function(req, res) {
  res.render('index', {
    title: 'Apprentice Us',
    companies: req.companies
  });
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d", app.address().port);
}
