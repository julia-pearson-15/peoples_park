var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.set('view engine', 'ejs')

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
  db.collection('spots').find({}).toArray(function(err, results){
    res.render('index', {myKey: key});
  });
});

app.get('/spots', function(req, res){
  db.collection('spots').find({}).toArray(function(err, results){
    res.json(results);
  });
});

app.post('/spots', function(req, res){
  var newSpot = req.body.spot;
  console.log(req.body)
  res.json(newSpot)
  // db.collection('spots').insert(newSpot, function(err, result){
  //   res.json(newSpot);
  // });
});

app.get('/data', function(req, res){
  db.collection('spots').find({}).toArray(function(err, results){
    res.send(results);
  });
});

app.listen(process.env.PORT || 3000);




