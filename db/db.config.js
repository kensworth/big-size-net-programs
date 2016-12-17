const mongoose = require('mongoose');
const bluebird = require("bluebird");
const Schema = mongoose.Schema;

mongoose.Promise = bluebird;

const dbmodels = require("./db.models.js");
const programSchema = dbmodels.programSchema;
const submissionSchema = dbmodels.submissionSchema;

mongoose.connect('mongodb://localhost/big-size');


mongoose.model('Submission', submissionSchema);
mongoose.model('Program', programSchema);
