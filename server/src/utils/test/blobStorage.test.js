import { generateBlobSASQueryParameters } from "@azure/storage-blob";

import { categoryModel } from "../../models/categoryModel.js";
import { projectModel } from "../../models/projectModel.js";
import { tagModel } from "../../models/tagModel.js";
import {
  createContainerSasToken,
  createMongoAsset,
  uploadToBlobStorage
} from "../blobStorage.js";

// Mock dependencies
jest.mock("../../models/assetModel.js", () => ({
  assetModel: jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({
      _id: "ObjectId123",
      name: "New Category"
    })
  }))
}));

jest.mock("../../models/projectModel.js", () => ({
  projectModel: {
    create: jest.fn(),
    deleteOne: jest.fn(),
    find: jest.fn(),
    findOne: jest
      .fn()
      .mockResolvedValue({ _id: "something", name: "something" }),
    updateOne: jest.fn()
  }
}));

jest.mock("../../models/categoryModel.js", () => ({
  categoryModel: {
    create: jest.fn(),
    deleteOne: jest.fn(),
    find: jest.fn(),
    findOne: jest
      .fn()
      .mockResolvedValue({ _id: "something", name: "something" }),
    updateOne: jest.fn()
  }
}));

jest.mock("../../models/tagModel.js", () => ({
  tagModel: {
    create: jest
      .fn()
      .mockResolvedValue({ _id: "something", name: "something" }),
    deleteOne: jest.fn(),
    find: jest.fn(),
    findOne: jest
      .fn()
      .mockResolvedValue({ _id: "something", name: "something" }),
    updateOne: jest.fn()
  }
}));

jest.mock("@azure/storage-blob", () => ({
  ContainerSASPermissions: {
    parse: jest.fn().mockReturnValue("r") // Mock the permissions as read-only
  },
  generateBlobSASQueryParameters: jest.fn(),
  StorageSharedKeyCredential: jest.fn()
}));

