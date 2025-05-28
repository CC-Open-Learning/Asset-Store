import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";

import AssetService from "../../../services/asset/AssetService";
import ProjectService from "../../../services/projects/ProjectsService";
import { SasTokenContext, SasTokenProvider } from "./SasTokenContext";

vi.mock("../../../services/asset/AssetService", () => ({
  default: {
    getSasToken: vi.fn().mockResolvedValue({ message: "MockAssetToken" })
  }
}));

vi.mock("../../../services/projects/ProjectsService", () => ({
  default: {
    getSasToken: vi.fn().mockResolvedValue({ message: "MockProjectToken" })
  }
}));

describe("sasTokenContext only", () => {
  // eslint-disable-next-line jsdoc/lines-before-block
  /**
   * Component that consumes the SasTokenContext and displays asset and project SasTokens.
   */
  const MockSasTokenContextConsumer = () => {
    const {
      assetSasToken,
      fetchAssetSasToken,
      fetchProjectSasToken,
      projectSasToken
    } = useContext(SasTokenContext);

    return (
      <>
        <p id="mock-asset">Mock Asset: {assetSasToken}</p>
        <p id="project-asset">Mock Project: {projectSasToken}</p>
        <button
          id="fetch-asset"
          onClick={void fetchAssetSasToken}
          type="button">
          Fetch Asset Token
        </button>
        <button
          id="fetch-project"
          onClick={void fetchProjectSasToken}
          type="button">
          Fetch Project Token
        </button>
      </>
    );
  };

  test("provides default assetSasToken and projectSasToken values", () => {
    expect.assertions(2);

    const mockContext = {
      assetSasToken: "",
      fetchAssetSasToken: vi.fn(),
      fetchProjectSasToken: vi.fn(),
      projectSasToken: ""
    };

    const { container } = render(
      <SasTokenContext.Provider value={mockContext}>
        <MockSasTokenContextConsumer />
      </SasTokenContext.Provider>
    );

    const assetElement = container.querySelector("#mock-asset");

    expect(assetElement).toHaveTextContent("Mock Asset:");

    const projectElement = container.querySelector("#project-asset");

    expect(projectElement).toHaveTextContent("Mock Project:");
  });

  test("provides updated assetSasToken and projectSasToken values", () => {
    expect.assertions(2);

    const mockContext = {
      assetSasToken: "test",
      fetchAssetSasToken: vi.fn(),
      fetchProjectSasToken: vi.fn(),
      projectSasToken: "test"
    };

    const { container } = render(
      <SasTokenContext.Provider value={mockContext}>
        <MockSasTokenContextConsumer />
      </SasTokenContext.Provider>
    );
    const assetElement = container.querySelector("#mock-asset");

    expect(assetElement).toHaveTextContent(
      `Mock Asset: ${mockContext.assetSasToken}`
    );

    const projectElement = container.querySelector("#project-asset");

    expect(projectElement).toHaveTextContent(
      `Mock Project: ${mockContext.projectSasToken}`
    );
  });

  test("calls setAssetSasToken when setAssetSasToken function is used", async () => {
    expect.assertions(1);

    const mockFetchAssetSasToken = vi.fn();
    const mockContext = {
      assetSasToken: "",
      fetchAssetSasToken: mockFetchAssetSasToken,
      fetchProjectSasToken: vi.fn(),
      projectSasToken: ""
    };

    const { container } = render(
      <SasTokenContext.Provider value={mockContext}>
        <button
          onClick={() => {
            mockFetchAssetSasToken("new test assetSasToken");
          }}
          type="submit">
          Update Keyword
        </button>
      </SasTokenContext.Provider>
    );

    const updateKeywordButton = container.querySelector("button");
    await userEvent.click(updateKeywordButton!);

    expect(mockFetchAssetSasToken).toHaveBeenCalledWith(
      "new test assetSasToken"
    );
  });

  test("calls setProjectSasToken when setProjectSasToken function is used", async () => {
    expect.assertions(1);

    const mockFetchProjectSasToken = vi.fn();
    const mockContext = {
      assetSasToken: "",
      fetchAssetSasToken: vi.fn(),
      fetchProjectSasToken: mockFetchProjectSasToken,
      projectSasToken: ""
    };

    const { container } = render(
      <SasTokenContext.Provider value={mockContext}>
        <button
          onClick={() => {
            mockFetchProjectSasToken(true);
          }}
          type="submit">
          Show Search Bar
        </button>
      </SasTokenContext.Provider>
    );

    const projectSasTokenButton = container.querySelector("button");
    await userEvent.click(projectSasTokenButton!);

    expect(mockFetchProjectSasToken).toHaveBeenCalledWith(true);
  });
});

