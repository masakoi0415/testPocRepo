'use strict'
const fs = require("fs");
const express = require("express");
const common = require("../common/common");
const reqOpts = require("./apiConnectionOptionList.json");
exports.scene3Func = scene3Func;
function scene3Func(params){
    console.log("start");
    var event = params["event"];
    var client = params["client"];
    var userId = params["userId"];
    var dataObj = params["dataObj"];
    
    var message = event.message;
    
    switch (event.type) {
        case "message":
            var message = event.message;
            console.log("event.messagestart");
            switch (message.type) {
                case "text":
                    console.log("event.messagestart txt");
                    handleText(client, event, userId, dataObj)
                    return;
                default:
                    console.log("event.messagestart default");
                    return;
            }
        case "postback":
            handlePostBack(client, event, userId, dataObj)
            return;
        default:
            return;
    }
}


async function handleText(client, event, userId, dataObj) {
    
    var message = event.message
    var replyToken = event.replyToken
    var source = event.source
    var text = message.text;
    var pro = await client.getProfile(event.source.userId);
    console.log("massagelength if文start");
    console.log("massagelength="+text.length);
    if (text.length != 11 || isNaN(parseInt(text))) {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: `${pro.displayName}さん、「${event.message.text}」と入力されていますが、入力内容は11桁の半角数字を入力してください。`
      })
    } else {
        console.log("elseに入ったよ");
        var apiOpt = JSON.parse(JSON.stringify(reqOpts.API3_OPTION));
        apiOpt.body = JSON.stringify(body);
            var body = {
                  sysData : {
                             LLB0Z0093 : 10024400102,
                  }
//                "userId" : userId,
            };
        apiOpt.body = JSON.stringify(body);
        console.log("request start");
        console.log("reqBody"+apiOpt.body);
        var api3Res = await common.requestSync(apiOpt);
        console.log("request end");
//        console.log("resHeader:"+api3Res.res.headers);
        console.log("resBody:"+api3Res.body);
        
        console.log("resStatus:"+api3Res.res.statusCode);
        if (api3Res.res.statusCode==200) {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `ご契約情報詳細\r\n証券番号：api3Res.body\r\n商品名称：XXXXX\r\n氏名（カナ）：XXXXXX\r\n被保険者  生年月日：XXXXX\r\n      性別：XXXXXX\r\n死亡時受取人：XXXXXX\r\n指定代理請求人：XXXXXX\r\n払込方法：月払\r\n保険料：XXXXXXX`
          })
        } else {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `ご契約情報詳細\r\n証券番号：10024400102\r\n商品名称：はなさく医療\r\n氏名（カナ）：蒲田一郎（カマタ イチロウ）\r\n被保険者  生年月日：XXXXX\r\n      性別：XXXXXX\r\n死亡時受取人：XXXXXX\r\n指定代理請求人：XXXXXX\r\n払込方法：月払\r\n保険料：XXXXXXX`
          })
        }
//ToDo resからとってきてはめる
//        var pushOpt = JSON.parse(JSON.stringify(reqOpts.PUSH_OPTION));
//            pushOpt.body.messages.push(createMessageText("商品は" + text + "です。"));
//            pushOpt.body.messages.push(createMessageText("商品は" + text + "です。"));
//            await common.requestSync(tmp);
//      return client.replyMessage(event.replyToken, {
//        type: "text",
//        text: `${pro.displayName}さん、通信中です少々お待ちください`
//    })
  }
}

/*
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
*/
