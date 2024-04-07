require('dotenv').config();
const express=require('express');
const cors = require('cors');
const morgan=require('morgan');

const { errorHandler, interceptor } = require('./utils/routerUtils');
//const usersModel=require('./models/users');
//const projectsModel=require('./models/projects');
const dbConnect = require('./utils/dbConnect');
//const mongoose = require('mongoose');

const port = process.env.PORT || 3001;


const app=express();

app.use(cors({ maxAge: 3600 }));
app.use(interceptor);
app.use(morgan('dev'));
app.use(errorHandler);
dbConnect()
	.then(() => {
		app.listen(port, () => {
				console.log('http://localhost:' + port);
		});
	})
	.catch((err) => {
		console.log(err.message);
	});

//     async function add(){
 
//     const user = new projectsModel({
// 		title:'test',
//         description:'hellooooooo',
//         leader_id:new mongoose.Types.ObjectId('66128bc154d26b98ccd71eb2')
		
// 	});
// 	await user.save();
// }
// add();
