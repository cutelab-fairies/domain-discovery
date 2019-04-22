var bcrypt = require("bcrypt");
var moment = require("moment");

const hashPassword = (password)=>{
	global.log("Hashing password...");
	return new Promise((resolve,reject)=>{
		bcrypt.hash(password, global.config.saltRounds+0, (err, hash)=>{ 
			if (err) return reject(err);
			resolve(hash);
		});
	});
};

var userSessions = {}; // session id from cookie => {id, timeout} 

// restore session from database
global.db.sessions.find({}, (err, docs)=>{
	if (err) {
		global.log("Could not restore sessions from database");
		console.log(err);
		return;
	}

	docs.forEach(session=>{
		userSessions[session._id] = {
			id: session.userID,
			timeout: setTimeout(()=>{
				delete userSessions[session._id];
			}, moment(session.expire).diff(moment())),
		}
	});

	//console.log(userSessions);
});

module.exports = {
	hashPassword: hashPassword,
	registerUser: (username, email, password)=>{
		global.log("Registering user \""+username+"\"...")
		return new Promise((resolve,reject)=>{
			// verify data
			username = username.trim();
			if (username.length<4) return reject("Usernames must be between 4 to 24 characters");
			if (username.length>24) return reject("Usernames must be between 4 to 24 characters");
			if (/[^a-zA-Z0-9\.]/.test(username))
				return reject("Usernames must have letters, numbers or non-recurreing periods");
			if (/[\.]{2,9999}/.test(username))
				return reject("Usernames must have non-recurreing periods");

			email = email.toLowerCase().trim();
			
			// check if username or email exist
			global.db.users.findOne({
				$or: [
					{username: new RegExp(username, "i")},
					{email: new RegExp(email, "i")},
				]
			}, (err,user)=>{
				if (err) {
					global.log("Error whilst checking for duplicate users");
					console.log(err);
					return reject("Error whilst checking for duplicate users");
				}

				if (user!=null) return reject("Username/email already exists");
	
				// hash password and db
				hashPassword(password).then(hash=>{
					let user = new global.db.users();
					
					user.hash = hash;
					user.username = username;
					user.email = email;

					user.save(err=>{
						if (err) return reject("Error whilst adding user to database");
						global.log("User created");
						return resolve(user);
					});

				}).catch(err=>{
					global.log("Error whilst hashing password");
					console.log(err);
					return reject("Error whilst hashing password");
				});
			});
		});
	},
	changePassword: (username, password)=>{
		global.log("Changing password \""+user.username+"\"...");
		return new Promise((resolve,reject)=>{
			global.db.users.findOne({username: new RegExp(username, "i")}, (err,user)=>{
				if (err) {
					global.log("Error whilst finding user");
					console.log(err);
					return reject("Error whilst finding user");
				}

				if (user==null) return reject("User not found");

				// hash password and db
				hashPassword(password).then(hash=>{
					user.hash = hash;

					user.save(err=>{
						if (err) return reject("Error whilst updating user to database");
						global.log("User password updated");
						return resolve(user);
					});

				}).catch(err=>{
					global.log("Error whilst hashing password");
					console.log(err);
					return reject("Error whilst hashing password");
				});
			});
		});
	},
	checkSessionCookie: sessionID=>{
		return new Promise((resolve,reject)=>{
			if (!sessionID) return reject(); 
			
			let session = userSessions[sessionID];
			if (session==undefined) return reject();

			global.db.users.findById(session.id, (err,user)=>{
				if (err) {
					global.log("Error whilst finding user by id");
					console.log(err);
					return reject("");
				}

				if (user==null) return reject("");
				return resolve(user);
			});
		});
	},
	setSessionCookie: (res, user, ip)=>{
		return new Promise((resolve,reject)=>{
			let session = new global.db.sessions();

			session.userID = user._id;
			session.expire = moment().add(2, "weeks").toDate();
			session.ip = ip;

			session.save(err=>{
				if (err) {
					global.log("Failed to save session into database");
					console.log(err);
					return reject("Failed to save session into database");
				}

				res.cookie("session", session._id, {
					expires: session.expire,
					secure: false,
					path: "/"
				});

				userSessions[session._id] = {
					id: session.userID,
					timeout: setTimeout(()=>{
						delete userSessions[session._id];
					}, moment(session.expire).diff(moment())),
				};

				//console.log(userSessions);
				return resolve(session);
			});
		});

	},
	deleteSessionCookie: (res, sessionID)=>{
		res.clearCookie("session");

		let session = userSessions[sessionID];
		if (session!=undefined) {
			clearTimeout(session.timeout);
			delete userSessions[sessionID];
		}

		global.db.sessions.findByIdAndDelete(sessionID, err=>{
			if (err) {
				global.log("Failed to delete session from database");
				console.log(err);
				return;
			}

			//console.log(userSessions);
		});

	},
	checkAuth: (usernameEmail, password)=>{
		return new Promise((resolve,reject)=>{
			if (!usernameEmail && !password) return reject("No username or email given");
			usernameEmail = usernameEmail.toLowerCase().trim();

			global.db.users.findOne({
				$or: [
					{username: new RegExp(usernameEmail, "i")},
					{email: new RegExp(usernameEmail, "i")},
				]
			}, (err, user)=>{
				if (err) {
					global.log("Error whilst finding user");
					console.log(err);
					return reject("Error whilst finding user");
				}

				if (user==null) return reject("User not found");

				bcrypt.compare(password, user.hash, (err,hash)=>{
					if (err || !hash) {
						reject("Invalid password")
					} else {
						resolve(user);
					}
				});
			});
		});
	}
}