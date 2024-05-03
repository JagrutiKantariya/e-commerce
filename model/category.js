const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    isActive: {
        type:  Boolean,
        default: true,
        comment: 'false is Deactive true is Active'
    }
}, { timestamps: true ,versionKey:false});

module.exports = mongoose.model('categories', CategorySchema);