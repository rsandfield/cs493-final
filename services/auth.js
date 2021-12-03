const {google} = require('googleapis');
const secret = require('../secrets/oauth_secret.json').web;
const error = require('../models/error')

const oauth2Client = new google.auth.OAuth2(
    secret.client_id,
    secret.client_secret,
    secret.redirect_uris[0]
);

const scopes = [ 'profile' ];

module.exports = {
    auth_url: oauth2Client.generateAuthUrl({ scope: scopes }),
    get_token(req, res, next) {
        oauth2Client.getToken(req.query.code)
            .then(tokens => {
                req.headers.authorization = "Bearer " + tokens["tokens"]["id_token"];
                next();
            })
            .catch(next)
    },
    get_user(req, res, next) {
        if(!req.headers.authorization) return next();
        let token = req.headers.authorization.substring(7);
        
        oauth2Client
            .verifyIdToken({
                idToken: token,
                audience: secret.client_id
            })
            .then(ticket => {
                req.user = ticket.getPayload();
                next();
            })
            .catch(next);
    },
    check_for_user(req, res, next) {
        if(!req.user) next(new error.InvalidTokenError());
        next();
    },
    get_user_id(req) {
        if(req.user && req.user.sub) return req.user.sub;
        return null;
    }
}