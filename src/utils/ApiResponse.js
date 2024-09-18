class Error {
    constructor(statuseCode, data, message = "Success") {
        this.statuseCode = statuseCode
        this.data = data
        this.message = message
        this.success = statuseCode < 400
    }
}

export default Error