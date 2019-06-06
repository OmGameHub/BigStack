const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LinuxQuestionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'myPerson'
    },
    description: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    error: {
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
            upvotes: [
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

module.exports = LinuxQuestion = mongoose.model('myLinuxQuestion', LinuxQuestionSchema);