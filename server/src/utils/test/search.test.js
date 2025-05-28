import { assetModel, assetSchema } from "../../models/assetModel.js";
import { categoryModel } from "../../models/categoryModel.js";
import { projectModel } from "../../models/projectModel.js";
import { tagModel } from "../../models/tagModel.js";
import {
  addNamesToAutocompleteArray,
  assetSearch,
  buildNumberComparison,
  buildQueryObject,
  checkPaths,
  findAssetById,
  flattenObj,
  getAssets,
  getCategories,
  getProjects,
  getTags,
  keywordSearch
} from "../search.js";

// Set up mock for logger to avoid actual logging during tests
jest.mock("../logger.js", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));
// Mock the models
jest.mock("../../models/projectModel.js", () => ({
  projectModel: {
    find: jest.fn()
  }
}));
jest.mock("../../models/categoryModel.js", () => ({
  categoryModel: {
    find: jest.fn()
  }
}));
jest.mock("../../models/tagModel.js", () => ({
  tagModel: {
    find: jest.fn()
  }
}));
jest.mock("../../models/assetModel.js", () => {
  const { Schema } = jest.requireActual("mongoose");
  // Dynamically define the schema inside the mock function
  const mockAssetSchema = new Schema({
    model: {
      required: false,
      type: new Schema(
        {
          animationCount: Number,
          edges: Number,
          lodCount: Number,
          polygons: Number,
          rigType: String,
          textureCount: Number,
          triCount: Number,
          vertices: Number
        },
        { _id: false }
      )
    },
    name: { required: true, type: String }
  });

  const assetList = [
    {
      _id: "1",
      categories: [{ name: "Category 1" }],
      name: "asset1",
      previews: [{ url: "Preview 1" }],
      projects: [{ name: "Project 1" }],
      tags: [{ name: "Tag 1" }]
    },
    {
      _id: "2",
      categories: [{ name: "Category 2" }],
      name: "asset2",
      previews: [{ url: "Preview 2" }],
      projects: [{ name: "Project 2" }],
      tags: [{ name: "Tag 2" }]
    }
  ];
  // Mock the query chain
  const mockQuery = {
    concat: jest.fn().mockImplementation(() => mockQuery),
    exec: jest.fn().mockResolvedValue(assetList),
    map: jest
      .fn()
      .mockImplementation(callback =>
        callback ? assetList.map(callback) : mockQuery
      ),
    populate: jest.fn().mockImplementation(() => mockQuery),
    select: jest.fn().mockImplementation(() => mockQuery)
  };

  const mockFind = jest.fn().mockReturnValue(mockQuery); // Return the mock query object

  return {
    assetModel: {
      find: mockFind,
      findById: mockFind
    },
    assetSchema: mockAssetSchema // Export the mock schema
  };
});

describe("check paths test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return true if the property exists in the schema", () => {
    expect.assertions(1);

    const property = "name";
    const result = checkPaths(property, assetSchema);

    expect(result).toBeTruthy();
  });

  test("should return true if the property exists within a sub-schema", () => {
    expect.assertions(1);

    const property = "triCount";
    const result = checkPaths(property, assetSchema);

    expect(result).toBeTruthy();
  });

  test("should return false a non-schema type is passed", () => {
    expect.assertions(1);

    const property = "triCount";
    const result = checkPaths(property, Object);

    expect(result).toBeFalsy();
  });

  test("should return false if no schema is provided", () => {
    expect.assertions(1);

    const property = "triCount";
    const result = checkPaths(property);

    expect(result).toBeFalsy();
  });
});