jest.mock("../logger.js", () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

describe("uploadToBlobStorage", () => {
  let mockContainerClient;
  let mockBlockBlobClient;

  beforeAll(() => {
    // Mock environment variables
    process.env.AZURE_STORAGE_ACCOUNT_NAME = "mockAccountName";
    process.env.AZURE_STORAGE_ACCOUNT_KEY = "mockAccountKey";
  });

  beforeEach(() => {
    // Mock BlockBlobClient
    mockBlockBlobClient = {
      uploadData: jest.fn().mockResolvedValue(undefined), // Mock uploadData
      url: "https://mockstorage.blob.core.windows.net/container/mockBlob" // Mock URL
    };

    // Mock ContainerClient
    mockContainerClient = {
      getBlockBlobClient: jest.fn().mockReturnValue(mockBlockBlobClient)
    };
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  test("should upload a single file to Blob Storage and handle both array and non-array input", async () => {
    expect.assertions(4);

    const file = {
      fileBuffer: Buffer.from("mock file data"),
      originalName: "file1.txt"
    };

    // Test with an array (same as before)
    const resultArray = await uploadToBlobStorage(mockContainerClient, [file]);

    expect(mockBlockBlobClient.uploadData).toHaveBeenCalledWith(
      Buffer.from("mock file data"),
      { tier: "Hot" }
    );
    expect(resultArray).toStrictEqual([
      "https://mockstorage.blob.core.windows.net/container/mockBlob"
    ]);

    // Test with a single file (not an array)
    const resultSingle = await uploadToBlobStorage(mockContainerClient, file);

    expect(mockBlockBlobClient.uploadData).toHaveBeenCalledWith(
      Buffer.from("mock file data"),
      { tier: "Hot" }
    );
    expect(resultSingle).toStrictEqual([
      "https://mockstorage.blob.core.windows.net/container/mockBlob"
    ]);
  });

  test("should throw an error if files array is empty", async () => {
    expect.assertions(1);

    const files = [];

    await expect(
      uploadToBlobStorage(mockContainerClient, files)
    ).rejects.toThrow("File data is required for upload.");
  });

  test("should throw an error if fileBuffer is missing", async () => {
    expect.assertions(1);

    const files = [
      {
        originalName: "file1.txt"
      }
    ];

    await expect(
      uploadToBlobStorage(mockContainerClient, files)
    ).rejects.toThrow("File data is required for upload.");
  });
});

describe("createContainerSasToken", () => {
  const mockContainerName = "mock-container";
  const mockMinutes = 10;

  let mockSasToken;

  beforeAll(() => {
    // Set up the mock SAS token that the mocked generateBlobSASQueryParameters will return
    mockSasToken = "mocked-sas-token";
    generateBlobSASQueryParameters.mockReturnValue({
      toString: jest.fn().mockReturnValue(mockSasToken)
    });
  });

  beforeAll(() => {
    // Set up the mock SAS token that the mocked generateBlobSASQueryParameters will return
    mockSasToken = "mocked-sas-token";
    generateBlobSASQueryParameters.mockReturnValue({
      toString: jest.fn().mockReturnValue(mockSasToken)
    });
  });

  test("should generate SAS token successfully", async () => {
    expect.assertions(1);

    const result = await createContainerSasToken(
      mockContainerName,
      mockMinutes
    );

    // Verify that the SAS token is returned correctly
    expect(result).toBe(mockSasToken);

    // Verify that the SAS token was logged
  });

  test("should throw an error if SAS token generation fails", async () => {
    expect.assertions(1);

    // Mock the failure of SAS token generation
    generateBlobSASQueryParameters.mockImplementationOnce(() => {
      throw new Error("SAS token generation failed");
    });

    try {
      await createContainerSasToken(mockContainerName, mockMinutes);
    } catch (error) {
      // Verify that the error was logged

      // Ensure that the error was rethrown
      expect(error.message).toBe("SAS token generation failed");
    }
  });
});

describe("createMongoAsset", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("assetModel creation and save an assetModel", async () => {
    expect.assertions(1);

    const mainFile = {
      mimetype: "text/plain",
      originalname: "file1.txt",
      size: 1234
    };

    const reqBody = {
      categories: JSON.stringify(["Category1", "Category2"]),
      description: "A sample asset",
      license: "CC",
      model: JSON.stringify({ version: "1.0" }),
      name: "Sample Asset",
      origin: "USA",
      price: 100,
      production: JSON.stringify({ status: "ready" }),
      projects: JSON.stringify(["Project1", "Project2"]),
      tags: JSON.stringify(["Tag1", "Tag2"]),
      texture: JSON.stringify({ color: "red" })
    };

    const previewImagesUrl = "https://example.com/preview.jpg";

    // Ensure that the assetModel constructor works as expected
    const saved = await createMongoAsset(mainFile, reqBody, [previewImagesUrl]);

    expect(saved).toBe(true);
  });

  test("null case", async () => {
    expect.assertions(1);

    jest.mocked(projectModel.findOne).mockReturnValue(null);
    jest.mocked(categoryModel.findOne).mockReturnValue(null);
    jest.mocked(tagModel.findOne).mockReturnValue("");

    const mainFile = {
      mimetype: "text/plain",
      originalname: "file1.txt",
      size: 1234
    };

    const reqBody = {
      description: "A sample asset",
      name: "Sample Asset"
    };

    const previewImagesUrl = "https://example.com/preview.jpg";
    // Ensure that the assetModel constructor works as expected
    const saved = await createMongoAsset(mainFile, reqBody, [previewImagesUrl]);

    expect(saved).toBe(true);
  });

  test("catch case", async () => {
    expect.assertions(1);

    jest
      .mocked(projectModel.findOne)
      .mockReturnValue(new Error("Database save error"));

    const reqBody = {
      wrong: null
    };

    const previewImagesUrl = "https://example.com/preview.jpg";
    // Ensure that the assetModel constructor works as expected
    const saved = await createMongoAsset(undefined, reqBody, [
      previewImagesUrl
    ]);

    expect(saved).toBe(false);
  });
});
