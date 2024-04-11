const md5 = require("md5");
const usersModel = require("../models/users");
const mongoose = require("mongoose");
const projectModel = require("../models/projects");
const { CustomError } = require("../utils/routerUtils");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { ok200 } = require("../utils/responseUtils");
const issuesModel = require("../models/issues");
const { title } = require("process");

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
		.findOne({
			_id: projectId,
			is_active: 1,
			$or: [{ leader_id: user_id }, { members: { $in: [user_id] } }],
		})
		.populate("leader_id")
		.populate("members");

	const issues = await issuesModel.find({ project_id: project._id, is_active: 1 });
	ok200(res, { project, issues });
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
	const users = await usersModel
		.find({
			is_active: 1,
			$or: [{ username: new RegExp(`${query}`) }, { fullname: new RegExp(`${query}`) }],
			_id: { $ne: res.locals.userData._id },
		})
		.limit(20)
		.lean();
	ok200(res, { users });
}

async function addIssue(req, res, next) {
	const userData = res.locals.userData;
	const { title, description, due_date, project_id, user_id } = req.body;
	if (!title || !description || !due_date || !project_id || !user_id) {
		throw new CustomError("Invalid Request", 400);
	}
	const issue = new issuesModel({
		title: title,
		description: description,
		due_date: due_date,
		status: "TO-DO",
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
	const issue = await issuesModel.findOne({ _id: issueId, is_active: 1, created_by: res.locals.userData._id });
	if (!issue) {
		throw new CustomError("Unauthorised Access", 400);
	}
	issue.is_active = 0;
	issue.save();
	ok200(res);
}

async function getIssues(req, res, next) {
	const user_id = res.locals.userData._id;
	const issues = await issuesModel.find({ is_active: 1, user_id }).populate({ path: "project_id" });
	ok200(res, { issues });
}

async function getIssue(req, res, next) {
	const issueId = req.params.id;
	if (!mongoose.isValidObjectId(issueId)) {
		throw new CustomError("Invalid issueId", 400);
	}
	const user_id = new mongoose.Types.ObjectId(res.locals.userData._id);

	const issue = await issuesModel
		.findOne({ is_active: 1, _id: issueId })
		.populate("user_id")
		.populate({ path: "project_id", populate: { path: "members" } })
		.populate({ path: "project_id", populate: { path: "leader_id" } });

	if (!issue) {
		throw new CustomError("Issue not found", 400);
	} else {
		if (issue.project_id.leader_id._id.equals(user_id)) {
			ok200(res, { issue });
		} else if (
			issue.project_id.members.some((ele) => {
				return ele._id.equals(user_id);
			})
		) {
			ok200(res, { issue });
		} else {
			throw new CustomError("User does not have access to this issue", 400);
		}
	}
}

async function editIssue(req, res, next) {
	const issueId = req.params.id;
	const userId = new mongoose.Types.ObjectId(res.locals.userData._id);

	if (!mongoose.isValidObjectId(issueId)) {
		throw new CustomError("Invalid issueId", 400);
	}
	const { title, description, due_date, status, user_id } = req.body;
	const issue = await issuesModel.findOne({ _id: issueId, is_active: 1 });
	if (!issue) {
		throw new CustomError("Issue not found", 400);
	}
	const doneBool = issue.status == "DONE";
	if (userId.equals(issue.created_by)) {
		if (title) {
			issue.title = title;
		}
		if (description) {
			issue.description = description;
		}
		if (due_date) {
			issue.due_date = due_date;
		}
		if (status) {
			issue.status = status;
		}
		if (user_id) {
			issue.user_id = new mongoose.Types.ObjectId(user_id);
		}
	} else if (userId.equals(issue.user_id)) {
		if (status) {
			issue.status = status;
		}
	} else {
		throw new CustomError("You don't have permission to edit this issue", 400);
	}

	if (!doneBool && status == "DONE") {
		issue.completion_date = new Date();
	}

	await issue.save();
	ok200(res);
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
	getIssue,
	editIssue,
};