describe("test object flattening", () => {
  test("should return a flattened object", () => {
    expect.assertions(2);

    const obj = {
      prop1: {
        prop2: 2
      }
    };
    const expectedQuery = { "prop1.prop2": 2 };
    const result = flattenObj(obj);

    expect(result).not.toBe({});
    expect(result).toStrictEqual(expectedQuery);
  });

  test("should return an flattened objects if an array is provided", () => {
    expect.assertions(2);

    const obj = {
      prop1: {
        prop2: 2
      }
    };
    const arr = [obj, obj];
    const expectedQuery = { "0.prop1.prop2": 2, "1.prop1.prop2": 2 };
    const result = flattenObj(arr);

    expect(result).not.toBe({});
    expect(result).toStrictEqual(expectedQuery);
  });

  test("should return an empty object if a primitive type is provided", () => {
    expect.assertions(1);

    const result = flattenObj(1);

    expect(result).toStrictEqual({});
  });
});

describe("test asset search function", () => {
  test("should return an empty object if the query is invalid", async () => {
    expect.assertions(1);

    const asset = {
      bob: "Gund"
    };

    const result = await assetSearch(asset);

    expect(result).toStrictEqual({});
  }, 10000);
});

describe("test building query objects", () => {
  test("should return a query object an asset is provided", () => {
    expect.assertions(2);

    const asset = {
      model: { triCount: 2 },
      name: "Gundam"
    };
    const result = buildQueryObject(asset);
    const expectedQuery = {
      model: {
        $options: "i",
        $regex: {
          triCount: 2
        }
      },
      name: {
        $options: "i",
        $regex: "Gundam"
      }
    };

    expect(result).not.toBe({});
    expect(result).toStrictEqual(expectedQuery);
  });

  test("should return a query object when an array of objec is provided", () => {
    expect.assertions(2);

    const asset = {
      model: { triCount: 2 },
      name: "Gundam"
    };

    const result = buildQueryObject([asset, asset]);
    const expectedQuery = {
      0: {
        $options: "i",
        $regex: {
          model: {
            triCount: 2
          },
          name: "Gundam"
        }
      },
      1: {
        $options: "i",
        $regex: {
          model: {
            triCount: 2
          },
          name: "Gundam"
        }
      }
    };

    expect(result).not.toBe({});
    expect(result).toStrictEqual(expectedQuery);
  });

  test("should return an the same object if an array with $and or $or is provided", () => {
    expect.assertions(2);

    const andObj = {
      $and: 2
    };

    const orObj = {
      $or: 2
    };

    expect(buildQueryObject(andObj)).toStrictEqual(andObj);
    expect(buildQueryObject(orObj)).toStrictEqual(orObj);
  });

  test("should return an array of the same objects if they contain AND or OR", () => {
    expect.assertions(1);

    const andObj = {
      $and: 2
    };
    const orObj = {
      $or: 2
    };
    const arr = [andObj, orObj];
    const expectedQuery = {
      0: { $options: "i", $regex: { $and: 2 } },
      1: { $options: "i", $regex: { $or: 2 } }
    };

    expect(buildQueryObject(arr)).toStrictEqual(expectedQuery);
  });

  test("should return an array of the same objects if they contain AND", () => {
    expect.assertions(1);

    const andObj = {
      $and: 2
    };
    const arr = [andObj];
    const expectedQuery = {
      0: { $options: "i", $regex: { $and: 2 } }
    };

    expect(buildQueryObject(arr)).toStrictEqual(expectedQuery);
  });

  test("should return an array of the same objects if they contain OR", () => {
    expect.assertions(1);

    const orObj = {
      $or: 2
    };
    const arr = [orObj];
    const expectedQuery = {
      0: { $options: "i", $regex: { $or: 2 } }
    };

    expect(buildQueryObject(arr)).toStrictEqual(expectedQuery);
  });

  test("should an array of the same objects if they contain not and or", () => {
    expect.assertions(1);

    const andObj = {
      $t: 2
    };
    const orObj = {
      $y: 2
    };
    const arr = [andObj, orObj];

    const expectedQuery = {
      0: { $options: "i", $regex: { $t: 2 } },
      1: { $options: "i", $regex: { $y: 2 } }
    };

    expect(buildQueryObject(arr)).toStrictEqual(expectedQuery);
  });

  test("should return empty if nothing is provided", () => {
    expect.assertions(1);
    expect(buildQueryObject({})).toStrictEqual({});
  });

  test("should handle array values by creating a regex query", () => {
    expect.assertions(1);

    const searchTerms = {
      name: ["Gundam", "Robot", "Mecha"]
    };

    const expectedQuery = {
      name: { $options: "i", $regex: "Gundam|Robot|Mecha" }
    };

    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });

  test("should handle array with a single element", () => {
    expect.assertions(1);

    const searchTerms = {
      name: ["Gundam"]
    };

    const expectedQuery = {
      name: { $options: "i", $regex: "Gundam" }
    };

    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });

  test("should not handle $and or $or keys as arrays", () => {
    expect.assertions(1);

    const searchTerms = {
      $and: ["item1", "item2"]
    };

    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(searchTerms);
  });

  test("should return an inequality query when lte is included", () => {
    expect.assertions(1);

    const searchTerms = {
      model: {
        triCount: {
          lte: 3
        }
      }
    };
    const expectedQuery = {
      model: {
        $options: "i",
        $regex: {
          triCount: {
            lte: 3
          }
        }
      }
    };
    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });

  test("should return an inequality query when gte is included", () => {
    expect.assertions(1);

    const searchTerms = {
      model: {
        triCount: {
          gte: 3
        }
      }
    };
    const expectedQuery = {
      model: {
        $options: "i",
        $regex: {
          triCount: {
            gte: 3
          }
        }
      }
    };
    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });

  test("should return an empty object when only a number is provided", () => {
    expect.assertions(1);

    const searchTerms = 1;
    const expectedQuery = {};
    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });

  test("should handle both 'lte' and 'gte' operators in the same query", () => {
    expect.assertions(1);

    const searchTerms = {
      "model.triCount.gte": 5,
      "model.triCount.lte": 10
    };

    const expectedQuery = {
      "model.triCount": { $gte: 5, $lte: 10 }
    };

    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });

  test("should not treat non-numeric values as numbers", () => {
    expect.assertions(1);

    const searchTerms = {
      "model.triCount": "notANumber"
    };

    const expectedQuery = {
      "model.triCount": { $options: "i", $regex: "notANumber" }
    };

    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });

  test("should handle boolean values correctly", () => {
    expect.assertions(1);

    const searchTerms = {
      "model.isAvailable": true
    };

    const expectedQuery = {
      "model.isAvailable": true
    };

    const result = buildQueryObject(searchTerms);

    expect(result).toStrictEqual(expectedQuery);
  });
});

