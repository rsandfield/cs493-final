const { Datastore } = require('@google-cloud/datastore');
const config = require('../config');

module.exports = {
    datastore: new Datastore(config.datastore),
    from_datastore: function(item) {
        item.id = item[Datastore.KEY].id;
        return item;
    },
    self_link: function(kind, id) {
        return config.host + kind + "s/" + id;
    },
    add_self: function(kind, item) {
        item['self'] = this.self_link(kind, item.id);
        return item;
    },
    get_key: function(item) {
        return item[Datastore.KEY];
    },
    get_item: function(kind, id) {
        const key = this.datastore.key([kind, parseInt(id, 10)]);
        return this.datastore.get(key);
    },
    get_items_paginated: function(kind, pageCursor) {
        let q = this.datastore.createQuery(kind)
            .limit(config.limit);
        if(pageCursor) {
            q = q.start(pageCursor);
        }
        return this.datastore.runQuery(q)
    },
    get_items_query: function(kind, property, comparitor, value) {
        const q = this.datastore.createQuery(kind)
            .filter(property, comparitor, value);
        return this.datastore.runQuery(q);
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