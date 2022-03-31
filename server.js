const express=require('express');
const mongoose=require('mongoose');
const devuser=require('./devusermodel');
const jwt=require('jsonwebtoken');
const middleware = require('./middleware');
const reviewmodel=require('./reviewmodel');
const cors= require('cors');
const app=express();

app.use(express.json())

mongoose.connect('mongodb+srv://raju:raju1997@cluster0.yqu4r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority').then(
    ()=>console.log('DB Connected')
)
app.use(express.json())//this was comp
app.use(cors({origin:'*'}))//by using backend to frontend without restrictions

app.get('/',(req,res)=>{
    return res.send('Hello world')
})

app.post('/register',async (req,res)=>{
    try{
        const {fullname,email,mobile,skill,password,confirmpassword}=req.body;
        const exist=await devuser.findOne({email});
        if(exist){
            return res.status(400).send('User Already Registered');
        }
        if(password != confirmpassword){
            return res.status(403).send('PassWord Not Matching');
        }
        let newUser=new devuser({
            fullname,email,mobile,skill,password,confirmpassword
        })
        newUser.save();
        return res.status(200).send('UserRegistered Successfully')
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Server Error')
    }
})
app.post('/login',async (req,res)=>{
    try{
        const {email,password}=req.body;
        const exist=await devuser.findOne({email});
        if(!exist){
            return res.status(400).send('User Not Exist')
        }
        if(exist.password != password){
            return res.status(400).send('Password Invalid')
        }
        let payload={
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,'jwtpassword',{expiresIn:35000000},
        (err,token)=>{
            if(err) throw err
            return res.json({token})
        })

    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }
})

app.get('/allprofiles',middleware,async(req,res)=>{
    try{
        let allprofiles=await devuser.find();
        return res.json(allprofiles)
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }
})

app.get('/myprofile',middleware,async(req,res)=>{
    try{
        let user=await devuser.findById(req.user.id);
        return res.json(user)
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }
})

app.post('/addreview',middleware,async(req,res)=>{
    try{
        const {taskworker,rating}=req.body;
        const exist=await devuser.findById(req.user.id);
        const newReview=new reviewmodel({
            taskprovider:exist.fullname,
            taskworker,rating
        })
        newReview.save();
        return res.status(200).send("Review Submitted Successfully")
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }
})

app.get('/myreview',middleware,async(req,res)=>{
    try{
        let allreviews=await reviewmodel.find();
        let myreview=allreviews.filter(review=>review.taskworker.toString()===req.user.id.toString())
        return res.status(200).json(myreview)
    }
    catch(err){
        console.log(err)
        return res.status(500).send('Server Error')
    }
})


app.listen(5000,()=>{console.log('Server Running...')})