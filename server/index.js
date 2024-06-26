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
	getIssue,
	editIssue,
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

app.post("/signup", asyncRouteHandler(register));
app.post("/login", asyncRouteHandler(login));

app.use(authMiddleware());

app.get("/verify", asyncRouteHandler(verify));

app.get("/projects", asyncRouteHandler(getProjects));
app.get("/projects/:id", asyncRouteHandler(getProject));
app.post("/projects", asyncRouteHandler(addProject));
app.patch("/projects/:id", asyncRouteHandler(editProject));
app.delete("/projects/:id", asyncRouteHandler(deleteProject));

//get all issues of a user
app.get("/issues", asyncRouteHandler(getIssues));
app.get("/issues/:id", asyncRouteHandler(getIssue));
app.post("/issues", asyncRouteHandler(addIssue));
app.patch("/issues/:id", asyncRouteHandler(editIssue));
app.delete("/issues/:id", asyncRouteHandler(deleteIssue));

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
