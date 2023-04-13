const http = require('http');
const querystring = require('querystring-es3');
const discord = require('discord.js');
const client = new discord.Client();
const axiosBase = require("axios"); // どこかに書いておく。
const url = "/macros/s/AKfycbyxPppdD_JIqMf4jcu2q4cZLYtLuN7Fa38nW5sSMP1BLtKs3IrOIJcHc9cBnZfjsfr3/exec"; // gasのドメイン以降のurl
//const data = {"key" : "value"}; // 送信するデータ
//let message = {};
const { decycle, encycle } = require('json-cyclic');

//GASへの送信
const axios = axiosBase.create({
    baseURL: "https://script.google.com", // gas以外の場合はそれぞれ書き換え
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
    responseType: "json",
});

//POSTの受信
http.createServer(function(req, res){
 if (req.method == 'POST'){
   var data = "";
   req.on('data', function(chunk){
     data += chunk;
   });
   req.on('end', function(){
     if(!data){
        console.log("No post data");
        res.end();
        return;
     }
     var dataObject = querystring.parse(data);
     console.log("post:" + dataObject.type);
    //起動維持のためのpostであるとき
     if(dataObject.type == "wake"){
      //glitchのログに表示
       console.log("Woke up in post");
       res.end();
       return;
     }
    //GASからのテキスト送信のためのpostであるとき
     if(dataObject.type == "text"){
      //client.channels.get("1073897831837995060").sendMessage(dataObject.text);
      client.channels.find(ch => ch.name === dataObject.channel_name).sendMessage(dataObject.text);
       res.end();
       return;
     }
     res.end();
   });
 }
 else if (req.method == 'GET'){
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end('Discord Bot is active now\n');
 }
}).listen(3000);

//起動時、コンソールにログ表示
client.on('ready', message =>{
 console.log('Bot準備完了！');
 //client.user.setPresence({ activity: { name: '検討' } });
 client.user.setActivity('検討', { type: 'PLAYING' })
});

//メッセージ受け取り時？
client.on('message', message =>{
 //自身のメッセージには反応しない
 //if (message.author.id == client.user.id){
 if(message.author.bot){
   return;
 }
 //botに対してのメンションが含まれていたら
 if(message.isMemberMentioned(client.user)){
   sendReply(message, "呼びましたか？");
  sendMsg(message.channel.id, "てすと");
   return;
 }
//送られたメッセージが /helloだったら
 /*if(message.content == "/hello"){
   message.channel.send("HELLO!");
   let text = "HELLO!";
   sendMsg(message.channel.id, text);
        //メッセージが送られたチャンネルに HELLO!と送信する
   return;
 }*/
 if (message.content.match(/にゃ～ん|にゃーん/)){
   let text = "にゃ～ん";
   sendMsg(message.channel.id, text);
   return;
 }
 //それ以外のときはGASにpost
 if(message.channel.name == "consideration-bot"){
   console.log(message.content);
  let decycled_message = decycle(message);
  decycled_message.content = message.content;
  axios.post(url, JSON.stringify(decycled_message))
    .then(async function (response) {
        const responsedata = response.data; // 受け取ったデータ一覧(object)
        console.log("post response");
        console.log(responsedata);
    })
    .catch(function (error) {
        console.log("ERROR!! occurred in Backend.");
        console.log(error);
    });
 }
 /*axios.post(url, message)
    .then(async function (response) {
        const responsedata = response.data; // 受け取ったデータ一覧(object)
        console.log("post response");
        console.log(responsedata);
    })
    .catch(function (error) {
        console.log("ERROR!! occurred in Backend.");
        console.log(error);
    });*/

});

if(process.env.DISCORD_BOT_TOKEN == undefined){
console.log('DISCORD_BOT_TOKENが設定されていません。');
process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

//リプライ"＠相手の名前, text"の送信
function sendReply(message, text){
 message.reply(text)
   .then(console.log("リプライ送信: " + text))
   .catch(console.error);
}

//メッセージ"text"の送信
function sendMsg(channelId, text, option={}){
 client.channels.get(channelId).send(text, option)
   .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
   .catch(console.error);
}


