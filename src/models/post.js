const mongoose = require('mongoose')
const validator = require('validator')

const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim : true,
        maxlength : 20
    },
    content : {
        type : String,
        default : 'No Content',
        trim : true,
        maxlength : 200
    },
    tags : [{type : String,trim : true}],
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'users'
    }

},{
    timestamps : true
})

const Post = mongoose.model('posts', postSchema)

module.exports.Post = Post