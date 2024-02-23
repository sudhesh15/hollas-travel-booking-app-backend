const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const TrekkersSchema = new Schema({
  firstName:String,
  lastName:String,
  phoneNumber:String,
  whatsAppNumber:String,
  email:String,
  age:Number,
  trekName:String,
  trekId: String,
}, {
  timestamps: true,
});

const TrekkerModel = model('Trekker', TrekkersSchema);

module.exports = TrekkerModel;