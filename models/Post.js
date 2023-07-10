const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const PostSchema = new Schema({
  trekName:String,
  totalSpots:String,
  numberOfDays:String,
  startDate:String,
  endDate:String,
  trekLocation:String,
  trekPrice:String,
  expDate:String,
  pickUpLocation:String,
  pickUpGmapLocation:String,
  trekDescription:String,
  difficultyLevel:String,
  trekLength:String,
  altitude:String,
  minAge:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;