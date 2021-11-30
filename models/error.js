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
            404,
            kind + "NotFoundError",
            kind + " not found"
        );
    }
}

module.exports = {
    pageNotFound: function (req, res, next) {
        let error = new this.PageNotFoundError();
        error.toResponse(res);
    },
    overrideMissingError(error, typedMissingError) {
        if(error instanceof this.ObjectNotFoundError) return typedMissingError;
        return error` W21`;
    },
    MissingAttributeError: class MissingAttributeError extends HttpError {
        constructor() {
            super(401, "MissingAttributeError", "Input is missing a required attribute")
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
}