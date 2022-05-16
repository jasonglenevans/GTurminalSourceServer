const { exec } = require('node:child_process');
const process = require('process');
const path = require('path');
const fs = require('fs');
var ip = "";
var WebSocket = require('ws');
var ws = new WebSocket('wss://deciduous-flame-canidae.glitch.me',{
	url:'wss://deciduous-flame-canidae.glitch.me',
	headers:{
		'User-Agent':"Mozzila"
	}
});
var dir = "./";
ws.on('open', function() {
    //ws.send('something');
	console.log("connection opened to server.");
	ws.send(JSON.stringify({
		command:"sendFirstConnectInfo"
	}));
	setInterval(() => {
		ws.send(JSON.stringify({
			command:"tickPC"
		}));
	},1);
});
function runCommand(json) {
			exec(json.value,
			{
				cwd: path.join("./test",dir)
			},
			function (error, stdout, stderr) {
				//if (error) {
				//	ws.send(JSON.stringify({
				//		command:"logMessage",
				//		value:error
				//	}));
				//}
				if (stdout) {
					ws.send(JSON.stringify({
						command:"logMessage",
						value:stdout
					}));
				}
				if (stderr) {
					ws.send(JSON.stringify({
						command:"logMessage",
						value:stderr
					}));
				}
			}
			);
}
ws.on('message', function(data, flags) {
	try{
		var json = JSON.parse(data);
		if (json.command == "runCommand") {
			var command = json.value.split(" ");
			if (command[0].toLowerCase() == "npm") {
				ws.send(JSON.stringify({
					command:"logMessage",
					value:"sorry but i have npm on my pc, but its not allowed, do to saftey reasons. :/"
				}));
				return;
			}
			if (command[0].toLowerCase() == "start") {
				ws.send(JSON.stringify({
					command:"logMessage",
					value:"this command is not allowed, do to saftey reasons. :/"
				}));
				return;
			}
			if (command[0].toLowerCase() == "cls") {
				ws.send(JSON.stringify({
					command:"clearConsole"
				}));
				return;
			}
			if (command[0].toLowerCase() == "cd") {
				ws.send(JSON.stringify({
					command:"logMessage",
					value:"btw use the directory text box, dont do cd."
				}));
				return;
			}
			
			runCommand(json);
		}
		if (json.command == "logMessage") {
			//console.log(json.value);
		}
		if (json.command == "setDir") {
			dir = json.value;
		}
		if (json.command == "getCurrentDir") {
			ws.send(JSON.stringify({
				command:"currentDir",
				value:path.join(__dirname, dir)
			}));
		}
		if (json.command == "fsreadDirSync") {
			ws.send(JSON.stringify({
				command:"fsReadDirSyncRes",
				value:fs.readDirSync(path.join(__dirname,json.dir))
			}));
		}
		if (json.command == "fsreadFileSync") {
			ws.send(JSON.stringify({
				command:"fsReadFileSyncRes",
				value:fs.readFileSync(path.join(__dirname,json.dir))
			}));
		}
	}catch(e){}
});
/*exec('npm install ws',
function (error, stdout, stderr) {
	console.log("Error: "+error,"Stdout: "+stdout,"Stderr: "+stderr)
}
);*/

