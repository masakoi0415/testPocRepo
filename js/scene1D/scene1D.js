'use strict'

const fs = require("fs");
const express = require("express");
const common = require("../common/common");
const reqOpts = require("./apiConnectionOptionList.json");

exports.scene1DFunc1 = scene1DFunc1;

function scene1DFunc1(params){
    
    var event = params["event"];
    var client = params["client"];
    var userId = params["userId"];
    var dataObj = params["dataObj"];
    
    if (dataObj.data.phase) {
        switch (event.type) {
            case "message":
                var message = event.message;
                switch (message.type) {
                    case "text":
                        handleText(client, event, userId, dataObj)
                        return;
                    default:
                        return;
                }
            case "postback":
                handlePostBack(client, event, userId, dataObj)
                return;
            default:
                return;
        }
    } else {
        switch (event.type) {
            // LINE公式アカウントが友だち追加またはブロック解除されたことを示すイベント
            case "follow":
                dataObj.data.phase = 1;
                common.updateLineData(userId, dataObj);
                client.replyMessage(
                    event.replyToken, 
                    [
                        createMessageText("followイベント発生"),
                        {
                            type: "template",
                            altText: "Datetime pickers alt text",
                            template: {
                                type: "buttons",
                                text: "生年月日は？",
                                actions: [
                                    { type: "datetimepicker", label: "選択", data: "DATE", mode: "date" },
                                ],
                            },
                        }
                    ]
                );
                return;
            case "unfollow":
                common.deleteLineData(userId);
                return;
            default:
                return;
        }
    }
}


async function handleText(client, event, userId, dataObj) {
    
    var message = event.message
    var replyToken = event.replyToken
    var source = event.source
    
    var phase = dataObj.data.phase;
    var text = message.text.trim();
    // 「2」は性別の入力
    if ( phase == 2 ) {
        if ( text.trim() == "男" || text.trim() == "女" ) {
            dataObj.data.phase++;
            dataObj.data.sex = text; 
            common.updateLineData(userId, dataObj);
            client.replyMessage(
                event.replyToken, 
                [
                    createMessageText("性別は" + text + "です。"),
                    createMessageText("商品は？(あ・い)")
                ]
            );    
            return;
        } else {
            common.updateLineData(userId, dataObj);
            client.replyMessage(
                event.replyToken, 
                [
                    createMessageText("入力値が正しくないです。性別はなんですか？(男・女)")
                ]
            );    
            return;
        }
    // 「3」は商品の入力
    } else if ( phase == 3 ) {
        var api1Opt = JSON.parse(JSON.stringify(reqOpts.API1_OPTION));
        var pushOpt = JSON.parse(JSON.stringify(reqOpts.PUSH_OPTION));
        if ( text.trim() == "あ" || text.trim() == "い"){
            dataObj.data.phase++;
            dataObj.data.product = text;
            var body = {
                birthDay : dataObj.data.birthDay,
                sex : dataObj.data.sex,
                product : dataObj.data.product,
            }
            api1Opt.body = JSON.stringify(body)
            
            pushOpt.body.to = source.userId
            pushOpt.body.messages.push(createMessageText("商品は" + text + "です。"))
            pushOpt.body.messages.push(createMessageText("契約書作成中"))
            pushOpt.body = JSON.stringify(pushOpt.body);
            await common.requestSync(pushOpt)
            
            /*
            api1Ret = "";
            try{
                // 同期処理
                var api1Ret = await common.requestSync(api1Opt);
                var contentType = api1Ret.res.headers["content-type"];
                // responseCodeチェックは？
                if(!contentType.includes("application/json")){
                    client.replyMessage(
                        event.replyToken, 
                        [
                            createMessageText("通信エラー#1")
                        ]
                    );
                    return;    
                }
            } catch (err) {
                client.replyMessage(
                    event.replyToken, 
                    [
                        createMessageText("通信エラー#2")
                    ]
                );
                return;
            }
            api1Ret = JSON.parse(api1Ret.body);
            dataObj.data.pdf = api1Ret.pdf;
            */
            
            var fileStr = fs.readFileSync(common.variable.get("__dirname") + "/pdf/sample.pdf");
            var dataPdf = new Buffer.from(fileStr).toString("base64")
            dataObj.data.pdf = dataPdf;
            common.updateLineData(userId, dataObj);

            client.replyMessage(
                event.replyToken, 
                [
                    createMessageText(
                        "生年月日：" + dataObj.data.birthDay + "\n " +
                        "性別：" + dataObj.data.sex + "\n " +
                        "商品：" + dataObj.data.product + "\n " +
                        "Link1：\n line://app/1653655833-lA87bZON?id="+ userId + "\n" + 
                        "Link2：\n https://node-web-servera.us-south.cf.appdomain.cloud/showPdf?id=" + userId + "\n"
                    )
                ]
            );
            return;
                
            } else {
                client.replyMessage(
                    event.replyToken, 
                    [
                        createMessageText("入力値が正しくないです。商品は？(あ・い)")
                    ]
                );    
                return;
            }
    // 以外はリセットさせる。
    } else {
        dataObj.data.phase = 1;
        common.updateLineData(userId, dataObj);
        return client.replyMessage(
            replyToken,[
                createMessageText("わからない#3"),
                {
                    type: "template",
                    altText: "Datetime pickers alt text",
                    template: {
                        type: "buttons",
                        text: "生年月日は？",
                        actions: [
                            { type: "datetimepicker", label: "選択", data: "DATE", mode: "date" },
                        ],
                    },
                }
            ]
        );
    }
}

