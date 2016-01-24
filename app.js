var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

app.set('view engine', 'ejs');

app.use(bodyParser());

var db;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoUrl = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/final_project_dev';
MongoClient.connect(mongoUrl, function(err, database) {
  if (err) { throw err;}
  db = database;
  process.on('exit', db.close);
});

app.get('/', function(req, res){
  var key = process.env.GOOGLE_API;
  // db.collection('spots').find({}).toArray(function(err, results){
    res.render('index', {myKey: key});
  // });
});

app.get('/spots', function(req, res){
  // The following code finds all unarchived spots, marks any old spots as archived, then re-queries for non-archived spots making sure to also weed out spots taken by other users

  // weeds out any spots 20 mins after leaving time
  var checkIfCurrent = function(thisSpot){
    var now = new Date();
    now = now.getTime();
    var spotTime = new Date(thisSpot.leaving);
    spotTime = spotTime.getTime()+(20*60000)
    var spotId = ObjectId(thisSpot._id);
    if(spotTime < now){
      db.collection('spots').update({"_id": spotId},{$set: {status : 'archived'}}); 
    }
  };
  // runs through all non-archived spots
  var toArchive = function(error, currentSpots){
    currentSpots.forEach(checkIfCurrent);
    // TODO add following line of code into the find object to cut out taken spots from other users
    /* , taker: {$ne: thisUser.username} */
    db.collection('spots').find({status:{$ne: "archived"}}).toArray(function(error, onlyCurrent){
      res.json(onlyCurrent);
    }); 
  };
  db.collection('spots').find({status:{$ne: "archived"}}).toArray(toArchive);
});

app.post('/spots', function(req, res){
  var newSpot = req.body.spot;
  // TODO add following line of code to mark this user as the leaver of this spot
  // newSpot.leaver = thisUser.username;
  db.collection('spots').insert(newSpot, function(err, result){
    res.json(result);
  });
});

app.post('/taken', function(req, res){
  // The following code finds the user's old taken spot (if not archived and theirs), marks that one as available, then finds the new spot, and marks that one as taken and theirs

  var takenSpot = req.body.spot;
  var spotId = ObjectId(takenSpot._id)
  var updateNewSpot = function(error, oldSpot){
    /* , taker: thisUser.username */
    db.collection('spots').update({"_id": spotId},{$set: {status : 'taken'}}, function(err, data) {
      res.json(data);
    });   
  };
  var updateOldSpot = function(error, oldSpot){
    // console.log("old spot format is: "+oldSpot);
    if(oldSpot){
      var oldSpotId = ObjectId(oldSpot._id);
      var oldSpotDate = new Date(oldSpot.leaving);
      // console.log("id: "+oldSpotId);
      var now = new Date();
      var newStatus = "current";
      if (oldSpotDate.getTime() > now.getTime()) {
        newStatus = "soon";
      };
      db.collection('spots').update({"_id": oldSpotId},{$set: {status : newStatus/* , taker: null */}}, updateNewSpot);
    }else{
      updateNewSpot();
    };
  };
  // TODO the following line of code will find the non-archived spot marked taken with this user's username as taker
  /* , "taker": thisUser.username */
  db.collection('spots').findOne({"status": "taken"}, updateOldSpot);
});

app.get('/data', function(req, res){
  db.collection('spots').find({}).toArray(function(err, results){
    res.send(results);
  });
});

app.listen(process.env.PORT || 3000);




