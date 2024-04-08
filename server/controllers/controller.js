const md5 = require("md5");
const usersModel = require("../models/users");
const { CustomError } = require("../utils/routerUtils");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ok200 } = require("../utils/responseUtils");

async function login(req, res, next) {
	const { username, password } = req.body;
	if (!username || !password) {
		throw new CustomError("Invalid Request", 400);
	}
	const user = await usersModel.findOne({ username, password: md5(password) });
	if (!user) {
		throw new CustomError("Invalid Credentials", 400);
	}
	const token = jwt.sign({ _id: user._id, username }, process.env.JWT_SECRET, {
		expiresIn: "1d",
	});
	res.json({ success: true, data: { token } });
}
async function verify(req, res, next) {
	res.json({ success: true, data: { ...res.locals.userData, iat: null, exp: null } });
}

async function register(req, res, next) {
	const { username, fullname, email, password } = req.body;
	if (!username || !password || !fullname || !email) {
		throw new CustomError("Invalid Request", 400);
	}
	const user = await usersModel.findOne({ username });
	if (user) {
		throw new CustomError("User Already Exists", 400);
	} else {
		const user = new usersModel({
			username: username,
			fullname: fullname,
			password: md5(password),
			email: email,
			is_active: 1,
		});
		await user.save();
	}
	ok200(res);
}
module.exports = { login, verify, register };
