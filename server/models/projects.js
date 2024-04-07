const mongoose = require('mongoose');

const projectsSchema=new mongoose.Schema(
    {
        title:{type:String,trim:true},
        description:{type:String,trim:true},
        leader_id:{ type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
        members:[{ type: mongoose.SchemaTypes.ObjectId, ref: 'users' }],
        is_active: { type: Number, default: 1 }
    },
    {timestamps:true}
)
const projectsModel = mongoose.model('projects', projectsSchema);
module.exports =projectsModel;
