var fs = require("fs");

module.exports = {
	render: (req, view, shortcodes)=>{
		let header = fs.readFileSync(global.__dirname+"/views/header.html", "utf8");
		
		header = header.replace(/\[title\]/gi, global.config.title);
		header = header.replace(/\[recaptchaSiteKey\]/gi, global.config.recaptcha.site);

		// logged in
		if (req.user) {
			header = header.replace(/<!--logged-in([\s\S]*?)-->/, "$1");
			header = header.replace(/\[username\]/gi, req.user.username);
		} else {
			header = header.replace(/<!--logged-out([\s\S]*?)-->/, "$1");
		}
		
		// fill content with [key] => value
		let content = fs.readFileSync(global.__dirname+"/views/"+view+".html", "utf8");
		
		Object.keys(shortcodes).forEach(shortcodeKey=>{
			content = content.replace(
				new RegExp("\\["+shortcodeKey+"\\]", "gi"),
				shortcodes[shortcodeKey]
			);
		});

		return header.replace(/\[content\]/gi, content);
	},

	generateString: (lowercase, uppercase, numbers, length)=>{
		let chars = "";
		if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
		if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		if (numbers) chars += "0123456789";
		chars = chars.split("");

		let out = "";
		for (var i=0; i<length; i++) {
			out += chars[Math.floor(Math.random()*chars.length)];
		}
		return out;
	},
}