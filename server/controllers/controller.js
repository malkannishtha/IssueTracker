const md5 = require("md5");
const usersModel = require("../models/users");
const mongoose = require("mongoose");
const projectModel = require("../models/projects");
const { CustomError } = require("../utils/routerUtils");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ok200 } = require("../utils/responseUtils");
const issuesModel = require("../models/issues");

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
	const user_id = new mongoose.Types.ObjectId(res.locals.userData._id);
	const projects = await projectModel
		.find({ is_active: 1, $or: [{ leader_id: user_id }, { members: { $in: [user_id] } }] })
		.populate("leader_id")
		.populate("members");
	ok200(res, { projects });
}
async function getProject(req, res, next) {
	const projectId = req.params.id;
	const user_id = new mongoose.Types.ObjectId(res.locals.userData._id);
	if (!mongoose.isValidObjectId(projectId)) {
		throw new CustomError("Invalid ProjectId", 400);
	}
	const project = await projectModel
		.find({
			_id: projectId,
			is_active: 1,
			$or: [{ leader_id: user_id }, { members: { $in: [user_id] } }],
		})
		.populate("leader_id")
		.populate("members");
	ok200(res, { project });
}
async function deleteProject(req, res, next) {
	const projectId = req.params.id;
	const user_id = new mongoose.Types.ObjectId(res.locals.userData._id);
	if (!mongoose.isValidObjectId(projectId)) {
		throw new CustomError("Invalid ProjectId", 400);
	}
	const project = await projectModel.findOne({ _id: projectId, leader_id: user_id, is_active: 1 });
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
	const { title, description, leader_id, members } = req.body;
	const project = await projectModel.findOne({ _id: projectId, leader_id: userData._id, is_active: 1 });
	if (!project) {
		throw new CustomError("Invalid ProjectId", 400);
	}

	if (title) {
		project.title = title;
	}
	if (description) {
		project.description = description;
	}
	if (leader_id) {
		project.leader_id = new mongoose.Types.ObjectId(leader_id);
	}
	if (members) {
		project.members = members.map((ele) => new mongoose.Types.ObjectId(ele));
	}
	await project.save();
	ok200(res);
}
async function getUsers(req, res, next) {
	const { query } = req.query;
	console.log(query);
	const users = await usersModel
		.find({ is_active: 1, $or: [{ username: new RegExp(`${query}`) }, { fullname: new RegExp(`${query}`) }] })
		.limit(20)
		.lean();
	ok200(res, { users });
}
async function addIssue(req, res, next) {
	const userData = res.locals.userData;
	const { title, description, due_date, status, project_id, user_id } = req.body;
	if (!title || !description || !due_date || !status || !project_id || !user_id) {
		throw new CustomError("Invalid Request", 400);
	}
	const issue = new issuesModel({
		title: title,
		description: description,
		due_date: due_date,
		status: status,
		project_id: new mongoose.Types.ObjectId(project_id),
		user_id: new mongoose.Types.ObjectId(user_id),
		created_by: new mongoose.Types.ObjectId(userData._id),
		is_active: 1,
	});

	await issue.save();
	ok200(res);
}
async function deleteIssue(req, res, next) {
	const issueId = req.params.id;
	if (!mongoose.isValidObjectId(issueId)) {
		throw new CustomError("Invalid ProjectId", 400);
	}
	const issue = await issuesModel.findOne({ _id: issueId, is_active: 1 });
	issue.is_active = 0;
	issue.save();
	ok200(res);
}
async function getIssues(req, res, next) {
	const user_id = new mongoose.Types.ObjectId(res.locals.userData._id);
	const project = await projectModel.find(
		{ $or: [{ leader_id: user_id }, { members: { $in: [user_id] } }] },
		{ is_active: 1 }
	);
	if (!project || project.length === 0) {
		throw new CustomError("No projects found for the user", 400);
	}
	const issues = await issuesModel
		.find({ is_active: 1, project_id: { $in: project.map((ele) => ele._id) } })
		.populate({ path: "project_id", populate: { path: "members" } });

	ok200(res, { issues });
}
module.exports = {
	login,
	verify,
	register,
	addProject,
	getProjects,
	getProject,
	deleteProject,
	editProject,
	getUsers,
	addIssue,
	deleteIssue,
	getIssues,
};
