module.exports = function(app) {
    app.use('/chests', './chests');
    app.use('/treasures', './treasures');
    app.use('/users', './users');
}