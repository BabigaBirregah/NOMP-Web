// ActorTypeModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// 
var ActorTypeModelSchema = new Schema({
    name: {type: String},
    parent: {type: Schema.ObjectId},
    parent_name: {type: String, trim: true},
    is_parent: {type: Boolean, default: false},
});


ActorTypeModelSchema.statics = {
    load: function(id, cb) {
        this.findOne({ _id: id }).exec(cb);
    },
    loadJson: function(id, cb) {
        this.findOne({ _id: id }).lean().exec(cb);
    },
    list: function(cb) {
        this.find().exec(cb);
    },
    listToJson: function(options, cb) {
        var criteria = options.criteria || {};
        var query = this.find(criteria).lean();
        if (options.select) {
            query.select(options.select);
        }
        query.exec(cb);
    },
    retrieveByValue: function(val, cb) {
        this.findOne({ name: val }).exec(cb);
    },
    retrieveParentListByValue: function(val, cb) {
        this.find({ parent_name: val }).exec(cb);
    },
    parentList: function(cb) {
        this.find({ is_parent: true }).exec(cb);
    },
    parentListToJson: function(cb) {
        this.find({ is_parent: true }).lean().exec(cb);
    }
};


// Built and exports Model from Schema
mongoose.model('ActorTypeModel', ActorTypeModelSchema);
exports.ActorTypeModel = mongoose.model('ActorTypeModel');
