// tickets.js
/*
 * GET ticket home page.
 */
var path = require('path');
var async = require('async');

var url = require('url');
var mongoose = require('mongoose');
var utils = require('../lib/utils');
var TicketModel = mongoose.model('TicketModel');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');
var ClassificationModel = mongoose.model('ClassificationModel');
var ActorTypeModel = mongoose.model('ActorTypeModel');
var MatchingModel = mongoose.model('MatchingModel');


/*
 * Load
 */
exports.load = function(req, res, next, id) {
    async.waterfall([
        function(callback) {
            if(req.params.type === 'need') {
                NeedModel.load(req.params.ticketId, function(err, ticket) {
                    callback(null, ticket);
                });
            }
            else if(req.params.type === 'offer') {
                OfferModel.load(req.params.ticketId, function(err, ticket) {
                    callback(null, ticket);
                });
            }
        }
    ], function(err, ticket) {
        if (err) {
            return next(err);
        }
        if (!ticket) {
            return next(new Error('not found'));
        }
        req.ticket = ticket;
        next();
    });
};
/*
 * Logic: the index ticket page is empty concerning mongoose
 * We may use REST conception to get the list of tickets
 */
exports.index = function(req, res) {
    var ticket_type = req.params.type;
    if (typeof(ticket_type) === undefined) {
        var title = 'HomePage';
    }
    else {
        var title = 'List of ' + ticket_type;
    }
    res.render('tickets/index', {
        title: '',
        ticket_type: ticket_type,
        req: req
    });
};

exports.new = function(req, res) {
    if (req.params.type === 'need') {
        var ticket = new NeedModel(req.body);
    }
    else if (req.params.type === 'offer') {
        var ticket = new OfferModel(req.body);
    }
    res.render('tickets/form', {
        title: 'Create a new ' + req.params.type,
        ticket: ticket,
        ticket_type: req.params.type,
        post_action: (req.params.type + '/create').toString(),
        req: req
    });
};

exports.create = function(req, res) {
    // Sanitization of req.body, fetch class and actor_type
    var tmp_classification = JSON.parse(req.body.classification);
    req.body.classification = tmp_classification.id;
    req.body.classification_name = tmp_classification.name;
    // Same thing for source/target actor type
    var tmp_source_actor_type = JSON.parse(req.body.source_actor_type);
    req.body.source_actor_type = tmp_source_actor_type.id;
    req.body.source_actor_type_name = tmp_source_actor_type.name;

    var tmp_target_actor_type = JSON.parse(req.body.target_actor_type);
    req.body.target_actor_type = tmp_target_actor_type.id;
    req.body.target_actor_type_name = tmp_target_actor_type.name;

    if (req.body.ticket_type === 'need') {
        var ticket = new NeedModel(req.body);
    }
    else if (req.body.ticket_type === 'offer') {
        var ticket = new OfferModel(req.body);
    }

    // fetch class, actorType names
    async.waterfall([
        // associate image temp path
        function(callback) {
            for (var index=0; index<req.files.image[0].length; index++) {
                if (req.files.image[0][index].size > 0) {
                    ticket.media.image.push(req.files.image[0][index].path);
                }
            }
            callback(null, ticket);
        },
        // associate user if req is authenticated
        function(ticket, callback) {
            if (req.isAuthenticated()) {
                ticket.user = req.user._id;
                callback(null, ticket);
            }
            else {
                callback(null, ticket);
            }
        }
    ], function(err, ticket) {
        ticket.creatAndSave(function(err) {
            if (err) {
                return res.render('tickets/form', {
                    error: utils.errors(err.errors),
                    ticket: ticket,
                    title: 'Create a new ' + req.body.ticket_type,
                    ticket_type: req.body.ticket_type,
                    post_action: (req.body.ticket_type + '/create').toString(),
                    req: req
                });
            } else {
                req.flash('info', 'Please remember this reference: <b>' + ticket.reference + '</b> in order to modify the ' + req.body.ticket_type + ' in the future');
                if (!req.isAuthenticated()) {
                    req.session.ticket = ticket;
                    // TODO: with a form
                    var signup_link = '<a href="/signup"><b>Sign up</b></a>';
                    var login_link = '<a href="/login"><b>Login</b></a>';
                    req.flash('info', 'Or do you want to ' + signup_link + ' or ' + login_link + '?');
                }
                // load ticket view once created
                return res.redirect(req.body.ticket_type + '/' + ticket._id);
            }
        });
    });
};

exports.show = function(req, res) {
    var ticket = req.ticket;
    var render_data = {
        ticket: ticket,
        title: ticket.name,
        ticket_type: req.params.type,
        req: req
    };
    // Use ajax to get the content of source ticket
    if (typeof(req.query.source_id) !== 'undefined') {
        render_data.source_id = req.query.source_id,
        render_data.source_type = req.query.source_type
    }
    return res.render('tickets/show', render_data);
};

