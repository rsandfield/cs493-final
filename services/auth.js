require('dotenv').config();

const {google} = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.client_id,
    process.env.client_secret,
    process.env.redirect_uri
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
                audience: process.env.client_id
            })
            .then(ticket => {
                req.user = ticket.getPayload();
                next();
            })
            .catch(next);
    },
    get_user_id(req) {
        if(req.user && req.user.sub) return req.user.sub;
        return null;
    }
}