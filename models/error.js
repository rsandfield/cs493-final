class HttpError extends Error {
    constructor(status, name, message) {
        super(message);
        this.name = name;
        this.status = status;
    }

    toResponse(res) {
        res.status(this.status).json({ "Error": this.message })
    }
}

class NotFoundError extends HttpError {
    constructor(kind) {
        super(
            403,
            kind + "NotFoundError",
            kind + " not found"
        );
    }
}

module.exports = {
    acceptOnlyJson: function(req, res, next) {
        if(req.accepts('json')) {
            next();
        } else {
            next(new module.exports.NotAcceptableError());
        }
    },
    methodNotAllowed: function(req, res, next) {
        next(new module.exports.MethodNotAllowedError());
    },
    handleErrors: function(err, req, res, next) {
        console.error(err)
        let status = err.status || 500;
        res.status(status).json({ "Error": err.message });
        next();
    },
    pageNotFound: function (req, res, next) {
        let error = new this.PageNotFoundError();
        error.toResponse(res);
    },
    overrideMissingError(error, typedMissingError) {
        if(error instanceof this.ObjectNotFoundError) return typedMissingError;
        return error;
    },
    InvalidTokenError: class InvalidTokenError extends HttpError {
        constructor() {
            super(
                401,
                "InvalidTokenError",
                "A valid token is required to complete that action"
            )
        }
    },
    MissingAttributeError: class MissingAttributeError extends HttpError {
        constructor() {
            super(
                400,
                "MissingAttributeError",
                "Input is missing a required attribute"
            )
        }
    },
    ObjectNotFoundError: class ObjectNotFoundError extends NotFoundError {
        constructor() {
            super("Object")
        }
    },
    ChestNotFoundError: class ChestNotFoundError extends NotFoundError {
        constructor() {
            super("Chest")
        }
    },
    TreasureNotFoundError: class TreasureNotFoundError extends NotFoundError {
        constructor() {
            super("Treasure")
        }
    },
    UserNotFoundError: class UserNotFoundError extends NotFoundError {
        constructor() {
            super("User")
        }
    },
    PageNotFoundError: class PageNotFoundError extends NotFoundError {
        constructor() {
            super("Page")
        }
    },
    ChestOrTreasureNotFoundError: class ChestOrTreasureNotFoundError extends HttpError {
        constructor() {
            super(
                403,
                "ChestOrTreasureNotFoundError",
                "Either chest or treasure not found"
            );
        }
    },
    ChestFullError: class ChestFullError extends HttpError {
        constructor() {
            super(
                400,
                "ChestFullError",
                "Requested chest does not have room for requested treasure"
            )
        }
    },
    TreasureNotInChestError: class TreasureNotInChestError extends HttpError {
        constructor() {
            super(
                400,
                "TreasureNotInChestError",
                "No treasure with the given treasure ID is in a chest with the given chest ID"
            )
        }
    },
    TreasureAlreadyInChestError: class TreasureAlreadyInChestError extends HttpError {
        constructor() {
            super(
                400,
                "TreasureAlreadyInChestError",
                "The treasure with the given ID is already in a chest"
            )
        }
    },
    MethodNotAllowedError: class MethodNotAllowedError extends HttpError {
        constructor() {
            super(
                405,
                "MethodNotAllowedError",
                "That method is not allowed on this route"
            )
        }
    },
    NotAcceptableError: class NotAcceptableError extends HttpError {
        constructor() {
            super(
                406,
                "NotAcceptableError",
                "UNACCEPTABLE"
            )
        }
    }
}