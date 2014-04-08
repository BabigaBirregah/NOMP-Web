// user controller
var utils = require('../lib/utils');

var mongoose = require('mongoose');
var UserModel = mongoose.model('UserModel');
var NeedModel = mongoose.model('NeedModel');
var OfferModel = mongoose.model('OfferModel');


var login = function (req, res) {
    // hack the passport user
    handleAssociation(req, req.session.passport.user);
    if (req.session.returnTo) {
        res.redirect(req.session.returnTo)
        delete req.session.returnTo
        return
    }
  res.redirect('/')
};

/*
 * Sign in route
 */
exports.signin = function() {};


/*
 * Auth callback
 */
exports.authCallback = login

/*
 * Show login form
 */
exports.login = function(req, res) {
    res.render('users/login', {
        title: 'Login',
        message: req.flash('error'),
        req: req
    });
}

/*
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new UserModel(),
        req: req
    });
}

/*
 * Logout
 */
exports.logout = function(req, res) {
    req.session.returnTo = null;
    req.logout();
    res.redirect('/');
}

/*
 * Session
 */
exports.session = login


/*
 * Create new user
 */
exports.create = function(req, res) {
    var user = new UserModel(req.body);
    user.provider = 'local'
    user.save(function(err) {
        if (err) {
            console.log(err);
            return res.render('users/signup', {
                error: utils.errors(err.errors),
                user: user,
                title: 'Sign up',
                req: req
            });
        }
        else {
            // Associate the latest ticket
            handleAssociation(req, user._id);
            // Login the user once signed up
            req.logIn(user, function(err) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                return res.redirect('/');
            });
        }
    });
}


/*
 * Show profile
 */
exports.show = function(req, res) {
    var user = req.profile
    res.render('users/show', {
        title: user.name,
        user: user,
        req: req
    });
}


/*
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    UserModel
        .findOne({ _id: req.params.userId })
        .exec(function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return next(new Error('Failed to load User ' + id));
            }
            req.profile = user;
            next();
        });
}


exports.ownerList = function(req, res) {
    return res.render('users/owner_list', {
        title: 'My tickets',
        req: req
    });
}


// private function for handling the association between user and ticket
function handleAssociation(req, user_id) {
    if (typeof(req.session.ticket) !== 'undefined') {
        var ticket_tmp = req.session.ticket;
        // Reload the object, not work with the document
        // This is shit
        if (utils.getTicketType(ticket_tmp) == 'need') {
            NeedModel.load(ticket_tmp._id, function(err, ticket) {
                ticket.user = user_id;
                ticket.save();
            });
        }
        else if (utils.getTicketType(ticket_tmp) == 'offer') {
            OfferModel.load(ticket_tmp._id, function(err, ticket) {
                ticket.user = user_id;
                ticket.save();
            });
        }
        delete req.session.ticket;
    }
}


/*
 * TODO: RESTful GET users listing.
 */
exports.list = function(req, res){
  res.send("respond with a resource");
};