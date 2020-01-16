/*
 Copyright 2019 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const express = require("express");
const session = require("express-session");
const fileStore = require("session-file-store")(session)
const fs = require("fs");
const request = require("request");
const bodyParser = require("body-parser");
//const path = require("path");
//const cp = require("child_process");
//const ngrok = require("ngrok");



const app = express();
const port = process.env.PORT || 3000;

// base URL for webhook server
let baseURL = process.env.BASE_URL;

// セッション設定
app.set("trust proxy", 1)
app.use(session({
	secret: "123456",
	resave: true,
	saveUninitialized: true,
	proxy: true,    

    store: new fileStore({
        reapInterval:5, // sec
        logFn : function(msg) {} //ログメッセージ出力をしたくない場合、、
    }),
    
    cookie : {
        secure: true,
        maxAge: 60000, // ms
    }
    
}));

/**
/* プロトコル変換（http -> https)
**/
function requireHTTPS(req, res, next) {
    var httpsPattern = /https/;
    var isHttps = httpsPattern.test(req.protocol);
    if(!isHttps) {
        req.session.destroy();
        res.redirect("https://" + req.headers.host + req.url);
    } else {
        next();
    }
}
/**
/* ラインのデータ保存ファイルのチェック処理
/*  ・ラインのデータ保存ファイルを読み込んで保存期間が過ぎた場合、ファイルを削除する。
**/
function checkLineDataExpires() {
    var lineDataFolderPath = common.variable.get("__dirname") + common.variable.get("lineDataFolderName")
    // ラインのデータ保存フォルダーのファイルリストを取得する。
    var fileList = fs.readdirSync(lineDataFolderPath);
    for (var i = 0 ; i < fileList.length ; i ++ ) {
        // ファイルから保存期間読み込む。
        var filePath = lineDataFolderPath + fileList[i];
        var data = fs.readFileSync(filePath);
        var objData = JSON.parse(data);
        var expires = new Date(objData.expires);
        // 保存期間が過ぎた場合、
        if( expires && expires <= Date.now()) {
            // ファイルを削除する。
            common.deleteLineData(fileList[i])
        }
    }
}

app.use(requireHTTPS);

const common = require("./js/common/common");
const scene1App = require("./js/scene1/scene1");
const scene1DApp = require("./js/scene1D/scene1D");
const scene2App = require("./js/scene2/scene2");
const scene3App = require("./js/scene3/scene3");
const lineApp = require("./js/line/line");
const testApp = require("./js/test/test");

common({"__dirname":__dirname})
scene1App({"app":app});
//scene1D(app,{});
scene2App({"app":app});
//scene3(app,{});
lineApp({"app":app});
testApp({"app":app});

app.listen(port, () => {
    var lineDataFolderPath = common.variable.get("__dirname") + common.variable.get("lineDataFolderName")
    // ラインのデータ保存フォルダーがない場合
    if ( !fs.existsSync(lineDataFolderPath)) {
        // ラインのデータ保存フォルダーを生成する
        fs.mkdirSync(lineDataFolderPath);
    }
    setInterval(checkLineDataExpires, common.variable.get("lineDataReapInterval"));
	console.log("Listening on http://localhost:" + port);
});

// ETC
app.get("*",(req, res) => {
    res.write("** welcome get **")
    res.end();
});

app.post("*",(req, res) => {
    res.write("** welcome post **")
    res.end();
});