const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'posts'
    },
    comment : {
        type : String,
        required :true,
        trim : true,
        maxlength : 50
    }
},{
    timestamps : true
})

const Comment = mongoose.model('comments', commentSchema)

module.exports.Comment = Comment