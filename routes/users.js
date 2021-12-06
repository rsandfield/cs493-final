'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../services/auth')
const UserModel = require('../models/user')
const userModel = new UserModel();

const error = require('../models/error');

/**
 * Get a list of all registered users
 */
router.get('/',
    error.acceptOnlyJson,
    (req, res, next) => userModel.get_users()
        .then(users => res.status(200).json(users))
        .catch(next)
);

/**
 * Proper errors for unused methods
 */
router.post('/', error.methodNotAllowed);
router.put('/', error.methodNotAllowed);
router.patch('/', error.methodNotAllowed);
router.delete('/', error.methodNotAllowed);

/**
 * Redirect login to Google OAuth server
 */
router.get('/login',
    (req, res) => res.redirect(auth.auth_url)
);

/**
 * Retreive token from Google OAuth server and redirect to user page
 */
router.get('/token',
    auth.get_token,
    auth.get_user,
    (req, res) => res.redirect(
        `/users/${req.user.sub}?` +
        `username=${req.user.name}&` +
        `token=${req.headers.authorization.substr(7)}`
    )
);

/**
 * Display user information
 */
router.get('/:user_id',
    (req, res) => {
        userModel.register_user(req.params.user_id, req.query.username);
        
        res.render('pages/user', {
            username: req.query.username,
            user_id: req.params.user_id,
            token: req.query.token
        })
    }
)

/**
 * Proper errors for unused methods
 */
router.post('/user_id', error.methodNotAllowed);
router.put('/user_id', error.methodNotAllowed);
router.patch('/user_id', error.methodNotAllowed);
router.delete('/user_id', error.methodNotAllowed);

module.exports = router;