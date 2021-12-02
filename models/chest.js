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

    /**
     * Replaces the treasure ID array with an array of treasure objects
     * @param {String} owner 
     * @param {Chest} chest 
     * @returns 
     */
    async add_chest_treasure_details(owner, chest) {
        chest.treasures = chest.treasures.map(treasure_id =>
                treasureModel.get_treasure_with_self(owner, treasure_id))
        return chest;
    }

    /**
     * Gets a paginated list of chests belonging to the owner, starting from
     * the provided page cursor
     * @param {String} owner 
     * @param {Sting} page_cursor 
     * @returns 
     */
    async get_chests(owner, page_cursor) {
        return super.get_objects(owner, page_cursor)
            .then(chests => chests.map(chest =>
                this.add_chest_treasure_details(owner, chest)))
    }

    /**
     * Checks that all required attributes are provided and then creates a new
     * chest in the database belonging to the given user
     * @param {String} owner 
     * @param {Chest} chest 
     * @returns 
     */
    async post_chest(owner, chest) {
        chest.owner = owner;
        chest.treasures = [];
        return check_attributes(chest)
            .then(_ => super.post_object(chest))
    }

    /**
     * Gets the requested chest from the database and return it if the chest's
     * owner matches the one provided
     * @param {String} owner 
     * @param {Number} chest_id 
     * @returns 
     */
    async get_chest(owner, chest_id) {
        return super.get_object(chest_id)
            .then(chest => {
                if(chest.owner == owner) return chest;
                return new error.ChestNotFoundError();
            })
    }

    /**
     * Gets the requested chest from the database and return it with a self
     * link and details for any contained treasures if the chest's owner
     * matches the one provided
     * @param {String} owner 
     * @param {Number} chest_id 
     * @returns 
     */
    async get_chest_with_self(owner, chest_id) {
        return this.get_chest(owner, chest_id)
            .then(chest => ds.add_self(this.kind, chest)
                .add_chest_treasure_details(owner, chest)
            )
    }

    /**
     * Checks that all required attributes are provided and then replaces the
     * given chest with the new data if the chest's owner matches the one
     * provided
     * @param {String} owner 
     * @param {Number} chest_id 
     * @param {Chest} chest 
     * @returns 
     */
    async replace_chest(owner, chest_id, chest) {
        chest.owner = owner;
        return check_attributes(chest)
            .then(_ => this.modify_chest(owner, chest_id, chest))
    }

    /**
     * Replaces the given attributes within the given chest with the new data
     * if the chest's owner matches the one provided
     * @param {String} owner 
     * @param {Number} chest_id 
     * @param {Chest} chest 
     * @returns 
     */
    async modify_chest(owner, chest_id, chest) {
        chest.owner = owner;
        return this.get_chest(owner, chest_id)
            .then(oldChest => {
                Object.keys(chest).forEach(key => oldChest[key] = chest[key]);
                super.update_object(chest)
            })
    }

    /**
     * Adds the provided treasure to the provided chest if the owner of both
     * matches the provided owner.
     * @param {String} owner 
     * @param {Number} chest_id 
     * @param {Number} treasure_id 
     * @returns 
     */
    async add_treasure(owner, chest_id, treasure_id) {
        return this.get_chest(owner, chest_id)
            .then(chest => treasureModel.get_treasure(owner, treasure_id)
                .then(treasure => {
                    chest.treasures.push(treasure_id);
                    treasure.chest = chest_id;
                    
                    return ds.save_item(chest)
                        .then(_ => ds.save_item(treasure))
                })
            )
    }

    /**
     * Removes the provided treasure to the provided chest if the owner of both
     * matches the provided owner.
     * @param {String} owner 
     * @param {Number} chest_id 
     * @param {Number} treasure_id 
     * @returns 
     */
    async remove_treasure(owner, chest_id, treasure_id) {
        return this.get_chest(owner, chest_id)
            .then(chest => treasureModel.get_treasure(owner, treasure_id)
                .then(treasure => {
                    let index = chest.treasures.indexOf(treasure_id);
                    if(index < 0) return new error.TreasureNotInChestError();

                    chest.treasures = chest.treasures.splice(index, 1)

                    treasureModel.modify_treasure(
                        owner, treasure.id, { chest: null }
                    );
                    
                    return ds.save_item(chest);
                })
            )
    }

    /**
     * Deletes the provided chest if the chest's owner matches the provided
     * owner. Will propagate and remove the chest ID from any treasure which is
     * contained within the chest.
     * @param {String} owner 
     * @param {Number} chest_id 
     * @returns 
     */
    async delete_chest(owner, chest_id) {
        return this.get_chest(owner, chest_id)
            .then(chest => {
                chest.treasures.forEach(treasure_id =>
                    treasureModel.modify_treasure(
                        owner, treasure_id, { chest: null }
                    )
                );

                return super.delete_object(chest_id);
            })
    }
}