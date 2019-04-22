var express = require("express");
var auth = require(global.__dirname+"/modules/auth");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

global.app = express();

// general middle ware
global.app.use((req,res,next)=>{
	// logging
	let ip = req.connection.remoteAddress.split(":")[3];
	req.ip = ip;
	global.log(ip+" => "+req.originalUrl);

	// hehe :)
	res.removeHeader("X-Powered-By");
	res.set({"Powered-By": "The Cutelab Fairies!"});

	next();
});

global.app.use(express.static(global.__dirname+"/static"));

// parsers
global.app.use(cookieParser());
global.app.use(bodyParser.urlencoded({extended: true}));
global.app.use(bodyParser.json());

// auth middle ware
global.isAuthed = function(req,res,next) {
	if (req.user) {
		next();
	} else {
		res.redirect("/?alert=Login or register to visit this page");
	}
}

// make req.user available
global.app.use((req,res,next)=>{
	if (req.cookies.session==undefined) {
		// not logged in
		req.user = null;
		return next();
	} else {
		// logged in
		auth.checkSessionCookie(req.cookies.session).then(user=>{
			req.user = user;
			return next();
		}).catch(err=>{
			// session expired or not found
			req.user = null;
			return next();
		});
	}
});

// load routes
[
	"index",
	"profile",

	"api/login",
	"api/logout",
	"api/register",

].forEach(routeName=>{
	global.log("Loading route: "+routeName);
	require(global.__dirname+"/routes/"+routeName);
});

// redirect to home page
global.app.get("*", (req,res)=>{
	res.redirect("/");
});

global.app.listen(global.config.port, ()=>{
	global.log("Web server is running on *:"+global.config.port);
});