describe("with sasTokenProvider", () => {
  // eslint-disable-next-line jsdoc/lines-before-block
  /**
   * Component that consumes the SasTokenContext and displays asset and project SasTokens.
   */
  const SasTokenContextConsumerComponent = () => {
    const {
      assetSasToken,
      fetchAssetSasToken,
      fetchProjectSasToken,
      projectSasToken
    } = useContext(SasTokenContext);

    return (
      <>
        <p id="mock-asset">Mock Asset: {assetSasToken}</p>
        <p id="project-asset">Mock Project: {projectSasToken}</p>
        <button
          id="set-asset-button"
          onClick={() => {
            void fetchAssetSasToken!();
          }}
          type="submit">
          Set Asset
        </button>
        <button
          id="set-project-button"
          onClick={() => {
            void fetchProjectSasToken!();
          }}
          type="submit">
          Set Project
        </button>
      </>
    );
  };

  test("initializes with default values according to SasTokenContextType", () => {
    expect.assertions(2);

    const { container } = render(
      <SasTokenProvider>
        <SasTokenContextConsumerComponent />
      </SasTokenProvider>
    );

    const assetElement = container.querySelector("#mock-asset");

    expect(assetElement).toHaveTextContent("Mock Asset:");

    const projectElement = container.querySelector("#project-asset");

    expect(projectElement).toHaveTextContent("Mock Project:");
  });

  test("updates values via setAssetSasToken function", async () => {
    expect.assertions(1);

    const { container } = render(
      <SasTokenProvider>
        <SasTokenContextConsumerComponent />
      </SasTokenProvider>
    );

    const setAssetButton = container.querySelector("#set-asset-button");

    await userEvent.click(setAssetButton!);

    // Wait for the DOM to update before asserting
    await waitFor(() => {
      const assetElement = container.querySelector("#mock-asset");

      expect(assetElement).toHaveTextContent("Mock Asset: MockAssetToken");
    });
  });

  test("updates values via setProjectSasToken function", async () => {
    expect.assertions(1);

    const { container } = render(
      <SasTokenProvider>
        <SasTokenContextConsumerComponent />
      </SasTokenProvider>
    );

    const setProjectButton = container.querySelector("#set-project-button");
    await userEvent.click(setProjectButton!);

    const projectElement = container.querySelector("#project-asset");

    expect(projectElement).toHaveTextContent("Mock Project: MockProjectToken");
  });

  test("handles error in fetchAssetSasToken and resets assetSasToken", async () => {
    expect.assertions(1);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.spyOn(AssetService, "getSasToken").mockRejectedValueOnce(
      "Mock Asset Error"
    );

    const { container } = render(
      <SasTokenProvider>
        <SasTokenContextConsumerComponent />
      </SasTokenProvider>
    );

    const setAssetButton = container.querySelector("#set-asset-button");
    await userEvent.click(setAssetButton!);

    const assetElement = container.querySelector("#mock-asset");

    expect(assetElement).toHaveTextContent("Mock Asset:");

    consoleErrorSpy.mockRestore();
  });

  test("handles error in fetchProjectSasToken and resets projectSasToken", async () => {
    expect.assertions(1);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.spyOn(ProjectService, "getSasToken").mockRejectedValueOnce(
      "Mock Project Error"
    );

    const { container } = render(
      <SasTokenProvider>
        <SasTokenContextConsumerComponent />
      </SasTokenProvider>
    );

    const setProjectButton = container.querySelector("#set-project-button");
    await userEvent.click(setProjectButton!);

    const projectElement = container.querySelector("#project-asset");

    expect(projectElement).toHaveTextContent("Mock Project:");

    consoleErrorSpy.mockRestore();
  });
});
