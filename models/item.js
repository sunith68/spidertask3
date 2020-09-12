const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category:{
    type:String
  },
  description: {
    type: String, 
    required: true
  },
  image: {
    type: String,
    default: "http://localhost:3000/uploads/default.png" 
  },
  price:{
    type:Number,
    required:true
  },
  quantity:{
    type:Number,
    required:true
  },
  seller: {
    type: String 
  },
  purchases:[
   {  
      date:String,
      quantity:Number
    }
  ],
  purchasehistory:[
   {  
      username:String,
      email:String,
      date:String,
      quantity:Number
    }
  ]

})
module.exports = mongoose.model('items', itemSchema);