describe("test build number query", () => {
  test("should return an empty object when no valid case is provided", () => {
    expect.assertions(1);

    const result = buildNumberComparison("", 2);

    expect(result).toStrictEqual({});
  });
});

describe("test add to array function", () => {
  test("should return an array with non-matching names added", () => {
    expect.assertions(1);

    const baseAsset1 = {
      name: "str1"
    };
    const baseAsset2 = {
      name: "str2"
    };
    const baseAsset3 = {
      name: "str"
    };
    const matchingDocuments = [baseAsset1, baseAsset2, baseAsset3];
    const matches = ["str1", "str2"];
    const expectedResult = ["str1", "str2", "str"];

    addNamesToAutocompleteArray(matchingDocuments, matches);

    expect(matches).toStrictEqual(expectedResult);
  });

  test("should return only two terms when the same is provided", () => {
    expect.assertions(1);

    const baseAsset1 = {
      name: "str1"
    };
    const baseAsset2 = {
      name: "str2"
    };
    const baseAsset3 = {
      name: "str2"
    };
    const matchingDocuments = [baseAsset1, baseAsset2, baseAsset3];
    const matches = [];
    const expectedResult = ["str1", "str2"];

    addNamesToAutocompleteArray(matchingDocuments, matches);

    expect(matches).toStrictEqual(expectedResult);
  });
});

