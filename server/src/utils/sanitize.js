import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes a string by removing all HTML and malicious characters.
 * @param str The string to sanitize.
 */
export function sanitizeString(str) {
  // sanitizeHTML will remove all HTML it detects from the string
  // It can be set to tolerate certain elements, however it is currently set
  // to be entirely intolerant
  return (
    sanitizeHtml(str, {
      allowedAttributes: {},
      allowedSchemes: [],
      allowedTags: [],
      selfClosing: []
    })
      // Uses regex to replace malicious values with space or nothing
      .replace(/[.*+?^${}()|[\]\\]/g, "")
      .replace(/_/g, " ")
  );
}

/**
 * Recursively searches a given object to find and sanitize all properties of type string.
 * @param object The object to sanitize.
 */
export function updateObject(object) {
  const retObj = object;
  if (typeof object === "object") {
    Object.keys(object).forEach(key => {
      // If the object is a string, sanitize the string
      if (typeof object[key] === "string") {
        retObj[key] = sanitizeString(object[key]);
      }
      // If it finds an object that isnt null recurse
      else if (typeof object[key] === "object" && object[key] !== null) {
        // If it finds an array, recurse through the array
        if (Array.isArray(object[key])) {
          retObj[key] = object[key].map(element => updateObject(element));
        } else {
          retObj[key] = updateObject(object[key]);
        }
      }
    });
  }

  return retObj;
}

/**
 * Calls the updateObject function and handles arrays.
 * @param result The result to sanitize.
 */
export function sanitizeObject(result) {
  let retResult = result;
  if (Array.isArray(retResult)) {
    retResult.forEach(element => {
      // Copy the values of all of the enumerable own properties from one or more source objects to a target object.
      // The first parameter is the target and the second is the source
      Object.assign(element, updateObject(element));
    });
  } else {
    // If not an array just return the results into the original
    retResult = updateObject(retResult);
  }

  return retResult;
}
