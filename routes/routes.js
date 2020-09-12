const express= require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const multer=require('multer');
const router = express.Router();
const Item = require('../models/item');
const User = require('../models/user');

const checkAuthenticated=require('../config/auth').checkAuthenticated;
const checkNotAuthenticated=require('../config/auth').checkNotAuthenticated;

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
  	dt = new Date();
     cb(null, dt.getTime()+file.originalname);
  }
});

var upload = multer({ storage: storage }).single("image");

router.get('/',checkAuthenticated,async (req,res)=>{
	const user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	if(req.user.usertype=="Customer"){
		const products=await Item.find().limit(40).catch(e=> console.log(e));
		res.render("custdash",{products:products});
	}
	else{
		const items=await Item.find({seller:req.user.username}).catch(e=>{throw e;});
		res.render('sellerdash',{items:items});
	}
})

//Seller Routes
router.get('/add',checkAuthenticated,checkSeller,async (req,res)=>{
	res.render('add');
})

router.post('/add',checkAuthenticated,checkSeller,upload,async (req,res)=>{
	let item = new Item();
	if(req.file!=undefined){
		item.image='http://localhost:3000/uploads/'+req.file.filename;
	}
    item.name = req.body.name;
    item.description=req.body.description;
    item.category=req.body.category;
    item.price = req.body.price;
    item.quantity = req.body.quantity;
    item.seller=req.user.username;
    await item.save();
    res.redirect('/');
})

router.get('/update/:id',checkAuthenticated,checkSeller,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	if(item==null) return res.render('error');
	if(item.seller != req.user.username){
	  return res.redirect('/');
	}
	res.render('update', {item:item});
})

router.post('/update/:id',checkAuthenticated,checkSeller,upload,(req,res)=>{
	let item = {};
	if(req.file!=undefined){
		item.image='http://localhost:3000/uploads/'+req.file.filename;
	}
    item.name = req.body.name;
    item.description=req.body.description;
    item.category=req.body.category;
    item.price = req.body.price;
    item.quantity = req.body.quantity;

	Item.updateOne({_id:req.params.id}, item, function(err){
		if(err){
		  console.log(err);
		  return;
		} else {
		  req.flash('msg', 'Item Updated');
		  res.redirect(`/details/${req.params.id}`);
		}
	}).catch(e=>{throw e;});
})

router.get('/details/:id',checkAuthenticated,checkSeller,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	if (item==null){res.render('error')}
	if(item.seller != req.user.username){
	  return res.redirect('/');
	}
	res.render('details', {item:item});
})

router.post('/delete/:id',checkAuthenticated,checkSeller,async (req,res)=>{
	Item.deleteOne({_id:req.params.id}, function(err) {
	    if (err){
	    	console.log(err);
	 	}
  	}).catch(e=>{throw e;});
    res.redirect('/'); 
})

router.get('/details/history/:id',checkAuthenticated,checkSeller,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	const users= await User.find({history:{$elemMatch:{item:req.params.id}}}).catch(e=>{throw e;});
	if(item==null) return res.render('error');
	if(item.seller != req.user.username){
	  return res.redirect('/');
	}
	let history=[];
	// for (let user of users){
	// 	var temp = user.history.find(x => x.item == req.params.id);
	// 	temp.custname=user.username;
	// 	temp.email=user.email
	// 	history.push(temp);
	// }
	res.render('producthistory',{history:item.purchasehistory});
})

router.get('/details/statistics/:id',checkAuthenticated,checkSeller,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	if(item==null) return res.render('error');
	if(item.seller != req.user.username){
	  return res.redirect('/');
	}
	res.render('graph');
})
router.post('/details/statistics/:id',checkAuthenticated,checkSeller,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	let purchases=item.purchases;
	res.send(purchases);
})

//Customer Routes
router.get('/search',checkAuthenticated,async (req,res)=>{
	res.render('search',{results:null});
})

router.post('/search',checkAuthenticated,async (req,res)=>{
	let q=req.body.search;
	if(q!==undefined||q!=''){
	var results=await Item.find( {name:{$regex: req.body.search ,$options:'i'}} ).limit(10).catch(e=>{throw e;});}
	res.render('search',{results:results});
})

router.get('/open/:id',checkAuthenticated,checkCustomer,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	const user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	if(item==null) return res.render('error');
	for(const item2 of user.cart){
		if(item2.item==req.params.id){
			req.flash("msg","Item is already present in cart");
			return res.redirect(`/cart/update/${req.params.id}`);
		}
	}
	res.render('open', {item:item});
})

