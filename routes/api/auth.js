const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../setup/myurl');

// @type    GET
// @route   /api/auth
// @desc    just for testing
// @access  PUBLIC
router.get('/', (req, res) => { res.json({ test: 'Auth is being tested' }); });

// Import Schema for Person to Regiseter
const Person = require('../../models/Person');

// @type    POST
// @route   /api/auth/register
// @desc    route for registration of user 
// @access  PUBLIC
router.post('/register', 
    (req, res) => { 
        Person.findOne({ email: req.body.email })
            .then((preson) => { 
                if (preson) {
                    return res
                        .status(400)
                        .json({ emailerror: 'Email is already registered in our system' });
                } else {
                    const newPreson = new Person({
                        name: req.body.name,
                        email: req.body.email,
                        password: req.body.password,
                        gender: req.body.gender,
                        profilepic: (req.body.gender == 'm' || req.body.gender == 'M')? 'Man pic' : 'Female pic'
                    });

                    // Encrypt password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPreson.password, salt, (err, hash) => {
                            if (err) throw err;
                            newPreson.password = hash;
                            newPreson.save()
                                .then((preson) => res.json(preson))
                                .catch((err) => console.log(err));
                        });
                    });
                }
            })
            .catch((err) => console.log(err));
});

// @type    POST
// @route   /api/auth/login
// @desc    route for login of user 
// @access  PUBLIC
router.post('/login', 
    (req, res) => {
        const email = req.body.email;
        const password = req.body.password;

        Person.findOne({ email })
            .then( (preson) => {
                if (!preson) {
                    return res.status(404).json({ error: 'Invalid email id' });
                }

                bcrypt.compare(password, preson.password)
                    .then( (isCorrect) => {
                        if (isCorrect) {
                            // res.json({ success: 'user is login successfully' });
                            // use payload and create for user
                            const payload = {
                                id: preson.id,
                                name: preson.name,
                                email: preson.email,
                            };

                            jsonwt.sign(
                                payload, 
                                key.secret, 
                                { expiresIn: 3600 }, 
                                (err, token) => {
                                    if (err) throw err;

                                    res.json({
                                        success: true,
                                        token: 'Bearer ' + token
                                    });
                                }
                            );
                        } else {
                            res.status(400).json({ passworderror: 'password is not correct' });   
                        }
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
});

// @type    GET
// @route   /api/auth/profile
// @desc    route for user profile 
// @access  PRIVATE
router.get(
    '/profile', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
    // console.log(req);
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        gender: req.user.gender,
        profilepic: req.user.profilepic
    });
});

module.exports = router;