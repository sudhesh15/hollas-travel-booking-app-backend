const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Trekker = require('./models/TrekkerDetails');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { ObjectId } = require('mongodb');
require('dotenv').config()
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL;
const MONGO_URL = process.env.MONGO_URL;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://hollas-travel-booking-app.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const salt = bcrypt.genSaltSync(10);
const secret = "aszxde12we0dsjm3";

app.use(cors({credentials:true, origin: `${BASE_URL}`}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect(`${MONGO_URL}`);

let ifLoggedIn = false;

app.post('/register', async (req,res)=>{
  const {firstName, lastName, dateOfBirth, username, password} = req.body;
  try{
    const userDoc = await User.create({firstName, lastName, dateOfBirth, username, password:bcrypt.hashSync(password, salt), type: "user"});
    res.json(userDoc);
  }catch(err){
    res.status(400).json(err);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const result = bcrypt.compareSync(password, userDoc.password);
  if (result) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true }).json({
        id: userDoc._id,
        username,
      });
      ifLoggedIn = true;
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.post('/logout', (req, res) => {
  ifLoggedIn = false;
  res.clearCookie('token');
  res.status(200).json('Logged out successfully');
});

app.post('/post', upload.single('file'), async (req,res) => {
  if(ifLoggedIn){
    const {trekName,totalSpots,numberOfDays,startDate,endDate,trekLocation,trekGmapLocation,trekPrice,expDate,pickUpLocation,pickUpGmapLocation,trekDescription,difficultyLevel,trekLength,altitude,minAge} = req.body;
    const postDoc = await Post.create({trekName,totalSpots,numberOfDays,startDate,endDate,trekLocation,trekGmapLocation,trekPrice,expDate,pickUpLocation,pickUpGmapLocation,trekDescription,difficultyLevel,trekLength,altitude,minAge
    });
    res.json(postDoc);
  }
});

app.put('/post', upload.single('file'), async (req,res) => {
  if(ifLoggedIn){
    await Post.findByIdAndUpdate(req.body.id, {
      trekName : req.body.trekName,
      totalSpots : req.body.totalSpots,
      numberOfDays : req.body.numberOfDays,
      startDate : req.body.startDate,
      endDate : req.body.endDate,
      trekLocation : req.body.trekLocation,
      trekGmapLocation: req.body.trekGmapLocation,
      trekPrice : req.body.trekPrice,
      expDate : req.body.expDate,
      pickUpLocation : req.body.pickUpLocation,
      pickUpGmapLocation : req.body.pickUpGmapLocation,
      pickUpGmapLocation : req.body.pickUpGmapLocation,
      trekDescription : req.body.trekDescription,
      difficultyLevel : req.body.difficultyLevel,
      trekLength : req.body.trekLength,
      altitude : req.body.altitude,
      minAge : req.body.minAge,
    });
    displayAlertMessage(res, 'Product updated successfully!');
  }
});

function displayAlertMessage(res, message) {
  const html = `
    <script>
      window.location.href = '/';
    </script>
  `;
  res.send(html);
}

app.get('/getAllTreks', async (req,res) => {
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split('T')[0];
  res.json(
    await Post.find({ expDate: { $gte: currentDateString } })
      .sort({createdAt: 1})
      .limit(100)
  );
});

app.get('/trekDetails/:id', async (req,res) => {
  const {id} = req.params;
  const getAllTreksData = await Post.findById(id);
  res.json(getAllTreksData);
});

app.post('/createTrekkerDetails', upload.single('file'), async (req,res) => {
  const {firstName, lastName,phoneNumber,whatsAppNumber,email,age,totalTrekkers,trekName} = req.body;
  const trekkerDetails = await Trekker.create({firstName, lastName,phoneNumber,whatsAppNumber,email,age,totalTrekkers,trekName});
  res.json(trekkerDetails);
});

app.get('/viewAllTreks', async (req,res) => {
  if(ifLoggedIn){
    res.json(
      await Post.find({})
        .sort({createdAt: 1})
        .limit(100)
    );
  }
});

app.get('/viewAllParticipants/:trekName', async (req,res) => {
  if(ifLoggedIn){
    const {trekName} = req.params;
    const getAllTrekkersData = await Trekker.find({trekName:trekName}).sort({createdAt: 1});
    res.json(getAllTrekkersData);
  }
});

app.delete('/deleteTrek/:id', async (req, res) => {
  if(ifLoggedIn){
    const id = req.params.id;
    try {
      const result = await Post.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Failed to delete the product' });
    }
  }
});

app.get('/treks/:id', async (req, res) => {
  if(ifLoggedIn){
    const {id} = req.params;
    const treksInfo = await Post.findById(id);
    res.json(treksInfo);
  }
});

app.get('/trekParticipantsCount/:trekName', async (req, res) => {
  const {trekName} = req.params;
  const count = await Trekker.aggregate([
    {
      $match: {
        trekName: trekName
      }
    },
    {
      $group: {
        _id: null,
        totalTrekkers: {
          $sum: { $toInt: "$totalTrekkers" }
        }
      }
    }
  ]);
  res.json(count);
});

app.listen(PORT);