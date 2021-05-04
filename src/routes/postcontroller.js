const express = require("express");

const {User} = require("../models/user");
const {Post} = require("../models/post");
const {Like} = require('../models/like');
const {Comment} = require('../models/comment')

const {authenticate} = require('../middlewares/auth');

const postRoute = new express.Router();

postRoute.post('/create', authenticate,async (req, res)=>{
    let post = req.body
    let newPost = new Post({
        title : post.title,
        content : post.content,
        tags : post.tags,
        userId : req.user_id
    })

    await newPost.save().then(()=>{
        return res
            .status(200)
            .send({"post_id" : newPost._id})
    }).catch((err)=>{
        return res.status(404).send(err)
    })
})

postRoute.patch('/:type', authenticate, async (req, res)=>{
    let post_id = req.body.post_id
    let type = req.params.type

    let data =  await Post.findById(post_id)
    if (!data){
        return res.status(200).send({'status' : "Please Provide valid post_id"})
    }

    let db_data = await Like.findOne({
        userId : req.user_id,
        postId : post_id
    })

    if(db_data){
        if (type === 'like' && !db_data.state) {
            db_data.state = true
        }else if(type === 'dislike' && db_data.state){
            db_data.state = false
        }else{
            return res.status(304).send({"Status" : "Failure", "Message" : "Data Not Modified"})
        }
        await db_data.save().then(()=>{
            return res.status(200).send({"Status" : "Success", "Message" : "Modified data"})
        }).catch((e)=>{
            return res.status(404).send({"Status" : "Failure", "Error" : e})
        })
    }else {
        if (type === 'like' || type === 'dislike') {
            let likeObj = new Like({
                userId: req.user_id,
                postId: post_id,
            })
            if (type === 'like') {
                likeObj.state = true
            } else if (type === 'dislike') {
                likeObj.state = false
            }
            await likeObj.save().then(() => {
                return res.status(200).send({"Status": "Success"})
            }).catch((e) => {
                console.log(e)
                return res.status(404).send({"Error": e, "Status": "Failure"})
            })
        } else {
            return res.status(404).send({"Error": "Invalid type", "Status": "Failure"})
        }
    }
})

postRoute.post('/comment', authenticate, async(req,res)=>{
    let body = req.body
    let data =  await Post.findById(body.post_id)
    if (!data){
        return res.status(200).send({"Error" : "Please Provide valid post_id", "Status" : "Failure"})
    }else {
        let newObj = new Comment({
            userId: req.user_id,
            postId: body.post_id,
            comment: body.comment
        })
        await newObj.save().then(() => {
            return res
                .status(200)
                .send({
                    "comment": newObj.comment,
                    "post_id": newObj.postId,
                    "status": "Success"
                })
        }).catch((e) => {
            return res.status(404).send({"Status": "Failure", "Error" : e})
        })
    }
})

postRoute.get('/liked-users/:post_id', async(req, res)=>{
    let post_id = req.params.post_id
    let post_details = []
    try{
        let users = await Like.find({postId : post_id, state : true})
        for(let x of users){
            let user = await User.findById(x.userId)
            post_details.push({"user_id" : user._id, "username" : user.name})
        }
        return res.status(200).send({post_id : post_details})
    }catch (e){
        console.log(e)
        return res.status(404).send({"Error" : e})
    }
})

postRoute.get('/post-liked-users', async(req, res)=>{
    let post_details = []
    try{
        let posts = await Post.find()
        for(let post of posts){
            let user_details = {}
            let post_id = post._id
            let users = await Like.find({postId : post_id})
            user_details[post_id] = []
            for(let x of users){
                let reaction = ''
                let user = await User.findById(x.userId)
                if(x.state){
                    reaction = 'Liked'
                }else{
                    reaction = 'Disliked'
                }
                user_details[post_id].push({"user_id" : user._id, "username" : user.name, reaction})
            }
            post_details.push(user_details)
        }
        return res.status(200).send({post_id : post_details})
    }catch (e){
        console.log(e)
        return res.status(404).send({"Error" : e})
    }
})

postRoute.get('/user-comments/:user_id', async(req,res)=>{
    let user_id = req.params.user_id
    let comment_details = {}

    let comments = await Comment.find({userId : user_id})
    for (let comment of comments){
        let post = await Post.findById(comment.postId)
        if (comment_details.hasOwnProperty(post._id)) {
            comment_details[post._id].push([post.title, comment.comment])
        }else{
            comment_details[post._id] = [post.title, comment.comment]
        }
    }
    comment_details["User-Id"] = user_id
    return res.status(200).send({Comments : comment_details})
})

module.exports.postRoute = postRoute;