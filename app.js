const createError = require('http-errors');
const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('hbs');
const fs = require('fs-extra');
const rfs = require('rotating-file-stream');
const error = require('debug')('notes:error');
const util = require('util');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
const notesRouter = require('./routes/notes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

// var accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a'})
var logStream;
// Log to a file if requested
if (process.env.REQUEST_LOG_FILE) {
  (async () => {
    let logDirectory = path.dirname(process.env.REQUEST_LOG_FILE);
    await fs.ensureDir(logDirectory);
    logStream = rfs(process.env.REQUEST_LOG_FILE, {
      size: "10M", // rotate every 10 MegaBytes written
      interval: "1d", // rotate daily
      compress: "gzip" // compress rotated files
    })
  })().catch(err => { console.error(err); })
}

process.on('uncaughtException', function(err) {
  error('I\'ve crashed!!! - '+ (err.stack || err));
});

process.on('unhandledRejection', (reason, p) => {
  error(`Unhandled Rejection at: ${util.inspect(p)} reason: ${reason}`);
});

app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', 
  {stream: logStream ? logStream: process.stdout}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/vendor/bootstrap', express.static(
  path.join(__dirname, 'node_modules', 'bootstrap', 'dist')
))
app.use('/assets/vendor/jquery', express.static(
  path.join(__dirname, 'node_modules', 'jquery')
))
app.use('/assets/vendor/popper.js', express.static(
  path.join(__dirname, 'node_modules', 'popper.js', 'dist')
))
app.use('/assets/vendor/feather-icons', express.static(
  path.join(__dirname, 'node_modules', 'feather-icons', 'dist')
))

app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/notes', notesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
