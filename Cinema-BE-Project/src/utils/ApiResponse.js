class ApiResponse {
  constructor(success, statusCode, message, data) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json(
      new ApiResponse(true, statusCode, message, data)
    );
  }

  static error(res, message = "Error", statusCode = 400) {
    return res.status(statusCode).json(
      new ApiResponse(false, statusCode, message)
    );
  }
}

module.exports = ApiResponse;
