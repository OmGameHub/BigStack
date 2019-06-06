const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'myPerson'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    upvotes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'myPerson'
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    solutions: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'myPerson'
            },
            name: {
                type:  String
            },
            solution: {
                type: String,
                require: true
            },
            upvote: [
                {
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: 'myPerson'
                    }
                }
            ],
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Question = mongoose.model('myQuestion', QuestionSchema);