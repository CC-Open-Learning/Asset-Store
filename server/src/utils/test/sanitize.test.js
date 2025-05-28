import { sanitizeObject, sanitizeString, updateObject } from "../sanitize.js";

describe("test string sanitization", () => {
  test("should return a sanitized string if dirty string is provided", () => {
    expect.assertions(1);

    const dirtyString = `<script>alert('Hacked!');</script><div><h1>Welcome</h1><p>This is a <b>test</b> string.</p><img src="x" onerror="alert('Hacked!')"><!-- comment --></div>`;
    const result = sanitizeString(dirtyString);
    const expectedResult = "WelcomeThis is a test string";

    expect(result).toStrictEqual(expectedResult);
  });

  test("should return a the same string if a clean string is provided", () => {
    expect.assertions(1);

    const cleanString = "Hello World";
    const result = sanitizeString(cleanString);

    expect(result).toStrictEqual(cleanString);
  });
});

describe("test recursive update object", () => {
  test("should return a clean nested object", () => {
    expect.assertions(1);

    const dirtyObj = {
      model: {
        description: `<script>alert('Hacked!');</script><div><h1>Welcome</h1><p>This is a <b>test</b> string.</p><img src="x" onerror="alert('Hacked!')"><!-- comment --></div>`
      },
      name: "<script>alert('Hacked!');</script>"
    };
    const expectedResult = {
      model: { description: "WelcomeThis is a test string" },
      name: ""
    };

    const result = updateObject(dirtyObj);

    expect(result).toStrictEqual(expectedResult);
  });

  test("should return a clean array of nested objects", () => {
    expect.assertions(1);

    const dirtyObj = {
      model: {
        description: `<script>alert('Hacked!');</script><div><h1>Welcome</h1><p>This is a <b>test</b> string.</p><img src="x" onerror="alert('Hacked!')"><!-- comment --></div>`
      },
      name: "<script>alert('Hacked!');</script>"
    };

    const dirtyArray = [dirtyObj, dirtyObj, dirtyObj];
    const expectedResult = [
      { model: { description: "WelcomeThis is a test string" }, name: "" },
      { model: { description: "WelcomeThis is a test string" }, name: "" },
      { model: { description: "WelcomeThis is a test string" }, name: "" }
    ];

    const result = updateObject(dirtyArray);

    expect(result).toStrictEqual(expectedResult);
  });

  test("should return an empty object if the object is null", () => {
    expect.assertions(1);

    const nullObj = Object.create(null);

    const expectedResult = Object.create(null);

    const result = updateObject(nullObj);

    expect(result).toStrictEqual(expectedResult);
  });

  test("should return an the same object if the value is null", () => {
    expect.assertions(1);

    const emptyObj = { name: null };

    const expectedResult = {
      name: null
    };

    const result = updateObject(emptyObj);

    expect(result).toStrictEqual(expectedResult);
  });

  test("should return the same object if given an object with an array as a value and is clean", () => {
    expect.assertions(1);

    const emptyObj = {
      name: [
        { strArray: ["str1", "str2", "str3"] },
        { strArray: ["str1", "str2", "str3"] }
      ]
    };

    const expectedResult = {
      name: [
        { strArray: ["str1", "str2", "str3"] },
        { strArray: ["str1", "str2", "str3"] }
      ]
    };

    const result = updateObject(emptyObj);

    expect(result).toStrictEqual(expectedResult);
  });
});

describe("test sanitize object function", () => {
  test("should return a sanitized array if one is provided", () => {
    expect.assertions(1);

    const dirtyObj = {
      model: {
        description: `<script>alert('Hacked!');</script><div><h1>Welcome</h1><p>This is a <b>test</b> string.</p><img src="x" onerror="alert('Hacked!')"><!-- comment --></div>`
      },
      name: "<script>alert('Hacked!');</script>"
    };
    const dirtyArray = [dirtyObj, dirtyObj];

    const result = sanitizeObject(dirtyArray);

    const expectedResult = [
      { model: { description: "WelcomeThis is a test string" }, name: "" },
      { model: { description: "WelcomeThis is a test string" }, name: "" }
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  test("should return a sanitized object if one is provided", () => {
    expect.assertions(1);

    const dirtyObj = {
      model: {
        description: `<script>alert('Hacked!');</script><div><h1>Welcome</h1><p>This is a <b>test</b> string.</p><img src="x" onerror="alert('Hacked!')"><!-- comment --></div>`
      },
      name: "<script>alert('Hacked!');</script>"
    };

    const result = sanitizeObject(dirtyObj);

    const expectedResult = {
      model: { description: "WelcomeThis is a test string" },
      name: ""
    };

    expect(result).toStrictEqual(expectedResult);
  });
});