function handlePostBack(client, event, userId, dataObj) {
    var phase = dataObj.data.phase;
    // 「1」は生年月日の入力
    if ( phase == 1 ) {
        dataObj.data.phase++; 
        dataObj.data.birthDay = event.postback.params.date;
        common.updateLineData(userId, dataObj);
        client.replyMessage(
            event.replyToken, [
                createMessageText("生年月日は" + dataObj.data.birthDay + "です。"),
                {
                    type: "template",
                    altText: "Buttons alt text",
                    template: 
                    {
                        type: "buttons",
                        title: "My button sample",
                        text: "Hello, my button",
                        actions: 
                        [
                            { label: "男", type: "message", text: "男" },
                            { label: "女", type: "message", text: "女" }
                        ],
                    },
                }
            ]
        );
        return;
    } else {
        dataObj.data.phase = 1
        common.updateLineData(userId, dataObj);
        client.replyMessage(
            event.replyToken,[
                createMessageText("わからない#1"),
                {
                    type: "template",
                    altText: "Datetime pickers alt text",
                    template: {
                        type: "buttons",
                        text: "生年月日は？",
                        actions: [
                            { type: "datetimepicker", label: "選択", data: "DATE", mode: "date" },
                        ],
                    },
                }
            ]
        );
        return;
    }
}


function createMessageText(text){
    var ret = 
        {
            "type":"text",
            "text":text
        };
    return ret;
}
/*
function createMessageTemplate(altText, template) {
    var ret = 
        {
            "type":"template",
            "text":altText,
            "template":template
        };
    return ret;
}
    
function createMessageButton(title, text, actionsInfo){
    
    var actions = [];
    for(var i = 0 ; i < actionsInfo.length ; i++) {
        var action = {}
        var propertyNames = Object.getOwnPropertyNames(actionsInfo[i]);
        for ( var j = 0 ; propertyNames.length ; j ++ ){
            var key = propertyNames[j];
            var value = actionsInfo[i][key];
            action[key] = value;
        }
        actions.push(action);
    }
    
    var ret = 
        {
            "type": "buttons",
            "title": title,
            "text": text,
            "actions": actions
        };
    return ret;
}
*/