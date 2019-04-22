var moment = require("moment");

global.__dirname = __dirname;
global = Object.assign(global, require(__dirname+"/modules/utils.js"));
global.config = require(__dirname+"/config.js");

global.log = msg=>{
	console.log("["+moment().format("YY-MM-DD HH:mm:ss")+"] "+msg);
}

// load modules
[
	"database",
	"webServer",

].forEach(moduleName=>{
	global.log("Loading module: "+moduleName);
	require(__dirname+"/modules/"+moduleName);
});