import {
  checkForFileErrors,
  isExtensionValid,
  isFilenameValid,
  isImageMimeValid,
  queryTerms
} from "../validate.js";

// Mock fs.readFileSync to prevent reading actual files
jest.mock("fs", () => ({
  readFileSync: jest.fn()
}));

// Set up mock for logger to avoid actual logging during tests
jest.mock("../logger.js", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

describe("extension Validation tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return true if the extension is allowed", () => {
    expect.assertions(1);

    const filename = "filename.zip";
    const result = isExtensionValid(filename);

    expect(result).toBeTruthy();
  });

  test("should return false if the extension is not allowed", () => {
    expect.assertions(1);

    const filename = "filename.exe";
    const result = isExtensionValid(filename);

    expect(result).toBeFalsy();
  });

  test("should return false if there is not filename", () => {
    expect.assertions(1);

    const filename = ".js";
    const result = isExtensionValid(filename);

    expect(result).toBeFalsy();
  });

  test("should return false if there is not extension", () => {
    expect.assertions(1);

    const filename = "filename";
    const result = isExtensionValid(filename);

    expect(result).toBeFalsy();
  });

  test("should return false if the input is an empty string", () => {
    expect.assertions(1);

    const filename = "";
    const result = isExtensionValid(filename);

    expect(result).toBeFalsy();
  });
});

describe("query Terms tests", () => {
  test("should return true if the query term is on the white list", () => {
    expect.assertions(1);

    const validQueries = ["model.triCount", "name"];

    const testObj = {
      "model.triCount": 2,
      name: "my name"
    };

    const result = queryTerms(testObj, validQueries);

    expect(result).toBeTruthy();
  });

  test("should return false if the query term is not the white list", () => {
    expect.assertions(1);

    const testObj = {
      "ford.message": 2,
      names: "my name"
    };

    const result = queryTerms(testObj);

    expect(result).toBeFalsy();
  });

  //No Keyword searches are valid
  test("should return true if no terms are provided", () => {
    expect.assertions(1);

    const testObj = {};

    const result = queryTerms(testObj);

    expect(result).toBeTruthy();
  });

  test("should return false if only a string is provided are provided", () => {
    expect.assertions(1);

    const testObj = "name";

    const result = queryTerms(testObj);

    expect(result).toBeFalsy();
  });

  //This test validates that $or as we just ignore queries with or as they are assumed
  // to be pre-formed queries and therefore are valid for mongoose to search the DB
  test("should return true the query contains an $or", () => {
    expect.assertions(1);

    const testObj = {
      $or: true
    };

    const result = queryTerms(testObj);

    expect(result).toBeTruthy();
  });
});

describe("filename test suite", () => {
  test("should return true if the filename passes the regex", () => {
    expect.assertions(1);

    const filename = "testfile.txt";

    const result = isFilenameValid(filename);

    expect(result).toBeTruthy();
  });

  test("should return false if an invalid name is provided", () => {
    expect.assertions(4);
    expect(isFilenameValid("filename")).toBeFalsy();
    expect(isFilenameValid(".exe")).toBeFalsy();
    expect(isFilenameValid("daw dwad.we")).toBeFalsy();
    expect(isFilenameValid("daw&83dwad.we")).toBeFalsy();
  });

  test("should return false when no name is provided", () => {
    expect.assertions(2);
    expect(isFilenameValid()).toBeFalsy();
    expect(isFilenameValid("")).toBeFalsy();
  });

  test("should return false when more than one name is provided", () => {
    expect.assertions(1);

    const filenames = ["testfile.txt", "testfile2.txt"];

    const result = isFilenameValid(filenames);

    expect(result).toBeFalsy();
  });
});

describe("image Mime type tests", () => {
  test("should return true if the mime type is correct", () => {
    expect.assertions(1);

    const mimeType = "image/jpeg";
    const result = isImageMimeValid(mimeType);

    expect(result).toBeTruthy();
  });

  test("should return true if the mime type is invalid", () => {
    expect.assertions(1);

    const mimeType = "application/json";
    const result = isImageMimeValid(mimeType);

    expect(result).toBeFalsy();
  });

  test("should return false if no input", () => {
    expect.assertions(2);
    expect(isImageMimeValid()).toBeFalsy();
    expect(isImageMimeValid("")).toBeFalsy();
  });
});

describe("file error tests", () => {
  test("should a non-empty array when an error occurs", () => {
    expect.assertions(5);

    const result = checkForFileErrors("file", "mime");

    expect(result).toBeInstanceOf(Array);
    expect(result).not.toHaveLength(0);
    expect(result).toContain("filename");
    expect(result).toContain("extension");
    expect(result).toContain("mime type");
  });

  test("should return only filename and extension if no mime type is included", () => {
    expect.assertions(5);

    const result = checkForFileErrors("file");

    expect(result).toBeInstanceOf(Array);
    expect(result).not.toHaveLength(0);
    expect(result).toContain("filename");
    expect(result).toContain("extension");
    expect(result).not.toContain("mime type");
  });

  test("should only return filename if extension is valid", () => {
    expect.assertions(5);

    const result = checkForFileErrors("file&4.zip");

    expect(result).toBeInstanceOf(Array);
    expect(result).not.toHaveLength(0);
    expect(result).toContain("filename");
    expect(result).not.toContain("extension");
    expect(result).not.toContain("mime type");
  });

  test("should only return extension if filename is valid", () => {
    expect.assertions(5);

    const result = checkForFileErrors("file.exe");

    expect(result).toBeInstanceOf(Array);
    expect(result).not.toHaveLength(0);
    expect(result).not.toContain("filename");
    expect(result).toContain("extension");
    expect(result).not.toContain("mime type");
  });

  test("should return empty array if no filename", () => {
    expect.assertions(2);

    const result = checkForFileErrors();

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  test("should return mime-type only if correct filename and invalid mime", () => {
    expect.assertions(3);

    const result = checkForFileErrors("file.txt", "application/json");

    expect(result).toBeInstanceOf(Array);
    expect(result).not.toHaveLength(0);
    expect(result).toContain("mime type");
  });

  test("should return empty if mime is valid", () => {
    expect.assertions(3);

    const result = checkForFileErrors("file.png", "image/jpeg");

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
    expect(result).not.toContain("mime type");
  });

  test("should not return mime type if mime is valid and file is invalid", () => {
    expect.assertions(3);

    const result = checkForFileErrors("file.txt", "image/jpeg");

    expect(result).toBeInstanceOf(Array);
    expect(result).not.toHaveLength(0);
    expect(result).not.toContain("mime type");
  });
});
