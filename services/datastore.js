const { Datastore } = require('@google-cloud/datastore');
const secret = require('../secrets/api_secret.json');
require('dotenv').config()

module.exports = {
    datastore: new Datastore({
        "projectId": secret.project_id,
        "credentials": secret
    }),
    from_datastore: function(item) {
        item.id = item[Datastore.KEY].id;
        return item;
    },
    self_link: function(kind, id) {
        return process.env.host + '/' + kind + "s/" + id;
    },
    add_self: function(kind, item) {
        item['self'] = this.self_link(kind, item.id);
        return item;
    },
    get_key: function(item) {
        return item[Datastore.KEY];
    },
    get_item: function(kind, id) {
        let key = id.id ? id : this.datastore.key([kind, parseInt(id, 10)]);
        return this.datastore.get(key);
    },
    get_items: function(kind) {
        let q = this.datastore.createQuery(kind)
        return this.datastore.runQuery(q)
    },
    get_items_paginated: function(kind, page_cursor) {
        let q = this.datastore.createQuery(kind)
            .limit(process.env.limit);
        if(page_cursor) {
            q = q.start(page_cursor.replace(' ', '+'));
        }
        return this.datastore.runQuery(q)
    },
    get_items_query_paginated: function(kind, filter, page_cursor) {
        let q = this.datastore.createQuery(kind)
            .limit(process.env.limit)
            .filter(filter.property, filter.comparitor, filter.value);
        if(page_cursor) {
            q = q.start(page_cursor.replace(' ', '+'));
        }
        return this.datastore.runQuery(q);
    },
    save_item: function(item) {
        return this.datastore.save(item);
    },
    save_new_item: function(kind, data) {
        let key = this.datastore.key(kind);
        return this.datastore.save({ "key": key, "data": data })
            .then(_ => key);
    },
    delete_item: function(item) {
        return this.datastore.delete(item[Datastore.KEY]);
    }
}