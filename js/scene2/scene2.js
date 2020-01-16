'use strict'

const fs = require("fs");
const express = require("express");
const common = require("../common/common");

exports = module.exports = scene2;

function scene2(params) {
    var app = params["app"];
    var __dirname = params["__dirname"];
}

var http = require('http');
var server = http.createServer(function(req, res) {
  fs.readFile(__dirname + '/scene2.html', 'utf-8', function(err, data){
  	if(err){
  		res.writeHead(404, {'Content-Type': 'text/plain'});
  		res.write("Page Not Found!!");
  		return res.end();
  	}
  	res.writeHead(200, {'Content-Type': 'text/html'});
  	res.write(data);
  	res.end();
  });
});

server.listen(8080);