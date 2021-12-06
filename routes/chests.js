'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../services/auth');
const ChestModel = require('../models/chest');
const chestModel = new ChestModel();

const error = require('../models/error');
router.use(error.acceptOnlyJson);

/**
 * Get paginated chests, private to authorized owner or all public if no token
 */
router.get('/',
    auth.get_user,
    (req, res, next) => chestModel.get_chests(
        auth.get_user_id(req), req.query.page_cursor
    )
        .then(chests => res.status(200).json(chests))
        .catch(next)
);

/**
 * Post new chest
 */
router.post('/',
    auth.get_user,
    auth.check_for_user,
    (req, res, next) => chestModel.post_chest(auth.get_user_id(req), req.body)
        .then(chest => res.status(201).json(chest))
        .catch(next)
);

/**
 * Proper errors for unused methods
 */
router.put('/', error.methodNotAllowed);
router.patch('/', error.methodNotAllowed);
router.delete('/', error.methodNotAllowed);

/**
 * Get chest
 */
router.get('/:chest_id',
    auth.get_user,
    auth.check_for_user,
    (req, res, next) => chestModel.get_chest_with_self(
        auth.get_user_id(req), req.params.chest_id
    )
        .then(chest => res.status(200).json(chest))
        .catch(next)
);

/**
 * Modify all values of chest
 */
router.put('/:chest_id',
    auth.get_user,
    auth.check_for_user,
    (req, res, next) => chestModel.replace_chest(
        auth.get_user_id(req), req.params.chest_id, req.body
    )
        .then(_ => res.status(204).end())
        .catch(next)
);

/**
 * Modify any or all values of chest
 */
router.patch('/:chest_id',
    auth.get_user,
    auth.check_for_user,
    (req, res, next) => chestModel.update_chest(
        auth.get_user_id(req), req.params.chest_id, req.body
    )
        .then(_ => res.status(204).end())
        .catch(next)
);

/**
 * Delete chest
 */
router.delete('/:chest_id',
    auth.get_user,
    auth.check_for_user,
    (req, res, next) => chestModel.delete_chest(
        auth.get_user_id(req), req.params.chest_id
    )
        .then(_ => res.status(204).end())
        .catch(next)
);

/**
 * Proper errors for unused methods
 */
router.post('/:chest_id', error.methodNotAllowed);

/**
 * Add treasure to chest
 */
router.put('/:chest_id/treasures/:treasure_id',
    auth.get_user,
    auth.check_for_user,
    (req, res, next) => chestModel.add_treasure(
        auth.get_user_id(req), req.params.chest_id, req.params.treasure_id
    )
        .then(_ => res.status(204).end())
        .catch(next)
)

/**
 * Remove treasure from chest
 */
router.delete('/:chest_id/treasures/:treasure_id',
    auth.get_user,
    auth.check_for_user,
    (req, res, next) => chestModel.remove_treasure(
        auth.get_user_id(req), req.params.chest_id, req.params.treasure_id
    )
        .then(_ => res.status(204).end())
        .catch(next)
)

/**
 * Proper errors for unused methods
 */
router.post('/:chest_id/treasures/:treasure_id', error.methodNotAllowed);
router.get('/:chest_id/treasures/:treasure_id', error.methodNotAllowed);
router.patch('/:chest_id/treasures/:treasure_id', error.methodNotAllowed);

module.exports = router;