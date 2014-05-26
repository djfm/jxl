var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index', { title: 'The index page!' });
});

var server = app.listen(24816, function() {
    console.log('Listening on port %d', server.address().port);
});
