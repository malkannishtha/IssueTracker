const mongoose = require('mongoose');

const issueSchema=new mongoose.Schema(
    {
        title:{type:String,trim:true},
        description:{type:String,trim:true},
        due_date:Date,
        user_id:{ type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
        status:{type:String},
        completion_date:Date,
        project_id:{ type: mongoose.SchemaTypes.ObjectId, ref: 'projects' },
        created_by: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
		updated_by: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },  
        is_active: { type: Number, default: 1 }
    },
    {timestamps:true}
)
const issuesModel = mongoose.model('issues', issueSchema);
module.exports =issuesModel;
