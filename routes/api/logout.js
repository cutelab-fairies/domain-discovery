var auth = require(global.__dirname+"/modules/auth");

global.app.get("/api/logout", (req,res)=>{
	auth.deleteSessionCookie(res, req.cookies.session);
	res.redirect("/");
});