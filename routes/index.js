const error = require("../models/error");

module.exports = function(app) {
    app.use('/chests', require('./chests'));
    app.use('/treasures', require('./treasures'));
    app.use('/users', require('./users'));
    app.use('/', (req, res) => res.render('pages/welcome', { login: '/users/login'}));
    app.use(error.pageNotFound);
    app.use(error.handleErrors);
}