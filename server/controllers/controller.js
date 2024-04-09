const md5 = require("md5");
const usersModel = require("../models/users");
const mongoose = require("mongoose");
const projectModel = require("../models/projects");
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

async function addProject(req, res, next) {
	const userData = res.locals.userData;
	const { title, description, members } = req.body;
	if (!title || !description || members.length === 0) {
		throw new CustomError("Invalid Request", 400);
	}
	const membersArr = members.map((ele) => new mongoose.Types.ObjectId(ele));

	const project = new projectModel({
		title: title,
		description: description,
		leader_id: new mongoose.Types.ObjectId(userData._id),
		members: membersArr,
		is_active: 1,
	});
	await project.save();
	ok200(res);
}
async function getProjects(req, res, next) {
	const projects = await projectModel.find({ is_active: 1 }).lean();
	ok200(res, { projects });
}
async function getProject(req, res, next) {
	const projectId = req.params.id;
	if (!mongoose.isValidObjectId(projectId)) {
		throw new CustomError("Invalid ProjectId", 400);
	}
	//const project = await projectModel.find
}
async function deleteProject(req, res, next) {
	const projectId = req.params.id;
	if (!mongoose.isValidObjectId(projectId)) {
		throw new CustomError("Invalid ProjectId", 400);
	}
	const project = await projectModel.findById(projectId);
	project.is_active = 0;
	project.save();
	ok200(res);
}
async function editProject(req, res, next) {
	const projectId = req.params.id;
	const userData = res.locals.userData;
	if (!mongoose.isValidObjectId(projectId)) {
		throw new CustomError("Invalid ProjectId", 400);
	}
	const project = await projectModel.find({ _id: projectId, leader_id: userData._id, is_active: 1 });
	if (!project) {
		throw new CustomError("Invalid ProjectId", 400);
	}
	const { title, description, leader_id, members } = req.body;
	const updates = {};
	if (title) {
		updates.title = title;
	}
	if (description) {
		updates.description = description;
	}
	if (leader_id) {
		updates.leader_id = new mongoose.Types.ObjectId(leader_id);
	}
	if (members) {
		updates.members = members.map((ele) => new mongoose.Types.ObjectId(ele));
	}
	const proj = await projectModel.updateOne({ _id: projectId }, { $set: updates });
	if (proj.matchedCount == 0 || proj.modifiedCount == 0) {
		throw new CustomError("Bad Request!!", 400);
	}
	ok200(res);
}
async function getUsers(req, res, next) {
	const { query } = req.query;
	const users = await usersModel
		.find({ is_active: 1, $or: [{ username: new RegExp(`${query}`) }, { fullname: new RegExp(`${query}`) }] })
		.limit(20)
		.lean();
	ok200(res, { users });
}
module.exports = { login, verify, register, addProject, getProjects, getProject, deleteProject, editProject, getUsers };
