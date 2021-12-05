const ds = require('../services/datastore');
const error = require('./error');
const Model = require("./model");
const TreasureModel = require('./treasure');
const treasureModel = new TreasureModel();

async function check_attributes(chest) {
    if(!chest.type || !chest.material || !chest.volume) {
        return Promise.reject(new error.MissingAttributeError())
    }
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
        return Promise.all(chest.treasures.map(treasure_id =>
            treasureModel.get_treasure_with_self(owner, treasure_id)))
                .then(treasures => {
                    chest.treasures = treasures;
                    return chest;
                })
    }

    async check_remaining_volume(owner, chest, treasure) {
        return this.add_chest_treasure_details(owner, chest)
            .then(chest => {
                let occupied = chest.treasures
                    .map(treasure => treasure.volume)
                    .reduce((previous, current) => previous + current, 0)
                return chest.volume >= occupied + treasure.volume;
            })
    }

    /**
     * Gets a paginated list of chests belonging to the owner, starting from
     * the provided page cursor
     * @param {String} owner 
     * @param {Sting} page_cursor 
     * @returns 
     */
    async get_chests(owner, page_cursor) {
        return super.get_objects_by_owner(owner, page_cursor)
            .then(response => Promise.all(response["objects"]
                .map(chest => this.add_chest_treasure_details(owner, chest))
            )
                .then(chests => ({
                    "chests": chests,
                    "next": response["next"]
                }))
            )
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
                return Promise.reject(new error.ChestNotFoundError());
            })
            .catch(err => {
                if(err.status == 404) {
                    return Promise.reject(new error.ChestNotFoundError());
                }
                return Promise.reject(err);
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
            .then(chest => this.add_chest_treasure_details(
                owner, ds.add_self(this.kind, ds.from_datastore(chest)))
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
            .then(_ => this.update_chest(owner, chest_id, chest))
    }

    /**
     * Replaces the given attributes within the given chest with the new data
     * if the chest's owner matches the one provided
     * @param {String} owner 
     * @param {Number} chest_id 
     * @param {Chest} chest 
     * @returns 
     */
    async update_chest(owner, chest_id, chest) {
        chest.owner = owner;
        return this.get_chest(owner, chest_id)
            .then(oldChest => {
                Object.keys(chest).forEach(key => oldChest[key] = chest[key]);
                super.update_object(oldChest)
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
                    if(treasure.chest) {
                        return Promise.reject(
                            new error.TreasureAlreadyInChestError());
                    }

                    let treasures = chest.treasures;

                    return this.check_remaining_volume(owner, chest, treasure)
                        .then(fits => {
                            if(fits) {
                                treasures.push(treasure_id);
                                chest.treasures = treasures;
                                treasure.chest = chest_id;
                                
                                return ds.save_item(chest)
                                    .then(_ => ds.save_item(treasure))
                            } else {
                                return Promise.reject(
                                    new error.ChestFullError());
                            }
                        })
                })
            )
            .catch(err =>{
                if(err.status == 404) {
                    return Promise.reject(new error.ChestOrTreasureNotFoundError());
                }
                return Promise.reject(err);
            })
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
                    if(index < 0) {
                        return Promise.reject(new error.TreasureNotInChestError());
                    }

                    chest.treasures.splice(index, 1);

                    treasureModel.update_treasure(
                        owner, treasure_id, { chest: null }
                    );
                    
                    return ds.save_item(chest);
                })
            )
            .catch(err =>{
                if(err.status == 404) {
                    return Promise.reject(new error.ChestOrTreasureNotFoundError());
                }
                return Promise.reject(err);
            })
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
                    treasureModel.update_treasure(
                        owner, treasure_id, { chest: null }
                    )
                );

                return super.delete_object(chest_id);
            })
    }
}