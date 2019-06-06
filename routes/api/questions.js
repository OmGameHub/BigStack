const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load person model
const Person = require('../../models/Person');

// Load question model
const Question = require('../../models/Question');

// @type    GET
// @route   /api/questions
// @desc    route for showing all questions
// @access  PUBLIC
router.get('/', 
    (req, res) => { 
        Question.find()
            .sort({'date': -1})
            .then(questions => {
                if (!questions) {
                    return res.status(404).json({ error: 'Questions not found' });
                }

                res.json(questions);
            })
            .catch(err => console.log('Error in fetching questions: ' + err));
    }
);

// @type    POST
// @route   /api/questions
// @desc    route for submitting question 
// @access  PRIVATE
router.post(
    '/', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        const newQuestion = new Question({
            user: req.user.id,
            title: req.body.title,
            description: req.body.description,
            name: req.body.name
        });

        newQuestion.save()
            .then(question => res.json(question))
            .catch(err => console.log('Unable to submit question: ' + err));
    }
);

// @type    DELETE
// @route   /api/questions/delete/:q_id
// @desc    route for deleting user question by QUESTION ID
// @access  PRIVATE
router.delete(
    '/delete/:q_id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Question.findById(req.params.q_id)
            .then(question => {
                if (!question) {
                    return res.status(404).json({ message: 'Not able to find question' });
                }

                if (question.user.toString() === req.user.id.toString()) {
                    Question.findByIdAndRemove(req.params.q_id)
                        .then(() => { res.json({ message: 'user question delete successfully' }) })
                        .catch(err => console.log('Error in deleting user submited question: ' + err));   
                } else {
                    return res.status(400).json({ message: 'This question is not submited by you' });
                }
            })
            .catch(err => console.log('Error in fetching question: ' + err));
    }
);

// @type    DELETE
// @route   /api/questions/delete
// @desc    route for deleting all questions submited by USER ID
// @access  PRIVATE
router.delete(
    '/delete', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Question.find({ user: req.user.id })
            .then((questions) => { 
                if (!questions) {
                    return res.status(404).json({message: 'No questions found'});
                } 

                if (questions.length <= 0) {
                    return res.status(404).json({message: 'No questions found submited by you'});
                } 

                Question.deleteMany({ user: req.user.id })
                    .then(() => {  res.json({ message: 'user all questions deleted successfully' }) })
                    .catch(err => console.log('Error in deleting all questions: ' + err));
            }) 
            .catch(err => console.log('Error in fetching questions: ' + err));
    }
);

// @type    POST
// @route   /api/questions/upvote/:q_id
// @desc    route for submitting upvote to question
// @access  PRIVATE
router.post(
    '/upvote/:q_id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Question.findById(req.params.q_id)
            .then(question => {
                if (!question) { return res.status(404).json({ error: 'question not found' }); }

                if (question.upvotes
                    .filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0) {

                        // assignement - remove upvoting
                        const removethis = question.upvotes
                            .map(item => item.id)
                            .indexOf(req.params.q_id);

                        question.upvotes.splice(removethis, 1);
                        question.save()
                            .then(question => { res.json({ message: 'remove vote from upvotes' }) })
                            .catch(err => console.log('Error in removing user vote: ' + err));
                } else {
                    question.upvotes.unshift({ user: req.user.id });
                    question.save()
                        .then(question => { res.json(question) })
                        .catch(err => console.log('Error in submit upvote: ' + err));
                }
            })
            .catch(err => console.log('Error in fetching question: ' + err));
    }
);


// @type    POST
// @route   /api/questions/solution/:q_id
// @desc    route for submitting solution by question ID
// @access  PRIVATE
router.post(
    '/solution/:q_id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Question.findById(req.params.q_id)
            .then(question => {
                if (!question) {
                    return res.status(404).json({ error: 'question not found' });
                }

                const mySolution = {
                    user: req.user.id,
                    solution: req.body.solution
                };

                question.solutions.unshift(mySolution);
                question.save()
                    .then(question => { res.json(question) })
                    .catch(err => console.log('Error in submit solution: ' + err));

            })
            .catch(err => console.log('Error in fetching question: ' + err));
    }
);


// @type    POST
// @route   /api/questions/solution/upvote/:q_id&:s_id
// @desc    route for submitting upvote to solution
// @access  PRIVATE
router.post(
    '/solution/upvote/:q_id-:s_id', 
    passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        Question.findById(req.params.q_id)
            .then(question => {
                if (!question) { return res.status(404).json({ error: 'question not found' }); }

                const solutionIndex = question.solutions
                    .map(item => item.id)
                    .indexOf(req.params.s_id);

                if (solutionIndex < 0) { return res.status(404).json({ error: 'solution not found' }); }

                const solution = question.solutions[solutionIndex];

                if (solution.upvotes
                    .filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0) {

                        // assignement - remove upvoting
                        const removethis = solution.upvotes
                            .map(item => item.id)
                            .indexOf(req.params.q_id);

                            solution.upvotes.splice(removethis, 1);
                        question.save()
                            .then(question => { res.json({ message: 'remove vote from upvotes in solution' }) })
                            .catch(err => console.log('Error in removing user vote in solution: ' + err));
                } else {
                    solution.upvotes.unshift({ user: req.user.id });
                    question.save()
                        .then(question => { res.json(question); })
                        .catch(err => console.log('Error in submit upvote in solution: ' + err));
                }
                
            })
            .catch(err => console.log('Error in fetching question: ' + err));
    }
);

module.exports = router;