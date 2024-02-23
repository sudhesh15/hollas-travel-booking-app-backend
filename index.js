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

app.use(cors({credentials:true, origin: `${BASE_URL}`}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect(`${MONGO_URL}`);

app.post('/post', upload.single('file'), async (req,res) => {
    let whatsIncluded = [];
    let bookDetails = JSON.parse(req.body.bookDetails);

    let whatsNotIncluded = [];
    let notIncludedDetails = JSON.parse(req.body.notIncludedDetails);

    let thingsToCarry = [];
    let thingsToCarryDetails = JSON.parse(req.body.thingsToCarryDetails);

    for (let i=0; i<bookDetails.length; i++) {
      let includeRow = bookDetails[i].includeRow;
      whatsIncluded.push({ whatsIncluded: includeRow });
    }
    for (let i=0; i<notIncludedDetails.length; i++) {
      let notIncludeRow = notIncludedDetails[i].notIncludeRow;
      whatsNotIncluded.push({ whatsNotIncluded: notIncludeRow });
    }
    for (let i=0; i<thingsToCarryDetails.length; i++) {
      let thingsToCarryRow = thingsToCarryDetails[i].thingsToCarryRow;
      thingsToCarry.push({ thingsToCarry: thingsToCarryRow });
    }

    const {trekName,totalSpots,numberOfDays,startDate,endDate,trekLocation,trekGmapLocation,trekPrice,expDate,pickUpLocation,pickUpGmapLocation,trekDescription,difficultyLevel,trekLength,altitude,minAge, thumbnailImage} = req.body;
    const postDoc = await Post.create({trekName,totalSpots,numberOfDays,startDate,endDate,trekLocation,trekGmapLocation,trekPrice,expDate,pickUpLocation,pickUpGmapLocation,trekDescription,difficultyLevel,trekLength,altitude,minAge,whatsIncluded,whatsNotIncluded,thingsToCarry, thumbnailImage
    });
    res.json(postDoc);
});

app.put('/post', upload.single('file'), async (req,res) => {
  let whatsIncluded = [];
  let bookDetails = JSON.parse(req.body.bookDetails);

  let whatsNotIncluded = [];
  let notIncludedDetails = JSON.parse(req.body.notIncludedDetails);

  let thingsToCarry = [];
  let thingsToCarryDetails = JSON.parse(req.body.thingsToCarryDetails);

  for (let i=0; i<bookDetails.length; i++) {
    let includeRow = bookDetails[i].whatsIncluded;
    whatsIncluded.push({ whatsIncluded: includeRow });
  }
  for (let i=0; i<notIncludedDetails.length; i++) {
    let notIncludeRow = notIncludedDetails[i].whatsNotIncluded;
    whatsNotIncluded.push({ whatsNotIncluded: notIncludeRow });
  }
  for (let i=0; i<thingsToCarryDetails.length; i++) {
    let thingsToCarryRow = thingsToCarryDetails[i].thingsToCarry;
    thingsToCarry.push({ thingsToCarry: thingsToCarryRow });
  }
  const putDoc = await Post.findByIdAndUpdate(req.body.id, {
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
    whatsIncluded: whatsIncluded,
    whatsNotIncluded: whatsNotIncluded,
    thingsToCarry: thingsToCarry
  });
  res.json(putDoc);
});

app.get('/getAllTreks', async (req,res) => {
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split('T')[0];
  res.json(
    await Post.find({ expDate: { $gte: currentDateString } })
      .sort({createdAt: 1})
  );
});

app.get('/getUpcomingTreks', async (req,res) => {
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split('T')[0];
  res.json(
    await Post.find({ expDate: { $gte: currentDateString } })
      .sort({ expDate: 1 })
      .limit(3)
  );
});

app.get('/getOneDayTrek', async (req,res) => {
  res.json(
    await Post.find({ numberOfDays: 1 })
      .sort({createdAt: 1})
  );
});

app.get('/getTwoDayTrek', async (req,res) => {
  res.json(
    await Post.find({ numberOfDays: 2 })
      .sort({createdAt: 1})
  );
});

app.get('/trekDetails/:id', async (req,res) => {
  const {id} = req.params;
  const getAllTreksData = await Post.findById(id);
  res.json(getAllTreksData);
});

app.post('/createTrekkerDetails', upload.single('file'), async (req,res) => {
  try{
    const bookDetailsString = req.body.bookDetails;
    const bookDetails = JSON.parse(bookDetailsString);

    const trekkerDetails = bookDetails.map(detail => ({
      firstName: detail.firstName,
      lastName: detail.lastName,
      phoneNumber: detail.mobileNumber, 
      whatsAppNumber: detail.whatsAppNumber,
      email: detail.email,
      age: parseInt(detail.age),
      trekName: req.body.trekName,
      trekId: req.body.trekId
    }));

    const result = await Trekker.bulkWrite(trekkerDetails.map(detail => ({
      insertOne: {
        document: detail
      }
    })));

    res.json({ success: true, message: 'Trekker details created successfully', result });
  }catch(err){
    console.error('Error creating trekker details:', err);
    res.status(500).json({ success: false, message: 'Failed to create trekker details', error: err.message });
  }
});

app.get('/viewAllTreks', async (req,res) => {
  res.json(
    await Post.find({})
      .sort({createdAt: 1})
  );
});

app.get('/viewAllParticipants/:trekId', async (req,res) => {
  const {trekId} = req.params;
  const getAllTrekkersData = await Trekker.find({trekId:trekId}).sort({createdAt: 1});
  res.json(getAllTrekkersData);
});

app.delete('/deleteTrek/:id', async (req, res) => {
  console.log("delete trek");
  const id = req.params.id;
  try {
    console.log("delete trek try");
    const result = await Post.deleteOne({ _id: new ObjectId(id) });
    console.log("result delete", result)
    if (result.deletedCount > 0) {
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete the product' });
  }
});

app.get('/treks/:id', async (req, res) => {
    const {id} = req.params;
    const treksInfo = await Post.findById(id);
    res.json(treksInfo);
});

app.get('/trekParticipantsCount/:trekId', async (req, res) => {
  console.log("trekParticipantsCount");
  const { trekId } = req.params;
  console.log("trekId", trekId);

  try {
    const count = await Trekker.aggregate([
      {
        $match: {
          trekId: trekId,
        }
      },
      {
        $count: "totalParticipants",
      }
    ]);
    if (count.length > 0) {
      res.json({ totalParticipants: count[0].totalParticipants });
    } else {
      res.json({ totalParticipants: 0 });
    }
  } catch (error) {
    console.error("Error fetching trek participants count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT);