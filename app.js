var express = require('express');
var app = express();
var bodyParser = require('body-parser');
// SESSIONS
var session = require('express-session');
var bcrypt = require('bcrypt');
var MongoStore = require('connect-mongo')(session)

var authenticateUser = function(username, password, callback) {
  // console.log('got to authenticateUser, username: '+username+', password: '+password);
  db.collection('users').findOne({username: username}, function(err, data) {
    if (err) {throw err;}
    var hashedPass;
    bcrypt.hash('paulsimon', 8, function(err, hash){if(err){throw err;}
      hashedPass = hash;
    });
    bcrypt.compare(password, hashedPass, function(err, passwordsMatch) {
      console.log(err);
      console.log(passwordsMatch);
      // if (passwordsMatch) {
        callback(data);
      // } else {
      //   callback(false);
      // }
    })
  });
  // db.collection('users').findOne({username: username}, function(err, data) {
  //   console.log('found '+data.username+' with password: '+data.password);
  //   if (err) {throw err;}
  //   // var encryptedPassword = bcrypt.hashSync(data.password);
  //   // console.log(encryptedPassword);
  //   bcrypt.compare(password, bcrypt.hashSync(data.password), function(err, passwordsMatch) {
  //     console.log(passwordsMatch);
  //     if (passwordsMatch) {
  //       callback(data);
  //     } else {
  //       callback(false);
  //     }
  //   })
  // });
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

// app.use(function(req, res, next) {
//   console.log(req.method, req.url, '\n body:', req.body, '\n session:', req.session);
//   next();
// });

app.use(session({
  // arbitrary
  secret: 'waffles'
}))

// gets the key
app.get('/', function(req, res){
  var key = process.env.GOOGLE_API;
  var name = req.session.name;
  console.log(name);
  res.render('index', {myKey: key, name: name});
});

app.post('/login', function(req, res) {
  // req.session.name = req.body.userInfo.username;
  thisUser = req.body;
  authenticateUser(thisUser.username, thisUser.password, function(user){
    if(user){
      console.log(user);
      req.session.name = user.username;
      req.session.userId = user._id;
    }
    res.redirect('/');
  })
});

app.post('/signup', function(req, res) {
  // req.session.name = req.body.userInfo.username;
  thisUser = req.body;
  bcrypt.hash(thisUser.password, 8, function(err, hash){
    if(err){throw err;}
    db.collection('spots').insert({password_digest: hash, username: thisUser.username}, function(err, data){
      req.session.name = thisUser.username;
      req.session.userId = thisUser._id;
      res.redirect('/');
    })
  })
});

app.get('/logout', function(req, res) {
  req.session.name = null;
  req.session.userId = null;
  res.redirect('/');
})

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

app.get('/userData', function(req, res){
  db.collection('users').find({}).toArray(function(err, results){
    res.send(results);
  });
});

app.listen(process.env.PORT || 3000);