describe("test getProjects Function", () => {
  const keywords = ["project1, project2"];
  const selectOption = ["_id"];
  const projectList = [
    {
      _id: "1",
      description: "description1",
      image: "image1",
      name: "project1"
    },
    {
      _id: "2",
      description: "description2",
      image: "image2",
      name: "project2"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    const mockSelect = jest.fn().mockResolvedValue(projectList); // `.select()` resolves to projectList
    projectModel.find.mockImplementation(() => ({
      select: mockSelect // Chain `.select()` to the query returned by `.find()`
    }));
  });

  test("should return an array of projects", async () => {
    expect.assertions(1);

    const projects = await getProjects(keywords);

    expect(projects).toStrictEqual(projectList);
  });

  test("should return a 'selected' an array of projects", async () => {
    expect.assertions(3);

    const projects = await getProjects(keywords, selectOption);

    expect(projectModel.find).toHaveBeenCalledWith({
      name: { $options: "i", $regex: `\\b${keywords.toString()}\\b` }
    });

    expect(projectModel.find().select).toHaveBeenCalledWith(selectOption);

    expect(projects).toStrictEqual(projectList);
  });

  test("should throw an error if the query fails", async () => {
    expect.assertions(1);

    projectModel.find.mockImplementationOnce(() => {
      throw new Error("Error");
    });

    try {
      await getProjects(keywords);
    } catch (err) {
      expect(err.message).toBe("Error");
    }
  });
});

describe("test getCategories Function", () => {
  const keywords = ["category1, category2"];
  const selectOption = ["_id"];
  const categoryList = [
    {
      _id: "1",
      description: "description1",
      image: "image1",
      name: "category1"
    },
    {
      _id: "2",
      description: "description2",
      image: "image2",
      name: "category2"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    const mockSelect = jest.fn().mockResolvedValue(categoryList); // `.select()` resolves to categoryList
    categoryModel.find.mockImplementation(() => ({
      select: mockSelect // Chain `.select()` to the query returned by `.find()`
    }));
  });

  test("should return an array of categories", async () => {
    expect.assertions(1);

    const categories = await getCategories(keywords);

    expect(categories).toStrictEqual(categoryList);
  });

  test("should return a 'selected' an array of categories", async () => {
    expect.assertions(3);

    const categories = await getCategories(keywords, selectOption);

    expect(categoryModel.find).toHaveBeenCalledWith({
      name: { $options: "i", $regex: `\\b${keywords.toString()}\\b` }
    });

    expect(categoryModel.find().select).toHaveBeenCalledWith(selectOption);

    expect(categories).toStrictEqual(categoryList);
  });

  test("should throw an error if the query fails", async () => {
    expect.assertions(1);

    categoryModel.find.mockImplementationOnce(() => {
      throw new Error("Error");
    });

    try {
      await getCategories(keywords);
    } catch (err) {
      expect(err.message).toBe("Error");
    }
  });
});

describe("test getTags Function", () => {
  const keywords = ["tag1, tag2"];
  const selectOption = ["_id"];
  const tagList = [
    {
      _id: "1",
      description: "description1",
      image: "image1",
      name: "tag1"
    },
    {
      _id: "2",
      description: "description2",
      image: "image2",
      name: "tag2"
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    const mockSelect = jest.fn().mockResolvedValue(tagList); // `.select()` resolves to tagList
    tagModel.find.mockImplementation(() => ({
      select: mockSelect // Chain `.select()` to the query returned by `.find()`
    }));
  });

  test("should return an array of tags", async () => {
    expect.assertions(1);

    const tags = await getTags(keywords);

    expect(tags).toStrictEqual(tagList);
  });

  test("should return a 'selected' an array of tags", async () => {
    expect.assertions(3);

    const tags = await getTags(keywords, selectOption);

    expect(tagModel.find).toHaveBeenCalledWith({
      name: { $options: "i", $regex: `\\b${keywords.toString()}\\b` }
    });

    expect(tagModel.find().select).toHaveBeenCalledWith(selectOption);

    expect(tags).toStrictEqual(tagList);
  });

  test("should throw an error if the query fails", async () => {
    expect.assertions(1);

    tagModel.find.mockImplementationOnce(() => {
      throw new Error("Error");
    });

    try {
      await getTags(keywords);
    } catch (err) {
      expect(err.message).toBe("Error");
    }
  });
});

