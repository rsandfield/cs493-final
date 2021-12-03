const ds = require('../services/datastore');
const error = require("./error");
const Model = require("./model");

module.exports = class UserModel extends Model {
    constructor() {
        super("user");
    }

    async get_users() {
        return ds.get_items(this.kind)
            .then(results => results[0].map(user =>
                ds.add_self(this.kind, ds.from_datastore(user))))
    }

    async register_user(user_id, username) {
        let safe_id = parseInt(user_id.substr(3), 10)  // Too long for Datastore
        
        return super.get_object(safe_id)
            .catch(err => {
                if(err.status == 404) {
                    return ds.datastore.save({
                        "key": ds.datastore.key([this.kind, safe_id]),
                        "data": {
                            sub: user_id,
                            name: username
                        }
                    })
                }
                return err;
            })
    }
}