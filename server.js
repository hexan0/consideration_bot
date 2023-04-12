const http = require('http');
const querystring = require('querystring-es3');
const discord = require('discord.js');
const client = new discord.Client();

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
     if(dataObject.type == "text"){
      client.channels.get("1073897831837995060").sendMessage(dataObject.text);
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
 if (message.author.id == client.user.id){
   return;
 }
 //botに対してのメンションが含まれていたら
 if(message.isMemberMentioned(client.user)){
   sendReply(message, "呼びましたか？");
  sendMsg(message.channel.id, "てすと");
   return;
 }
//送られたメッセージが /helloだったら
 if(message.content == "hello"){
   message.channel.send("HELLO!");
   let text = "HELLO!";
   sendMsg(message.channel.id, text);
        //メッセージが送られたチャンネルに HELLO!と送信する
   return;
 }
 if (message.content.match(/にゃ～ん|にゃーん/)){
   let text = "にゃ～ん";
   sendMsg(message.channel.id, text);
   return;
 }
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
