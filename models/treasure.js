const ds = require('../services/datastore');
const error = require('./error');
const Model = require("./model");

async function check_attributes(treasure) {
    return Promise.resolve();
}

module.exports = class TreasureModel extends Model {
    constructor() {
        super('treasure');
    }

    /**
     * Replaces the chest ID with an object containing the chest ID and a self
     * link to the chest
     * @param {String} owner 
     * @param {Treasure} treasure 
     * @returns 
     */
    async add_treasure_chest_self(owner, treasure) {
        if(!treasure.chest) return treasure;

        chest_id = treasure.chest;

        treasure.chest = {
            chest_id: chest_id,
            chest_self: ds.self_link('chest', chest_id)
        }

        return treasure;
    }

    /**
     * Gets a paginated list of treasures belonging to the provided user,
     * starting from the provided page cursor
     * @param {String} owner 
     * @param {String} page_cursor 
     * @returns 
     */
    async get_treasures(owner, page_cursor) {
        return super.get_objects(owner, page_cursor)
            .then(treasures => treasures.map(treasure =>
                this.add_treasure_chest_self(owner, treasure)))
    }

    /**
     * Checks that all the required attributes are provided and then creates a
     * new treasure belonging to the provided owner
     * @param {Sting} owner 
     * @param {Treasure} treasure 
     * @returns 
     */
    async post_treasure(owner, treasure) {
        treasure.owner = owner;
        if(!treasure.chest) treasure.chest = null;
        return check_attributes(treasure)
            .then(_ => super.post_object(treasure))
    }

    /**
     * Gets the requested treasure from the database and returns the it if the
     * treasure's owner matches the one provided
     * @param {String} owner 
     * @param {Number} treasure_id 
     * @returns 
     */
    async get_treasure(owner, treasure_id) {
        return super.get_object(treasure_id)
            .then(treasure => {
                if(treasure.owner == owner) return treasure;
                return new error.TreasureNotFoundError();
            })
    }

    /**
     * Gets the requested treasure from the databaase and returns it with a
     * self link for itself and its chest (if any) if the treasure's owner
     * matches the one provided
     * @param {String} owner 
     * @param {Number} treasure_id 
     * @returns 
     */
    async get_treasure_with_self(owner, treasure_id) {
        return this.get_treasure(owner, treasure_id)
            .then(treasure => ds.add_self(this.kind, treasure))
                .add_treasure_chest_self(owner, treasure)
    }

    /**
     * Checks that all required attributes are provided and then replaces the
     * given treasure with the new data if the treasure's owner matches the one
     * provided
     * @param {String} owner 
     * @param {Number} treasure_id 
     * @param {Chest} treasure 
     * @returns 
     */
    async replace_treasure(owner, treasure_id, treasure) {
        treasure.owner = owner;
        return check_attributes(treasure)
            .then(_ => this.modify_treasure(owner, treasure_id, treasure))
    }

    /**
     * Replaces the given attributes within the given treasure with the new data
     * if the treasure's owner matches the one provided
     * @param {String} owner 
     * @param {Number} treasure_id 
     * @param {Chest} treasure 
     * @returns 
     */
    async modify_treasure(owner, treasure_id, treasure) {
        treasure.owner = owner;
        return this.get_treasure(owner, treasure_id)
            .then(oldTreasure => {
                Object.keys(treasure).forEach(key =>
                    oldTreasure[key] = treasure[key]);
                super.update_object(treasure)
            })
    }

    async delete_treasure(owner, treasure_id) {
        return this.get_treasure(owner, treasure_id)
            .then(treasure => {
                if(treasure.chest) {
                    ds.get_item('chest', treasure.chest)
                        .then(chest => ds.save_item(chest.treasures
                            .filter(held => held != treasure_id)))
                }

                return super.delete_object(treasure_id)
            })
    }
}