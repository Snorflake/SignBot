username = '';
password = '';

var steam = require('steam');
var winston = require('winston');
var readline = require('readline');
var rl = readline.createInterface({input: process.stdin, output: process.stdout});
var fs = require('fs');

var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: true, 
                level: 'debug'
            }),
            new (winston.transports.File)({
                level: 'info', 
                timestamp: true, 
                filename: 'cratedump.log', 
                json: false
            })
        ]
});
 
 var client = new steam.SteamClient();

 if(fs.existsSync('servers.json'))
 {
 	steam.servers = JSON.parse(fs.readFileSync('servers.json'));
 }

 var sentryfile;
 if(fs.existsSync('sentryfile.' + username + '.hash'))
 {
 	sentryfile = fs.readFileSync('sentryfile.' + username + '.hash');
 }

 client.logOn({
 	accountName: username,
 	password: password,
 	shaSentryfile: sentryfile
 });

 client.on('error', function(e)
 {
 		if(e.eresult == steam.EResult.AccountLogonDenied)
 		{
 			rl.question('Steam Guard Code: ', function(code)
 			{
 				client.logOn({
 					accountName: username,
 					password: password,
 					authCode: code
 				});
 			});
 		} else {
 			logger.error('Steam Error: ' + e.eresult);
 		}
 });
client.on('chatInvite', function(chatRoomID, chatRoomName, patronID) {
  logger.info('Got an invite to ' + chatRoomName + ' from ' + client.users[patronID].playerName);
  client.joinChat(chatRoomID); // autojoin on invite
});
 client.on('sentry', function(sentry)
 {
 	logger.info('Got new sentry file hash from Steam. Saving.');
 	fs.writeFile('sentryfile.' + username + '.hash',sentry);
 });

 client.on('friend', function(steamID, relationship){
 	if(relationship == steam.EFriendRelationship.RequestRecipient)
 	{
 		logger.info('[' + steamID + '] Accepted friend request.');
 		client.addFriend(steamID);
 		client.sendMessage(steamID, 'Hi!\nI\'m $. You can access my interface with chat commands!\nType .help to get started.');
 	}
 	else if(relationship == steam.EFriendRelationship.None)
 	{
 		logger.info('[' + steamID + '] Un-friended.');
 	}
 });
 var antihash = false;
 function command(message,id,sender)
 {
 	logger.info('Command issued ' + message + ' by ' + id);
 	var space = message.indexOf(' ');
 	if(space == -1) space = message.length;
 	var substrd = message.substr(1,space);
 	if(substrd.charAt(substrd.length -1) == " ")
 		substrd = substrd.substr(0,substrd.length-1);
 	var allargs = message.substr(space + 1);
 	var args = message.split(" ");
 	
 	switch(substrd)
 	{
 		case 'help':
 			client.sendMessage(id,'.help\n.ping\n.say <message>\n.add [PROFILEID]');
 		break;
 		case 'ping':
 			client.sendMessage(id,'pong');
 		break;
 		case 'say':
 			client.sendMessage(id,allargs);
 		break;
 		case 'add':
 		if(typeof args[1] == 'undefined')
 		{
			client.addFriend(sender);
			client.sendMessage(id,'Added: ' + sender);
 		}
 		else
 		{
 			client.addFriend(args[1]);
 			client.sendMessage(id,'Added: ' + args[1]); 			
 			client.sendMessage(args[1], 'Hi!\nI\'m $. You can access my interface with chat commands!\nType .help to get started.');
 		}
 			
 	
 		break;
 		case 'antihash':
 			antihash = !antihash;
 			client.sendMessage(id, 'Antihash mode: ' + antihash);
 		break;
 		default:
 			client.sendMessage(id,'Unknown command ' + message);
 		break;
 	}
 }
 client.on('message', function(source, msg, type, chatter){
 	if(type == steam.EChatEntryType.ChatMsg)
 	{
 		logger.info('[' + source + '] MSG: ' + msg);
 		if(msg.substr(0,1) == ".")
 		{
 			command(msg,source,chatter);
 		}
 		if(msg.toLowerCase().indexOf('lamer') > -1)
 		{
 			if(!antihash)
 				return;
 			client.sendMessage(source,'skid*');
 		}
 		if(msg.toLowerCase().indexOf('hello') > -1)
 			client.sendMessage(source,'Hello!');
 		if(msg.toLowerCase().indexOf('mlu') > -1)
 		{
 			client.sendMessage(source,"minge losers united*");
 		}
 		if(msg.toLowerCase().indexOf('htx') > -1)
 		{
 			client.sendMessage(source, "htx is for nubs.");
 		}
 		if(msg.toLowerCase().indexOf('$') > -1)
 			client.sendMessage(source,"Yes?");
 		if(msg.toLowerCase().indexOf('snorflake') > -1)
 			client.sendMessage(source, "Hey, he's the best!");
 		if(msg.toLowerCase().indexOf('gmod') > -1)
 			client.sendMessage(source,'GUMAD*');
 		if(msg.toLowerCase().indexOf('right') > -1)
 			client.sendMessage(source, 'left');
 		if(msg.indexOf('+') > -1)
 		{
 			var args = msg.split("+");
 			var total = 0;
 			var sum = 0;
 			for(i = 0; i < 20; i ++)
 			{
 				if(typeof args[i] == 'undefined')
 					break;
 				sum = sum + parseInt(args[i]);
 			}
 			client.sendMessage(source,sum.toString());
 		}
 		if(msg.indexOf('*') > -1)
 		{
 			var args = msg.split("*");
 			var total = 0;
 			var sum = 1;
 			for(i = 0; i < 20; i ++)
 			{
 				if(typeof args[i] == 'undefined')
 					break;
 				sum = sum * parseInt(args[i]);
 			}
 			client.sendMessage(source,sum.toString());
 		}
 	}
 		
 	
 });
 client.on('loggedOn', function(){
 	logger.info('Logged in!');
 	client.setPersonaState(steam.EPersonaState.Online);
 	client.setPersonaName('[$]');
 	client.joinChat('103582791436028776');
 	//client.gamesPlayed([730]);
 });
 client.on('servers', function(servers)
 {
	fs.writeFile('servers.json',JSON.stringify(servers));
 });