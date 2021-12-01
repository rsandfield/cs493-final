const error = require('./error')
const Model = require("./model");

async function check_attributes(chest) {
    return Promise.resolve();
}

module.exports = class ChestModel extends Model {
    constructor() {
        super('boat');
    }

    async get_chests(owner) {

    }

    async post_chest(owner, chest) {
        chest.owner = owner;
        return check_attributes(chest)
            .then(_ => super.post_object(chest))
    }

    async get_chest(owner, chest_id) {
        return super.get_object(chest_id)
            .then(chest => {
                if(chest.owner == owner) return chest;
                return new error.ChestNotFoundError();
            })
    }

    async replace_chest(owner, chest_id, chest) {
        chest.owner = owner;
        return check_attributes(chest)
            .then(_ => this.modify_chest(owner, chest_id, chest))
    }

    async modify_chest(owner, chest_id, chest) {
        chest.owner = owner;
        return this.get_chest(owner, chest_id)
            .then(oldChest => {
                Object.keys(chest).forEach(key => oldChest[key] = chest[key]);
                super.update_object(chest)
            })
    }
}