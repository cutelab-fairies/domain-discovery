global.app.get("/", (req,res)=>{
	res.send(global.render(req, "index", {
		test: "I love youuu",
		doI: "yess!!"
	}));
});