const extractErrorMessages = (err) => {
  if (!err) return "";

  if (typeof err === "string") {
    return err;
  }

  if (Array.isArray(err)) {
    return err.map(extractErrorMessages).join(", ");
  }

  if (typeof err === "object") {
    if (err.message) return extractErrorMessages(err.message);
    return Object.values(err).map(extractErrorMessages).join(", ");
  }

  return String(err);
};

const handleAxiosError = (error) => {
  let message = "Server error";
  let status = null;

  // Missing dependency
  if (error instanceof ReferenceError) {
    message = `Missing dependency: ${error.message}`;
  }
  // Axios response with data
  else if (error.response?.data) {
    const data = error.response.data;
    status = error.response.status;

    if (data.message) {
      message = extractErrorMessages(data.message);
    } else if (data.data?.message) {
      message = extractErrorMessages(data.data.message);
    } else if (data.errors) {
      message = extractErrorMessages(data.errors);
    } else {
      message = extractErrorMessages(data);
    }
  }
  // Axios request made but no response
  else if (error.request) {
    message = "No response from server. Please try again later.";
  }
  // Other JS errors
  else if (error.message) {
    message = error.message;
  }

  return { message, status };
};

export default handleAxiosError;
