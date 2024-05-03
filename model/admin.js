const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        default:'Admin'
    },
    email:{
        type: String,
        require: false,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        type:String
    }
},{timestamps:true,versionKey:false})

adminSchema.pre('save', async function save(next) {
    if (!this.isModified('password')) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      return next();
    } catch (err) {
      return next(err);
    }
  });

const adminModel = mongoose.model('admins',adminSchema)
module.exports = adminModel 