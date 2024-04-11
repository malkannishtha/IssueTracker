require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { errorHandler, interceptor, asyncRouteHandler } = require("./utils/routerUtils");
const usersModel = require("./models/users");
//const projectsModel=require('./models/projects');
const dbConnect = require("./utils/dbConnect");
const {
	login,
	register,
	addProject,
	verify,
	getProjects,
	deleteProject,
	getUsers,
	editProject,
	getProject,
	addIssue,
	deleteIssue,
	getIssues,
} = require("./controllers/controller");
const md5 = require("md5");
const { authMiddleware } = require("./middleware/auth-middleware");

//const mongoose = require('mongoose');

const port = process.env.PORT || 3001;

const app = express();

app.use(cors({ maxAge: 3600 }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(interceptor);
app.use(morgan("dev"));
app.use(express.static("public"));
app.post("/signup", asyncRouteHandler(register));
app.post("/login", asyncRouteHandler(login));
app.use(authMiddleware());
app.get("/verify", asyncRouteHandler(verify));
app.post("/user/projects", asyncRouteHandler(addProject));
app.get("/user/projects", asyncRouteHandler(getProjects));
app.get("/user/projects/:id", asyncRouteHandler(getProject));
app.delete("/user/projects/:id", asyncRouteHandler(deleteProject));
app.patch("/user/projects/:id", asyncRouteHandler(editProject));
//get all issues of a user
app.get("/user/issues", asyncRouteHandler(getIssues));
app.post("/user/issues", asyncRouteHandler(addIssue));
app.delete("/user/issues/:id", asyncRouteHandler(deleteIssue));
//get all users based on query
app.get("/users", asyncRouteHandler(getUsers));
app.use(errorHandler);
dbConnect()
	.then(() => {
		app.listen(port, () => {
			console.log("http://localhost:" + port);
		});
	})
	.catch((err) => {
		console.log(err.message);
	});
// async function add() {
// 	const user = new usersModel({
// 		username: "210170116022",
// 		password: md5("123"),
// 		email: "nishthamalkan20@gmail.com",
// 	});
// 	await user.save();
// }
// add();
