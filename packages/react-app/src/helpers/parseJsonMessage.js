// parse Json error messages

export default function parseJsonMessage(e) {
  let message =
    e.data && e.data.message
      ? e.data.message
      : e.error && JSON.parse(JSON.stringify(e.error)).body
      ? JSON.parse(JSON.parse(JSON.stringify(e.error)).body).error.message
      : e.data
      ? e.data
      : JSON.stringify(e);
  if (!e.error && e.message) {
    message = e.message;
  }

  console.log("Attempt to clean up:", message);
  try {
    let obj = JSON.parse(message);
    if (obj && obj.body) {
      let errorObj = JSON.parse(obj.body);
      if (errorObj && errorObj.error && errorObj.error.message) {
        message = errorObj.error.message;
      }
    }
  } catch (e) {
    //ignore
  }
  return message;
}
