var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cons = require('consolidate');

var indexRouter = require('./routes/index_routes');
var wordsRouter = require('./routes/words_routes');
var quizRouter = require('./routes/quiz_routes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/words', wordsRouter);
app.use('/quiz', quizRouter);

// view engine setup
app.engine('html', cons.swig)
app.set('views', 'public/views');
app.set('view engine', 'html');

module.exports = app;