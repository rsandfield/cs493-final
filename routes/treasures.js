'use strict';
const express = require('express');
const router = express.Router();
const treasureModel = require('../models/treasure')

/**
 * Get paginated treasures, private to authorized owner or all public if no token
 */
 router.get('/',
    auth.get_user,
    (req, res, next) => treasureModel.get_treasures(
        auth.get_user_id(req), req.params.page_cursor
    )
        .then(treasures => res.status(200).json(treasures))
        .catch(next)
);

/**
* Post new treasure
*/
router.post('/',
    auth.get_user,
    (req, res, next) => treasureModel.post_treasure(
        auth.get_user_id(req), req.body
    )
        .then(treasure => res.status(201).json(treasure))
        .catch(next)
);

/**
* Get treasure
*/
router.get('/:treasure_id',
    auth.get_user,
    (req, res, next) => treasureModel.get_treasure_with_self(auth.get_user_id(req), req.params.treasure_id)
        .then(treasure => res.status(200).json(treasure))
        .catch(next)
);

/**
* Modify all values of treasure
*/
router.put('/:treasure_id',
    auth.get_user,
    (req, res, next) => treasureModel.replace_treasure(auth.get_user_id(req), req.params.treasure_id, req.body)
        .then(_ => res.status(204).end())
        .catch(next)
);

/**
* Modify any or all values of treasure
*/
router.patch('/:treasure_id',
    auth.get_user,
    (req, res, next) => treasureModel.update_treasure(auth.get_user_id(req), req.params.treasure_id, req.body)
        .then(_ => res.status(204).end())
        .catch(next)
);

/**
* Delete treasure
*/
router.delete('/:treasure_id',    
    auth.get_user,
    (req, res, next) => treasureModel.delete_treasure(auth.get_user_id(req), req.params.treasure_id)
        .then(_ => res.status(204).end())
        .catch(next)
);

module.exports = router;