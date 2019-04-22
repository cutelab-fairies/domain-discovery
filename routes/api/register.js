var request = require("request-promise-native");
var auth = require(global.__dirname+"/modules/auth");

global.app.post("/api/register", async (req,res)=>{
	if (!req.body.username) return res.redirect("/?alert=No username specified");
	if (!req.body.email) return res.redirect("/?alert=No email specified");
	if (!req.body.password) return res.redirect("/?alert=No password specified");
	if (!req.body["g-recaptcha-response"]) return res.redirect("/?alert=Invalid captcha");

	try {
		let json = await request({
			url: "https://www.google.com/recaptcha/api/siteverify",
			method: 'POST',
			form: {
				secret: global.config.recaptcha.secret,
				response: req.body["g-recaptcha-response"],
				remoteip: req.ip,
			},
		});

		json = JSON.parse(json);
		if (!json.success) return res.redirect("/?alert=Google says you're a robot");
	} catch(err) {
		return res.redirect("/?alert=Unable to validate captcha");
	}

	auth.registerUser(req.body.username, req.body.email, req.body.password).then(user=>{
		auth.setSessionCookie(res, user, req.ip).then(session=>{
			return res.redirect("/?alert="+user.username+" has been registered!");
		});
	}).catch(err=>{
		//res.send(err)
		return res.redirect("/?alert="+err);
	});

});