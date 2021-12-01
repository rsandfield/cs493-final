const error = require("../models/error");

module.exports = function(app) {
    app.use('/chests', './chests');
    app.use('/treasures', './treasures');
    app.use('/users', './users');
    app.use('/', (req, res) => res.render('pages/welcome', { login: '/users/login'}));
    app.use(error.pageNotFound);
    app.use(error.handleErrors);
}