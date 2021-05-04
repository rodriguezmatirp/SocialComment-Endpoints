const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema({
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
    state : {
        type : Boolean,
        required : true
    }
},{
    timestamps : true
})

const Like = mongoose.model('likes', likeSchema)

module.exports.Like = Like