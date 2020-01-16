'use strict'

const fs = require("fs");
const express = require("express");
const common = require("../common/common");

exports = module.exports = scene1;


function scene1(params) {
    var app = params["app"];
    var __dirname = common.variable.get("__dirname")
    
    app.use("/sales/css/", express.static("sales/css/"));
    app.use("/sales/fonts/", express.static("sales/fonts/"));
    app.use("/sales/images/", express.static("sales/images/"));
    app.use("/sales/scripts/", express.static("sales/scripts/"));
    app.get("/sales/",(req, res) => {
        if( req.url == "/sales") {
            res.redirect("/sales/")
        } else {
            var fileName = __dirname+"/sales/index.html";    
            var readFileStr = fs.readFileSync(fileName);
            res.write(readFileStr);
            res.end();
        }  
    });
    
}

