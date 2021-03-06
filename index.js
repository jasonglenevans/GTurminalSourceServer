const { exec } = require('node:child_process');
const process = require('process');
const path = require('path');
const fs = require('fs');
var ip = "";
var WebSocket = require('ws');
var ws = null
function connect() {
ws = new WebSocket('wss://deciduous-flame-canidae.glitch.me',{
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
		try{
		ws.send(JSON.stringify({
			command:"tickPC"
		}));
		}catch(e){}
	},1);
});
ws.on('close', function() {
	connect();
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
				ws.send(JSON.stringify({
					command:"refreshFiles"
				}));
			}
			);
}
ws.on('message', function(data, flags) {
	try{
		var json = JSON.parse(data);
		if (json.command == "deleteFile") {
			console.log("removing: "+path.join(__dirname,"./test",dir,json.dir));
			fs.unlinkSync(path.join(__dirname,"./test",dir,json.dir));
			ws.send(JSON.stringify({
				command:"refreshFiles"
			}));
		}
		if (json.command == "runCommand") {
			var command = json.value.split(" ");
			/*if (command[0].toLowerCase() == "npm") {
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
			}*/
			if (command[0].toLowerCase() == "cls") {
				ws.send(JSON.stringify({
					command:"clearConsole"
				}));
				return;
			}
			/*
			if (command[0].toLowerCase() == "cd") {
				ws.send(JSON.stringify({
					command:"logMessage",
					value:"btw use the directory text box, dont do cd."
				}));
				return;
			}*/
			
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
				value:path.join(__dirname,"./test", dir)
			}));
		}
		if (json.command == "fsreadDirSync") {
			ws.send(JSON.stringify({
				command:"fsReadDirSyncRes",
				value:fs.readdirSync(path.join(__dirname,"./test",dir,json.dir))
			}));
		}
		if (json.command == "fsreadFileSync") {
			ws.send(JSON.stringify({
				command:"fsReadFileSyncRes",
				value:fs.readFileSync(path.join(__dirname,"./test",dir,json.dir),{encoding:json.encoding})
			}));
		}
		if (json.command == "fswriteFileSync") {
			fs.writeFileSync(path.join(__dirname,"./test",dir,json.dir),json.data,{encoding:json.encoding});
			ws.send(JSON.stringify({
				command:"refreshFiles"
			}));
		}
		if (json.command == "deleteDir") {
			fs.rmdirSync(path.join(__dirname,"./test",dir,json.dir),{ recursive: true });
			ws.send(JSON.stringify({
				command:"refreshFiles"
			}));
		}
		if (json.command == "httpGET") {
			var http = require('http');

			//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
			var options = {
			  host: json.host,
			  path: json.path
			};

			callback = function(response) {
			  var str = '';

			  //another chunk of data has been received, so append it to `str`
			  response.on('data', function (chunk) {
				str += chunk;
			  });

			  //the whole response has been received, so we just print it out here
			  response.on('end', function () {
				ws.send(JSON.stringify({
					command:"httpResponse",
					value:str
				}));
			  });
			}

			http.request(options, callback).end();
		}
	}catch(e){/* 
		ws.send(JSON.stringify({
			command:"logMessage",
			value:"*****\n"+e+"\n******"
		})); */
		console.error(e);
	}
});
/*exec('npm install ws',
function (error, stdout, stderr) {
	console.log("Error: "+error,"Stdout: "+stdout,"Stderr: "+stderr)
}
);*/
ws.on('error', function() {
	console.error("something went wong, retrying connection");
	connect();
});
}
connect()