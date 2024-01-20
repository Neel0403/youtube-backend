// to standardise api error format

class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message)      // to overwrite the message
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }