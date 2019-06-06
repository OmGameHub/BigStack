const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport = require('passport');

// bring all routes
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const questions = require('./routes/api/questions');
const linuxQuestions = require('./routes/api/linuxQuestions');

const app = express();

// middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// mongoDB config
const db = require('./setup/myurl').mongoURL;

// attempt to connect to database 
mongoose
    .connect(db)
    .then(() => console.log('MongoDB connect successfully'))
    .catch(err => console.log(err));

// passport middleware
app.use(passport.initialize());

// config for jwt strategy
require('./strategies/jsonwtStrategy')(passport);

// just for testing route
app.get('/', (req, res) => {
    res.send('Welcome to Big stack. It is very cool');
});

// actual route
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/questions', questions);
app.use('/api/linuxQuestions', linuxQuestions);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server is running at ${port}`));