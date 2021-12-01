const ds = require('../services/datastore');
const error = require('./error');
const Model = require("./model");
const TreasureModel = require('./treasure');
const treasureModel = new TreasureModel();

async function check_attributes(chest) {
    return Promise.resolve();
}

module.exports = class ChestModel extends Model {
    constructor() {
        super('chest');
    }

    async get_chests(owner, page_cursor) {
        return super.get_objects(owner, page_cursor)
    }

    async post_chest(owner, chest) {
        chest.owner = owner;
        chest.treasures = [];
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

    async get_chest_with_self(owner, chest_id) {
        return this.get_chest(owner, chest_id)
            .then(chest => {
                chest.treasures = chest.treasures
                    .map(treasure => ds.add_self('treasure', treasure))
                return ds.add_self(this.kind, chest)
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

    async delete_chest(owner, chest_id) {
        return this.get_chest(owner, chest_id)
            .then(_ => super.delete_object(chest_id))
    }
}