describe("test functions using assetList Mock", () => {
  const assetList = [
    {
      _id: "1",
      categories: [{ name: "Category 1" }],
      name: "asset1",
      previews: [{ url: "Preview 1" }],
      projects: [{ name: "Project 1" }],
      tags: [{ name: "Tag 1" }]
    },
    {
      _id: "2",
      categories: [{ name: "Category 2" }],
      name: "asset2",
      previews: [{ url: "Preview 2" }],
      projects: [{ name: "Project 2" }],
      tags: [{ name: "Tag 2" }]
    }
  ];
  const query = { _id: "1", name: "asset1" };
  const selectOption = ["_id"];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("test getAssets Function", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should call chainable methods and resolve assets", async () => {
      expect.assertions(8);

      // Call the function being tested
      await getAssets(query, selectOption);

      // Assertions for chainable methods
      expect(assetModel.find).toHaveBeenCalledWith(query);
      expect(assetModel.find().select).toHaveBeenCalledWith(selectOption);
      expect(assetModel.find().select().populate).toHaveBeenCalledWith({
        path: "name"
      });
      expect(assetModel.find().select().populate).toHaveBeenCalledWith({
        path: "tags",
        select: "name"
      });
      expect(assetModel.find().select().populate).toHaveBeenCalledWith({
        path: "projects",
        select: "name"
      });
      expect(assetModel.find().select().populate).toHaveBeenCalledWith({
        path: "categories",
        select: "name"
      });
      expect(assetModel.find().select().populate).toHaveBeenCalledWith({
        path: "previews"
      });

      // Assertion for the resolved assets

      const result = await assetModel.find().select().populate().exec();

      expect(result).toStrictEqual(assetList);
    });
  });

  describe("test findAssetById Function", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should call chainable methods and resolve assets", async () => {
      expect.assertions(8);

      // Call the function being tested
      await findAssetById(query, selectOption);

      // Assertions for chainable methods
      expect(assetModel.findById).toHaveBeenCalledWith(query._id);
      expect(assetModel.findById().select).toHaveBeenCalledWith(selectOption);
      expect(assetModel.findById().select().populate).toHaveBeenCalledWith({
        path: "name"
      });
      expect(assetModel.findById().select().populate).toHaveBeenCalledWith({
        path: "tags",
        select: "name"
      });
      expect(assetModel.findById().select().populate).toHaveBeenCalledWith({
        path: "tags",
        select: "name"
      });
      expect(assetModel.findById().select().populate).toHaveBeenCalledWith({
        path: "projects",
        select: "name"
      });
      expect(assetModel.findById().select().populate).toHaveBeenCalledWith({
        path: "categories",
        select: "name"
      });

      // Assertion for the resolved assets
      const result = await assetModel.findById().select().populate().exec();

      expect(result).toStrictEqual(assetList);
    });
  });

  describe("test keyword search", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return all assets if keyword is blank", async () => {
      expect.assertions(1);

      const keywords = [""];

      const result = await keywordSearch(keywords);

      expect(result).toStrictEqual(assetList);
    });

    test("should return matching assets for provided keywords", async () => {
      expect.assertions(1);

      const keywords = ["asset1", "asset2"];

      jest.mock("../search.js", () => ({
        ...jest.requireActual("../search.js"), // Retain actual implementations by default
        getAssets: jest
          .fn()
          .mockResolvedValue(list =>
            list.filter(asset => keywords.includes(asset.name))
          )
      }));

      const result = await keywordSearch(keywords);

      const simplifiedResult = result.map(({ _id, name }) => ({ _id, name }));

      expect(simplifiedResult).toStrictEqual([
        { _id: "1", name: "asset1" },
        { _id: "2", name: "asset2" }
      ]);
    });
  });
});
