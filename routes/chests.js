'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../services/auth');
const ChestModel = require('../models/chest');
const chestModel = new chestModel();

/**
 * Get paginated chests, private to authorized owner or all public if no token
 */
router.get('/',
    (req, res, next) => chestModel.get_chests(auth.get_user_id(req), req.params.page_cursor)
        .then(chests => res.status(200).json(chests))
        .catch(next)
);

/**
 * Post new chest
 */
router.post('/',
    (req, res, next) => chestModel.post_chest(auth.get_user_id(req), req.body)
        .then(chest => res.status(201).json(chest))
        .catch(next)
);

/**
 * Get chest
 */
router.get('/:chest_id',
    (req, res, next) => chestModel.get_chest_with_self(auth.get_user_id(req), req.params.chest_id)
        .then(chest => res.status(200).json(chest))
        .catch(next)
);

/**
 * Modify all values of chest
 */
router.put('/:chest_id',
    (req, res, next) => chestModel.replace_chest(auth.get_user_id(req), req.params.chest_id, req.body)
        .then(_ => res.status(204).end())
        .catch(next)
);

/**
 * Modify any or all values of chest
 */
router.patch('/:chest_id',
    (req, res, next) => chestModel.update_chest(auth.get_user_id(req), req.params.chest_id, req.body)
        .then(_ => res.status(204).end())
        .catch(next)
);

/**
 * Delete chest
 */
router.delete('/:chest_id',
(req, res, next) => chestModel.delete_chest(auth.get_user_id(req), req.params.chest_id)
    .then(_ => res.status(204).end())
    .catch(next)
);

return router;