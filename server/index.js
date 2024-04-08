require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/routes");
const { errorHandler, interceptor, asyncRouteHandler } = require("./utils/routerUtils");
const usersModel = require("./models/users");
//const projectsModel=require('./models/projects');
const dbConnect = require("./utils/dbConnect");
const { login, register } = require("./controllers/controller");
const md5 = require("md5");
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
app.use("/user", userRoutes);
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
