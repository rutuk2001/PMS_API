var generateError = function (res, message, responseObject, responseCode) {
  let responseMsg = message;

  if (responseObject && responseObject.details && responseObject.details[0]) {
    responseMsg = responseObject.details[0].message || message;
    console.log(responseObject, "+++++");
  }

  responseCode = responseCode || 400; // Default to 400 if no responseCode is passed
  res.status(responseCode).send({
    message: responseMsg,
    data: "", // Empty data for errors
    statusCode: responseCode,
  });
};

var generateSuccess = function (res, message, responseObject, responseCode) {
  responseCode = responseCode || 200; // Default to 200 if no responseCode is passed
  res.status(responseCode).send({
    message: message,
    data: responseObject || "", // Default to empty data if no responseObject is passed
    statusCode: responseCode,
  });
};

module.exports = {
  generateError: generateError,
  generateSuccess: generateSuccess,
};
