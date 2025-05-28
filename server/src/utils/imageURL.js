// referring to the config file allows this to work for either local
// host or asset store site builds

const SERVER_URL = "http://localhost:3000/api";
/**
 * ----------------------------------------------------------------
 * creates the api call path to retrieve ASSET images from storage when
 * rendering the frontend.
 * @param imageName The name of the image to retrieve.
 */
export function generateImageURL(imageName) {
  return `${SERVER_URL}/asset/image?imageName=${imageName}`;
}

/**
 * ----------------------------------------------------------------
 * creates the api call path to retrieve PROJECT images from storage when
 * rendering the frontend.
 * @param imageName The name of the image to retrieve.
 */
export function generateProjectImageURL(imageName) {
  return `${SERVER_URL}/projects/image?imageName=${imageName}`;
}
