var debug = true;

var config = {
	port: 8080,
	
	name: "My Domain Discovery",
	title: "My Domain Discovery",
	
	saltRounds: 10,

	mongo: {
		address: "127.0.0.1",
		db: "domainDiscovery",
		user: "",
		pass: "",
	},

	recaptcha: {
		site: "",
		secret: "",
	},
};

if (debug) {
	config.recaptcha = {
		site: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
		secret: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe",
	}
}

module.exports = config;