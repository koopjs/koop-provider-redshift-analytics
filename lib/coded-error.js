class CodedError extends Error {
  constructor (message, code) {
    super(message)
    this.code = code
    Error.captureStackTrace(this, CodedError)
  }
}

module.exports = CodedError
