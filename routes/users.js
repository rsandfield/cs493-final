'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../services/auth')
const UserModel = require('../models/user')

router.get('/',
    (req, res, next) => UserModel.get_users()
        .then(users => res.status(200).json(users))
        .catch(next)
);

router.get('/:user_id',
    (req, res) => res.render('pages/user', {
        username: req.user.name,
        user_id: req.params.user_id,
        token: req.headers.authorization
    })
)

router.get('/login',
    (req, res) => res.redirect(auth.auth_url)
);

router.get('/token',
    auth.get_token,
    auth.get_user,
    (req, res) => res.redirect(`/users/${req.user.sub}`)
);

return router;