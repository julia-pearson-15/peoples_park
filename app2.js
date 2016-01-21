var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.set('view engine', 'ejs')

app.use(function(req, res, next) {
  console.log(req.method, req.url, '\n  body:' , req.body)
  next();
})

app.get('/', function(req, res) {
  res.render('fakeindex');
});

app.post('/cars', function(req, res) {
  res.json({ success: true });
});

app.listen(3000)