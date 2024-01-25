require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts')
const methodOverride = require('method-override');
const connectionDB = require('./server/config/db')

const app = express();
const PORT = process.env.PORT;

connectionDB();
const { isActive } = require('./server/helpers/routeHelpers')
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
var cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');


app.use(express.static('public'));

// Template Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
  }));

app.locals.isActive = isActive;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

app.listen(PORT, (err) => {
    if(err){
        console.log("Error");
    }
    console.log(`Successful Connection On Port -> ${PORT}`);
})