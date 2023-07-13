const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const PostSchema = new Schema({
  trekName:String,
  totalSpots:Number,
  numberOfDays:String,
  startDate:String,
  endDate:String,
  trekLocation:String,
  trekPrice:Number,
  expDate:String,
  pickUpLocation:String,
  pickUpGmapLocation:String,
  trekDescription:String,
  difficultyLevel:String,
  trekLength:String,
  altitude:String,
  minAge:Number,
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;