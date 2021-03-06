// admin controller
// manage class, actor type and users
var utils = require('../lib/utils');

var mongoose = require('mongoose');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');
var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');


exports.index = function(req, res) {
    return res.render('admin/index', {
        title: 'Admin backend',
        req: req
    })
}

exports.classification = function(req, res) {
    ClassificationModel.list(function(err, list) {
        if (!err) {
            return res.render('admin/classification', {
                title: 'Edit Classification',
                classifications: list,
                req: req
            });
        }
    });
}

exports.actorType = function(req, res) {
    ActorTypeModel.list(function(err, list) {
        return res.render('admin/actortype', {
            title: 'Edit Actor Type',
            actortypes: list,
            req: req
        });
    });
}

exports.editClassification = function(req, res) {
    var tmp_parent_classification = JSON.parse(req.body.parent_classification);
    req.body.parent = tmp_parent_classification.id;
    req.body.parent_name = tmp_parent_classification.name;

    // Update
    if (typeof(req.body.id) !== 'undefined') {
        ClassificationModel.load(req.body.id.toString(), function(err, item) {
            item.parent = tmp_parent_classification.id;
            item.parent_name = tmp_parent_classification.name;
            item.name = req.body.name;
            item.save(function(err) {
                return res.redirect('/admin/classification');
            });
        });
    }
    else {
        var c = new ClassificationModel(req.body);
        c.save(function(err) {
            return res.redirect('/admin/classification');
        });
    }
}

exports.deleteClassification = function(req, res) {
    var id = req.params.classId;
    ClassificationModel.load(id, function(err, item) {
        item.remove(function(err) {
            return res.redirect('/admin/classification');
        });
    });
}

exports.editActorType = function(req, res) {
    var tmp_parent_actortype = JSON.parse(req.body.parent_actortype);
    req.body.parent = tmp_parent_actortype.id;
    req.body.parent_name = tmp_parent_actortype.name;

    // Update
    if (typeof(req.body.id) !== 'undefined') {
        ActorTypeModel.load(req.body.id.toString(), function(err, item) {
            item.parent = tmp_parent_actortype.id;
            item.parent_name = tmp_parent_actortype.name;
            item.name = req.body.name;
            item.save(function(err) {
                return res.redirect('/admin/actortype');
            });
        });
    }
    else {
        var c = new ActorTypeModel(req.body);
        c.save(function(err) {
            return res.redirect('/admin/actortype');
        });
    }
}

exports.deleteActorType = function(req, res) {
    var id = req.params.actorId;
    ActorTypeModel.load(id, function(err, item) {
        item.remove(function(err) {
            return res.redirect('/admin/actortype');
        });
    });
}

exports.ticketUpdate = function(req, res) {
    NeedModel.list({}, function(err, need_list) {
        for (var index=0; index<need_list.length; index++) {
            need_list[index].save();
        }
    });
    OfferModel.list({}, function(err, offer_list) {
        for (var index=0; index<offer_list.length; index++) {
            offer_list[index].save();
        }
    });
    return res.json({statuts: 'OK'});
}