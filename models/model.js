const ds = require('../services/datastore');
const error = require("./error");
require('dotenv').config();

module.exports = class Model {
    constructor(kind) {
        this.kind = kind;
    }

    async post_object(content) {
        if(!content) Promise.reject(new error.MissingAttributeError());
        return ds.save_new_item(this.kind, content)
            .then(key => this.get_object_with_self(key))
    }

    async get_object(id) {
        return ds.get_item(this.kind, id)
            .then(object => {
                if(object[0]) return object.map(ds.from_datastore)
                return Promise.reject(new error.ObjectNotFoundError())
            })
    }

    async get_object_with_self(id) {
        return this.get_object(id)
            .then(object => ds.add_self(this.kind, object))
    }

    async get_objects(page_cursor) {
        ds.get_items_paginated(this.kind, page_cursor)
            .then(objects => {
                let link = null;
                if(objects[1]['moreResults'] == 'MORE_RESULTS_AFTER_LIMIT') {
                    link = `${process.env.host}/${this.kind}s?${objects[1]['endCursor']}`
                }

                return {
                    objects: objects[0].map(object => ds.add_self(this.kind, object)),
                    next: link
                }
            })
    }

    async get_objects_by_owner(owner, page_cursor) {
        let filter = {
            property: "owner",
            "comparitor": "=",
            "value": owner
        }

        ds.get_items_query_paginated(this.kind, filter, page_cursor)
            .then(objects => {
                return {
                    objects: objects[0].map(object => ds.add_self(this.kind, object)),
                    next: objects[1]['moreResults'] ==
                        'MORE_RESULTS_AFTER_LIMIT' ?
                        results[1]['endCursor'] : null
                }
            })
    }

    async update_object(content) {
        ds.save_item(content)
    }

    async delete_object(id) {
        return this.get_object(id)
            .then(ds.delete_item)
            .catch(err => {
                console.log(err);
                return Promise.reject(new error.ObjectNotFoundError())
            })
    }
}