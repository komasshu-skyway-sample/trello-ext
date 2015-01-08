var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var https = require('https');
var util = require('util');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// load configuration
var conf = JSON.parse(fs.readFileSync("./config/config.conf"));
console.dir(conf);

// setup trello interface
var Trello = require('node-trello');
var key = conf.trello_api.key
  , token = conf.trello_api.token;
var t = new Trello(key, token);

// t.get("/1/boards/54a9f8fb368004effa65f244/cards?checklists=all&members=true&since=2015-01-01", function(err, cards) {
//       if (err) throw err;
//       // cards.forEach(function(card){
//       //   console.log(card.id, card.name, card.dateLastActivity);
//       //   console.dir(card.idMembers);
//       //   console.dir(card.checklists);
//       // });
//       console.log(util.inspect(cards[10], false, null));
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/lists', function(req, res) {
    if(!t) {
      throw "connecting to trello, wait for a while";
    } else {
      t.get("/1/boards/54a9f8fb368004effa65f244/lists?", function(err, lists) {
        if(err) throw err;

        res.render("lists", {"title": "list一覧", "lists": lists});
      });
    }
});


app.get('/lists/:list_id', function(req, res, next) {
    try {
      if(!t) {
        throw "connecting to trello, wait for a while";
      } else {
        var url = [
          "/1/lists/"
          , req.params.list_id
          , "/cards"
          , "?members=true&checklists=all&since=2015-01-01"
        ].join("");


        t.get(url, function(err, cards) {
          if(err) throw err;

          res.render("list_cards", {"title": "card一覧", "cards": cards});
        });
      }
    } catch(e) {
      next(e);
    }
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
