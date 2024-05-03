const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const customerSchema = new mongoose.Schema({
    firstName:{
        type:String,
        default:null
    },
    lastName:{
        type:String,
        default:null
    },
    deviceId:{
        type: String,
        require: false,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email:{
        type: String,
        default:null
    },
    mobile: {
        type: String,
        require: false,
        min: 10,
        max: 10
    },
    password:{
        type:String,
        default:null
    },
    stripeId:{
        type:String,
        default:null
    },
    address: {
        type: String,
        require: false
    }

},{timestamps:true,versionKey:false})

customerSchema.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      if(this?.password)
      {
          this.password = await bcrypt.hash(this.password, salt);
      }
      return next();
    } catch (err) {
      return next(err);
    }
  });

const customerModel = mongoose.model('customers',customerSchema)
module.exports = customerModel 