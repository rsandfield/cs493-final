'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../services/auth')
const UserModel = require('../models/user')
const userModel = new UserModel();

router.get('/',
    (req, res, next) => userModel.get_users()
        .then(users => res.status(200).json(users))
        .catch(next)
);

router.get('/login',
    (req, res) => res.redirect(auth.auth_url)
);

router.get('/token',
    auth.get_token,
    auth.get_user,
    (req, res) => res.redirect(
        `/users/${req.user.sub}?` +
        `username=${req.user.name}&` +
        `token=${req.headers.authorization}`
    )
);

router.get('/:user_id',
    (req, res) => {
        userModel.register_user(req.params.user_id);

        res.render('pages/user', {
            username: req.query.username,
            user_id: req.params.user_id,
            token: req.query.token
        })
    }
)

module.exports = router;