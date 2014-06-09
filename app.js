var express = require('express');
var fs = require('fs');
var app = express();
var csv = require('csv');
var CSVParse = csv.parse;

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index', { title: 'The index page!' });
});

app.get('/workbooks/:name', function(req, res) {
    var name = req.params.name;
    res.render('index', { title: name, workbookName: name });
});

app.get('/workbooks/:name/data', function(req, res) {
    var name = req.params.name;

    var defaultWorkbook = {
        name: name,
        worksheets: {
            0: {
                cells: {}
            },
            1: {
                cells: {}
            },
            2: {
                cells: {}
            }
        },
        worksheetsOrder: [0, 1, 2],
        activeWorksheet: 0
    };

    var book = defaultWorkbook;

    sheetCSV = __dirname + '/private/' + name + '.csv';
    if (fs.existsSync(sheetCSV)) {
        var data = fs.readFileSync(sheetCSV).toString('utf-8');
        CSVParse(data, {}, function(err, output) {
            for (var row = 0; row < output.length; row++) {
                for (var col = 0; col < output[row].length; col++) {
                    if (!book.worksheets[0].cells[row]) {
                        book.worksheets[0].cells[row] = {};
                    }
                    book.worksheets[0].cells[row][col] = {
                        value: output[row][col]
                    };
                }
            }
            res.send(book);
        });
    } else {
        res.send(book);
    }
});

var server = app.listen(24816, '0.0.0.0', function() {
    console.log('Listening on port %d', server.address().port);
});
