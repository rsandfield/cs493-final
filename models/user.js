const ds = require('../services/datastore');
const error = require("./error");
const Model = require("./model");

module.exports = class UserModel extends Model {
    constructor() {
        super("user");
    }

    async get_users() {
        return ds.get_items(this.kind)
            .map(user => ds.add_self(this.kind, user))
    }

    async register_user(user_id) {
        return super.get_object(user_id)
            .then(user => console.log(user))
            .catch(err => {
                console.log(err)
                if(err.status == 404) {
                    return ds.datastore.save({
                        "key": ds.datastore.key([
                            this.kind,
                            parseInt(user_id, 10)
                        ]),
                        "data": {} }
                    )
                }
                return err;
            })
    }
}