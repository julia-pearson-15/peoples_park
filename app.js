var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// SESSIONS
var session = require('express-session');
var bcrypt = require('bcrypt');
var MongoStore = require('connect-mongo')(session)

var authenticateUser = function(username, password, callback) {
  db.collection('users').findOne({username: username}, function(err, data) {
    if (err) {throw err;}
    bcrypt.compare(password, data.password_digest, function(err, passwordsMatch) {
      if (passwordsMatch) {
        callback(data);
      } else {
        callback(false);
      }
    })
  });
};

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

app.use(session({
  secret: process.env.SESSION_SECRET
}))

// gets the key
app.get('/', function(req, res){
  console.log(req.session.name);
  var key = process.env.GOOGLE_API;
  var name = req.session.name;
  var points = 11;
  res.render('index', {myKey: key, name: name, points: points});
});

app.post('/login', function(req, res) {
  thisUser = req.body;
  authenticateUser(thisUser.username, thisUser.password, function(user){
    if(user){
      req.session.name = user.username;
      req.session.userId = user._id;
    }
    console.log(req.session.name);
    res.json(req.session.name);
  })
});

app.post('/signup', function(req, res) {
  // req.session.name = req.body.userInfo.username;
  thisUser = req.body;
  bcrypt.hash(thisUser.password, 8, function(err, hash){
    if(err){throw err;}
    db.collection('users').insert({password_digest: hash, username: thisUser.username, points: 5}, function(err, data){
      req.session.name = thisUser.username;
      req.session.userId = thisUser._id;
      console.log(req.session.name);
      res.json(req.session.name);
    })
  })
});

app.get('/logout', function(req, res) {
  req.session.name = null;
  req.session.userId = null;
  res.json(req.session.name);
})

app.get('/spots', function(req, res){
  console.log(req.session.name);
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
    db.collection('spots').find({status:{$ne: "archived"}, $or: [ { taker: null }, { taker: req.session.userId} ]}).toArray(function(error, onlyCurrent){                
      res.json(onlyCurrent);
    }); 
  };
  db.collection('spots').find({status:{$ne: "archived"}}).toArray(toArchive);
});

app.post('/spots', function(req, res){
  console.log(req.session.name);
  var newSpot = req.body.spot;
  newSpot.leaver = req.session.userId;
  var updatePoints = function(user){
    points = user.points+1;
    db.collection('spots').update({"_id": req.session.userId},{$set: {points : points}}, function(err, data) {});
  };
  db.collection('users').find({"_id": req.session.userId}, function(err, data) {
    updatePoints(data);
  });
  db.collection('spots').insert(newSpot, function(err, result){
    res.json(result);
  });
});

app.post('/taken', function(req, res){
  // The following code finds the user's old taken spot (if not archived and theirs), marks that one as available, then finds the new spot, and marks that one as taken and theirs

  var takenSpot = req.body.spot;
  var lastSpot;
  var spotId = ObjectId(takenSpot._id)
  var updateNewSpot = function(error, oldSpot){
    db.collection('spots').update({"_id": spotId},{$set: {status : 'taken', taker: req.session.userId}}, function(err, data) {
      res.json(oldSpot);
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
      db.collection('spots').update({"_id": oldSpotId},{$set: {status : newStatus , taker: null }}, updateNewSpot);
    }else{
      updateNewSpot();
    };
  };
  // TODO the following line of code will find the non-archived spot marked taken with this user's username as taker
  /* , "taker": thisUser.username */
  db.collection('spots').findOne({"status": "taken", "taker": req.session.userId}, updateOldSpot);
});

app.get('/data', function(req, res){
  db.collection('spots').find({}).toArray(function(err, results){
    res.send(results);
  });
});

app.get('/userData', function(req, res){
  db.collection('users').find({}).toArray(function(err, results){
    res.send(results);
  });
});

app.listen(process.env.PORT || 3000);




