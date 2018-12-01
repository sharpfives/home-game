#!/usr/local/bin/node
'use strict';

const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const express = require('express');

let port = 8080;

console.log(`Running Home on port ${port}`);

let app = express();
let server = http.createServer(app);

app.use(express.static(path.join(__dirname,'www')));

server.listen(port);

process.on('exit', function(code) {
 	console.log('Exiting with code:', code);
});
