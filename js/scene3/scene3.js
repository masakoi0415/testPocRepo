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
//        case "postback":
//            handlePostBack(client, event, userId, dataObj)
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
    var pattern = new RegExp(/[0-9]{11}/);
    if (!pattern.test(text)) {
      return client.replyMessage(event.replyToken, {
        type: "text",
        text: `${pro.displayName}さん、「${event.message.text}」と入力されていますが、入力内容は11桁の半角数字を入力してください。`
      })
    } else {
        console.log("elseに入ったよ");
        var apiOpt = JSON.parse(JSON.stringify(reqOpts.API3_OPTION));
        var time = Date.now();
            var body = {
              request : { 
                businessData : {
                  argument : {
                    apidata : {
                      LLB0Z0093 : text
                    }
                  }
                },
                sysData : {
//                          trxNo : "123456789",
                          trxNo : time.toString(),
                          serverName : "node-web-servera",
                          userId : "linebot"+time.toString(),
                          url : "https://agency-devsta2.life8739.co.jp/customer/control/inq_cont/req0J"
                }
              }
            };
        apiOpt.body = JSON.stringify(body);
        console.log("request start");
        console.log("reqBody"+apiOpt.body);
        var api3Res = await common.requestSync(apiOpt);
        console.log("request end");
        console.log("resBody:"+api3Res.body);
        console.log("resStatus:"+api3Res.res.statusCode);

        if (api3Res.res.statusCode==200) {
          var resJson = await JSON.parse(api3Res.body);
          if (resJson.response.businessData.root.LLG0Z1372!=""){
            return client.replyMessage(event.replyToken, {
              type: "text",
              text: `存在しない証券番号です、入力内容を再度確認してください。`
            })
          }
          var policyNo = resJson.response.businessData.root.HEADER.LLB0Z0093;
          var planName = resJson.response.businessData.root.LLG0Z0037;
          var provisionStatus = resJson.response.businessData.root.MAINCLAUSE.LLB0Z0167_MAIN;
          var holderNameKanji = resJson.response.businessData.root.HEADER.LLD0Z0117;
          var holderNameKana = resJson.response.businessData.root.HEADER.LLD0Z0116;
          var insuredBirthYmd = resJson.response.businessData.root.LLB0Z0141;
          var insuredSex = resJson.response.businessData.root.LLB0Z0140;
          var insuredNameKanji = resJson.response.businessData.root.LLD0Z0159;
          var insuredNameKana = resJson.response.businessData.root.LLD0Z0158;
          console.log("provisionStatus"+provisionStatus);
          
          if(provisionStatus!=null && provisionStatus.substring(0,2)=="99") {
            return client.replyMessage(event.replyToken, {
              type: "text",
              text: `消滅契約です。`
            })
          }
          
          var uketorinin = "";
          var shiteidai = "";
          //var parties = resJson.response.businessData.root.RECORD2[0];
          //console.log("RECORD2:"+parties);
          //console.log("RECORD3:"+resJson.response.businessData.root.RECORD3.LLB0Z0246);
/*            for (let i=0; parties.length; i++) {
              var partiesObj=parties[i];
              console.log("partiesobj:"+partiesObj);
              for (let k in partiesObj) {
                if ( k=="LLB0Z0021_CD" && partiesObj[k]=="2") {
                  uketorinin=partiesObj[LLB0Z0021];
                } else if ( k=="LLB0Z0021_CD" && partiesObj[k]=="5") {
                  shiteidai=partiesObj[LLB0Z0021];
                }
              }
//LINEに出す？
死亡時支払金受取人：${uketorinin}
指定代理請求人：${shiteidai}
            }
*/
          var paymentMethod = resJson.response.businessData.root.LLB0Z0150;
          var premiumTotal = resJson.response.businessData.root.LLF0Z0129;

          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `${pro.displayName}さんのご契約情報詳細
証券番号：${policyNo}
商品名称：${planName}
契約者氏名（カナ）：${holderNameKanji}（${holderNameKana}）
被保険者  生年月日：${insuredBirthYmd}
被保険者  性別：${insuredSex}
被保険者  指名（カナ）：${insuredNameKanji}（${insuredNameKana}）
払込方法：${paymentMethod}
保険料：${premiumTotal}`
          })
        } else {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: `存在しない証券番号もしくは通信障害が発生しました。`
          })
        }
    }
}
