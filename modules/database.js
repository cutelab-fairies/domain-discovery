var mongoose = require("mongoose");

mongoose.connect("mongodb://"+global.config.mongo.address, {
	dbName: global.config.mongo.db,
	user: global.config.mongo.user,
	pass: global.config.mongo.pass,
	useNewUrlParser: true,
});

global.db = {
	users: mongoose.model("User", {
		created: {type: Date, default: Date.now},
		hash: String,

		username: String,
		email: String,

		domains: {type: Array, default: []}, // of ids
	}, "users"),

	sessions: mongoose.model("Session", {
		userID: mongoose.Schema.Types.ObjectId,
		expire: Date,
		ip: String,
	}, "sessions"),

	domains: mongoose.model("Domain", {
		created: Date,
		author: mongoose.Schema.Types.ObjectId, 

		name: {type: String, default: "My Domain"},
		description: {type: String, default: "This is my domain description"},

		address: String,
	}, "domains"),
};