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
                if(object[0]) return ds.from_datastore(object[0])
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
        
        return ds.get_items_query_paginated(this.kind, filter, page_cursor)
            .then(results => {
                return {
                    "objects": results[0].map(object =>
                        ds.add_self(this.kind, ds.from_datastore(object))),
                    "next": results[1]['moreResults'] ==
                        'MORE_RESULTS_AFTER_LIMIT' ?
                        results[1]['endCursor'] : null
                }
            })
    }

    async update_object(content) {
        delete content.id;
        return ds.save_item(content);
    }

    async delete_object(id) {
        return this.get_object(id)
            .then(object => ds.delete_item(object))
            .catch(_ => Promise.reject(new error.ObjectNotFoundError()))
    }
}