exports.edit = function(req, res) {
    if (typeof(req.body.reference) !== 'undefined') {
        // Trim the reference body
        var reference = req.body.reference.trim();
    }
    // Use ref to modify directly
    if (typeof(req.params.ticketId) == 'undefined') {
        async.waterfall([
            function(callback) {
                OfferModel.findTicketByReference(reference, function(err, ticket) {
                    if (ticket !== null) {
                        callback(null, ticket);
                    }
                    else {
                        NeedModel.findTicketByReference(reference, function(err, ticket) {
                            if (ticket !== null) {
                                callback(null, ticket);
                            }
                            else {
                                //req.flash('warning', 'The reference is not right');
                                return res.render('users/login', {
                                    title: 'Login',
                                    //message: req.flash('error'),
                                    message: 'The reference is not right',
                                    req: req
                                });
                            }
                        });
                    }
                });
            }
        ], function(err, ticket) {
            var ticket_type = utils.getTicketType(ticket);
            return res.render('tickets/form', {
                ticket: ticket,
                ticket_type: ticket_type,
                title: ticket.name,
                post_action: (ticket_type + '/' + ticket._id).toString(),
                req: req,
            });
        });
    }
    // Modify -> Auth
    if (typeof(req.ticket) !== 'undefined') {
        var ticket = req.ticket;
        if (reference === req.ticket.reference || req.isAuthenticated()) {
            var ticket_type = utils.getTicketType(ticket);
            return res.render('tickets/form', {
                ticket: ticket,
                ticket_type: ticket_type,
                title: ticket.name,
                post_action: (ticket_type + '/' + ticket._id).toString(),
                req: req,
            });
        }
        else {
            req.flash('warning', 'The reference is not right');
            return res.render('users/login', {
                title: 'Login',
                message: req.flash('error'),
                req: req
            });
        }
    }
};

exports.delete = function(req, res) {
    var ticketToDelete = req.ticket;
    ticketToDelete.desactive(function(err) {
        return res.redirect('/');
    });
}

exports.update = function(req, res) {
    var ticket_type = req.params.type;
    var ticket = req.ticket;
    if (typeof(req.files.image) !== 'undefined') {
        req.body.media = {};
        req.body.media.image = [];
        for (var index=0; index<req.files.image[0].length; index++) {
            if (req.files.image[0][index].size > 0) {
                req.body.media.image.push(req.files.image[0][index].path);
            }
        }
    }
    ticket.update(req.body, function(err) {
        if (!err) {
            return res.redirect('/' + ticket_type + '/' + ticket._id);
        }
        return res.render('tickets/form', {
            error: utils.errors(err.errors),
            ticket: ticket,
            title: ticket.name,
            ticket_type: ticket_type,
            post_action: (ticket_type + '/' + ticket._id).toString(),
            req: req
        });
    });
}


exports.list = function(req, res) {
    // TODO: pagination or limit of data size

    // TODO and ATTENTION: add 'public' target_actor_type._id, now I just use this
    // Attention: This is a mongoDB query, not Mongoose
    if (req.isAuthenticated()) {
        var target_actor_type = {$in: ['5336b94ac1bde7b41d90377a', req.user.actor_type]};
    } else {
        var target_actor_type = {$in: ['5336b94ac1bde7b41d90377a']};
    }
    var options = {
        criteria: {
            is_active: 1,
            target_actor_type: target_actor_type,
    }};
    
    if (req.query.limit) {
        options.limit = req.query.limit;
    }
    if (req.query.offset) {
        options.offset = req.query.offset;
    }
    
    if (req.params.type == 'need') {
        NeedModel.listToJson(options, function(err, items) {
            res.json(items);
        });
    }
    else if (req.params.type == 'offer') {
        OfferModel.listToJson(options, function(err, items) {
            res.json(items);
        });
    }
}

exports.showJson = function(req, res) {
    if (req.params.type == 'need') {
        NeedModel.loadJson(req.params.ticketId, function(err, item) {
            res.json(item);
        });
    }
    else if (req.params.type == 'offer') {
        OfferModel.loadJson(req.params.ticketId, function(err, item) {
            res.json(item);
        });
    }
}

exports.ownerJsonList = function(req, res) {
    var options = { criteria: { user: req.user._id } };
    if (req.params.type === 'need') {
        NeedModel.listToJson(options, function(err, items) {
            res.json(items);
        });
    }
    else if (req.params.type === 'offer') {
        OfferModel.listToJson(options, function(err, items) {
            res.json(items);
        })
    }
}

exports.class_list = function(req, res) {
    ClassificationModel.listToJson(function(err, items) {
        res.json(items);
    });
}

exports.actor_type_list = function(req, res) {
    ActorTypeModel.listToJson(function(err, items) {
        res.json(items);
    });
}

exports.maps = function(req, res) {
    console.log(Object.keys(req));
    res.render('tickets/maps', {
        req: req
    });
}
