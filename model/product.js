const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
    
    category_id: {
        type: mongoose.Types.ObjectId,
        reference: "categories"
    },
   
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        require: true,
        default: 10
    },
    description: {
        type: String,
        default: null
    },
    isActive: {
        type:  Boolean,
        default: true,
        comment: 'false is Deactive true is Active',
    }
}, { timestamps: true,versionKey:false });

module.exports = mongoose.model('products', FoodItemSchema);