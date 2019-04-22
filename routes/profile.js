global.app.get("/profile", global.isAuthed, (req,res)=>{

	let domains = req.user.domains;

	res.send(global.render(req, "profile", {
		username: req.user.username,
		domainsCount: domains.length+((domains.length==1)?" domain":" domains"),
	}));
});