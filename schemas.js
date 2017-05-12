var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var submisionsSchema = new Schema({
  submitedBy: String,
  avgPrecision:Number,
  avgRecall:Number,
  avgF1:Number,
  submited: Date,
});

var submision = mongoose.model('submision', submisionsSchema);

//Export
module.exports = submision;