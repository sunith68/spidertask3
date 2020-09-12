const express= require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const router = express.Router();
const Item = require('../models/item')
const User = require('../models/user')

const checkAuthenticated=require('../config/auth').checkAuthenticated;
const checkNotAuthenticated=require('../config/auth').checkNotAuthenticated;

router.get('/login',checkNotAuthenticated, function(req,res){
	res.render('login');
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/user/login',
  failureFlash: true
}))

router.get('/signup',checkNotAuthenticated,function(req,res){
	res.render('signup',{user:null});
})

router.post('/signup', checkNotAuthenticated, async (req, res) => {
	let temp = await User.findOne({username: req.body.username });
	let temp2 = await User.findOne({email: req.body.email });
	let user1={};
	user1.name=req.body.name;
	user1.username=req.body.username;
	user1.email=req.body.email;
	user1.password=req.body.password;
	user1.cpassword=req.body.cpassword;
	user1.usertype=req.body.usertype;
	if(temp!=null){
		req.flash('error','Username already exists')
		return res.render('signup',{user:user1});
	}
	if(temp2!=null){
		req.flash('error','Email is already registered')
		return res.render('signup',{user:user1});
	}
	if(req.body.password.length<8){
		req.flash('error','Password should be atleast 8 charecters')
		return res.render('signup',{user:user1});
	}
	if(req.body.password!=req.body.cpassword){
		req.flash('error','Match both the passwords')
		return res.render('signup',{user:user1});
	}
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    let tuser= new User();
    tuser.name=req.body.name;
    tuser.usertype=req.body.usertype;
	tuser.username=req.body.username;
	tuser.email=req.body.email;
	tuser.password=hashedPassword;
	tuser= await tuser.save();
	req.flash('success','Account Created');
    res.redirect('/user/login')
  } catch(e) {
    throw e
  }
})
router.post('/logout',function(req,res){
	req.logOut()
  	res.redirect('/user/login')
})

module.exports=router;