router.post('/cart/:id',checkAuthenticated,checkCustomer,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	if(item.quantity<req.body.quantity){
		req.flash("msg","Your required quantity is greater than the available quantity");
		return res.redirect(`/open/${req.params.id}`);
	}
	let user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	let temp = {item:req.params.id,name:item.name,quantity:req.body.quantity}
	user.cart.push(temp);
	user = await user.save();
	req.flash('success','Item added to cart');
    res.redirect('/cart'); 
})

router.get('/cart/update/:id',checkAuthenticated,checkCustomer,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	const user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	if(item==null) return res.render('error');
	var status =false;
	var qty;
	for(const item2 of user.cart){
		if(item2.item==req.params.id){
			status=true;
			qty=item2.quantity
		}
	}
	if(status){
		res.render('updatecart', {item:item,qty:qty});
	}
	else{
		req.flash("error","Item is not present in cart");
		return res.redirect(`/open/${req.params.id}`); 
	}
})

router.post('/cart/update/:id',checkAuthenticated,checkCustomer,async (req,res)=>{
	const item = await Item.findById(req.params.id).catch(e=>res.render('error'));
	if(item.quantity<req.body.quantity){
		req.flash("msg","Your required quantity is greater than the available quantity");
		return res.redirect(`/cart/update/${req.params.id}`);
	}
	let user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	var index = user.cart.findIndex(x => x.item == req.params.id);
	user.cart[index].quantity=req.body.quantity;
	user = await user.save().catch(e=>{throw e;});
	req.flash('msg','Item Updated');
    res.redirect('/cart'); 
})

router.get('/cart',checkAuthenticated,checkCustomer,async (req,res)=>{
	const user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	let items=[];
	for (const cartitem of user.cart){
		items.push(cartitem);
	}
	res.render('cart', {items:items});
})

router.post('/purchase',checkAuthenticated,checkCustomer,async (req,res)=>{
	let user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	e1=false;
	e2=false;
	e3=false;
		for (var i=user.cart.length-1;i>=0;i--){
		let item = await Item.findById(user.cart[i].item).catch(e=>{throw e;});
		if(item==undefined){
			e2=true;
			continue;
		}
		let temp2=parseInt(item.quantity);
		let temp3=parseInt(user.cart[i].quantity);
		if(temp2<temp3){
			e1=true;
			continue;
		}
		temp2=temp2-temp3;
		item.quantity=temp2.toString();
		let date=new Date();
		let p=parseInt(item.price);
		let price=(p*temp3);
		let temp = {item:user.cart[i].item,name:item.name,quantity:user.cart[i].quantity,price:price,date:date};
		user.history.push(temp);
		let pur={date:date,quantity:user.cart[i].quantity};
		let pur2={username:user.username,email:user.email,date:date,quantity:user.cart[i].quantity};
		item.purchases.push(pur);
		item.purchasehistory.push(pur2);
		user.cart.splice(i,1);
		item=await item.save().catch(e=>{throw e;});
		user = await user.save().catch(e=>{throw e;});
		e3=true
	}
	if(user.cart.length!=0&&e1==true){
		req.flash("error","The required quantity of the following items is greater than the amount in storage"); 
		if (e3==true){req.flash("msg","Rest of the items purchased successfully");}
		return res.redirect('/cart')
	}
	else if(user.cart.length!=0&&e2==true){
		req.flash("error","The following items are unavailable");
		if (e3==true){req.flash("msg","Rest of the items purchased successfully");}		 
		return res.redirect('/cart')
	}
	else{
		req.flash("success","Items purchased successfully");
		return res.redirect('/cart'); 
	}
})

router.post('/cart/remove/:id',checkAuthenticated,checkCustomer,async (req,res)=>{
	let user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	var index = user.cart.findIndex(x => x.item == req.params.id);
	user.cart.splice(index,1);
	user = await user.save().catch(e=>{throw e;});
	req.flash("msg","One item removed from cart")
    res.redirect('/cart'); 
})

router.get('/history',checkAuthenticated,checkCustomer,async (req,res)=>{
	let user = await User.findOne({username:req.user.username}).catch(e=>{throw e;});
	res.render('customerhistory',{history:user.history});
})

function checkSeller(req,res,next){
	if(req.user.usertype!='Seller'){
		return res.redirect('/');
	}
	next();
}

function checkCustomer(req,res,next){
	if(req.user.usertype!='Customer'){
		return res.redirect('/');
	}
	next();
}

module.exports=router;
