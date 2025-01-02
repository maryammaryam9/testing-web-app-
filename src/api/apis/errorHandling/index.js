export const handleResponseError = (responseObj) => {
  let response = {
    error: false,
    message: "Something went wrong",
    data: "",
  };

  if (responseObj && responseObj.status && (responseObj.status === 200 || responseObj.status === 201)) {
    response.data = responseObj.data;
    response.error = false;
  } else {
    response.error = true;
    if (responseObj && responseObj.message) {
      response.message = responseObj.message;
    }
  }

  return response;
};
