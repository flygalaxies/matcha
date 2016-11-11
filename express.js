import express from 'express';
import parseurl from 'parseurl';
import bodyParser from 'body-parser';
import session from 'express-session';
// import path from 'path';
import hbs from 'express-handlebars';
import { log } from 'console';
import _ from 'lodash';

const app = express();

app.set('view engine', 'handlebars'); // Set template engine
app.engine('handlebars', hbs({
  defaultLayout: 'main',
  helpers: {
    mod4: (key, options) => ((parseInt(key, 10) + 1) % 4) === 0 ? options.fn(this) : options.inverse(this),
  },
}));

process.env.NODE_ENV = 'production';

app.enable('view cache');
app.use(express.static('public'));
app.use(express.static('bower_components'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '5mb',
}));

app.use(session({
  secret: 'matcha',
  resave: false,
  saveUninitialized: true,
}));

app.use((req, res, next) => {
  let { views } = req.session;

  if (!views) {
    views = _.get(req.session, 'views', {});
  }
  // get the url pathname
  const pathname = parseurl(req).pathname;
  // count the views
  views[pathname] = (views[pathname] || 0) + 1;
  next();
});



var connect = require('connect');
var serveStatic = require('serve-static');
var vhost = require('vhost');

var mainapp = connect();

// add middlewares to mainapp for the main web site

// create app that will server user content from public/{username}/
var userapp = connect();

userapp.use(function (req, res, next) {
  var username = req.vhost[0]; // username is the "*"

  // pretend request was for /{username}/* for file serving
  req.originalUrl = req.url;
  req.url = '/' + username + req.url;

  next();
})
userapp.use(serveStatic('public'));

// create main app
var app1 = connect();

// add vhost routing for main app
app.use(vhost('userpages.local', mainapp));
app.use(vhost('www.userpages.local', mainapp));

// listen on all subdomains for user pages
app.use(vhost('*.userpages.local', userapp));

app.listen(3333, () => log('Listening on port 3333'));


export default app;