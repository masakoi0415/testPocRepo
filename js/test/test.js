'use strict'

const fs = require("fs");
const request = require("request");
const express = require("express");
const bodyParser = require("body-parser");
const common = require("../common/common");

exports = module.exports = test;

function test(params) {
    
    var app = params["app"];
    var __dirname = common.variable.get("__dirname")
    var lineDataFolderPath = __dirname + common.variable.get("lineDataFolderName")
        
    app.get("/test", (req, res) =>{
        var sessionPath = __dirname + "/sessions/";    
        var list = fs.readdirSync(sessionPath);
        res.write("dirPath : " + sessionPath + "\n")    
        res.write("file Num : " + list.length + "\n")
        for (var i = 0; i < list.length; i++) {
            var readStr = fs.readFileSync(sessionPath + list[i])
            res.write("#[" + list[i] + "]\n")
            res.write("\t" + readStr + "\n");
        }
        res.write("\n");
        list = fs.readdirSync(lineDataFolderPath);
        res.write("dirPath : " + lineDataFolderPath + "\n")    
        res.write("file Num : " + list.length + "\n")
        for (var i = 0; i < list.length; i++) {
            var readStr = fs.readFileSync(lineDataFolderPath + list[i])
            res.write("#[" + list[i] + "]\n")
            res.write("\t" + readStr + "\n");
        }    
        res.end();
    });
 
    app.use("/sales/util/print/business/poc/printProposal", bodyParser.urlencoded({extended:false}));
    app.use("/sales/util/print/business/poc/printProposal", bodyParser.json());
    app.post("/sales/util/print/business/poc/printProposal", async (req, res) => {
        res.writeHead(200, {"content-type":"application/json"});
        /*
        var ret = await common.requestSync(
            {
                "url" : "https://api.us-south.apiconnect.appdomain.cloud/appcorepocgmailcom-dev/sales/POCPermissionChkControllerVer/requestDataAndPdf",
                "method" : "GET",
                "headers" : {
                    "x-ibm-client-id" : "1faced10-3411-4f95-b4ee-7db67e960d7d"
                }
            }
        );
        var parse = JSON.parse(ret.body);
        var dataPdf = parse.pdf;
        */
        
        var fileStr = fs.readFileSync(__dirname + "/pdf/sample.pdf");
        var dataPdf = new Buffer.from(fileStr).toString("base64")
        
        var val1 = {
            "planDetail" : "planDetail_VAL",
            "basePolicy" : "basePolicy_VAL",
            "pdfUrl" : dataPdf,
            "errorList" : "errorList_VAL",
            "warningList" : "warningList_VAL",
            "singleChkMessageList" : "singleChkMessageList_VAL"
        }
    
        var retVal = {"result":val1}
        res.end(JSON.stringify(retVal));
    })
    
    app.get("/showPdf",(req, res) => {
        
        var filePath = lineDataFolderPath + req.query.id;
        var fileExist = fs.existsSync(filePath);

        if(fileExist){
            var data = fs.readFileSync(filePath);
            var objData = JSON.parse(data);
            var pdfFileBuffer = new Buffer.from(objData.data.pdf, "base64")
            res.writeHeader(200, {"content-type":"application/pdf"});
            res.end(pdfFileBuffer);    
        } else {
            res.end("req.query.id :: " + req.query.id);    
        }
    })

}

// BackDoor -----------------------------------------------------------------------------------------------
