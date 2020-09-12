const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  usertype: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  email: {
    type: String,
    unique:true
  },
  username: {
    type: String,
    required: true,
    unique:true
  },
  cart:{                                          
    type:[
      {
        item:String,
        name:String,
        quantity:Number
      }
    ]
  },
  history:{
    type:[
      {
        item: String,
        name: String,
        quantity:Number,
        price:Number,
        date: String
      }
    ]
  },
  password: {
  	type: String,
  	required: true
  }
})
module.exports = mongoose.model('users', userSchema);