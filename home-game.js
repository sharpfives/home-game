#!/usr/local/bin/node
'use strict';

const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');

var port = 8080;
var webModules = [
  'phaser-ce'
];

console.log('Starting server on port ' + port);

var app = express();
var server = http.createServer(app);

webModules.forEach(modName => {
	var p = require.resolve(modName);
	p = path.dirname(p);
	console.log(p);
	app.use(`/lib/${modName}`, serveStatic(p));
});

app.use(express.static(path.join(__dirname,'www')));

server.listen(port);

process.on('exit', function(code) {
 	console.log('Exiting with code:', code);
});
