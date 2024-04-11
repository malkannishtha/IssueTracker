const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
	{
		username: { type: String, trim: true, unique: true },
		fullname: { type: String, trim: true },
		password: { type: String, select: false },
		email: { type: String, unique: true, trim: true },
		is_active: { type: Number, default: 1 },
	},
	{ timestamps: true }
);
const usersModel = mongoose.model("users", usersSchema);
module.exports = usersModel;
