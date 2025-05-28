import UtilService from "./UtilService";

describe("utilService", () => {
  document.body.innerHTML = `
    <div class="test-class" style="color: red;"></div>
    <div class="test-blue" style="color: blue;"></div>
  `;

  test("should return the color of the element by class name", () => {
    expect.assertions(1);

    const color = UtilService.getColorFromHTMLElement("test-class");

    expect(color).toBe("rgb(255, 0, 0)");
  });

  test("should return null if the element does not exist", () => {
    expect.assertions(1);

    const color = UtilService.getColorFromHTMLElement("non-existent-class");

    expect(color).toBeNull();
  });

  test("should handle multiple elements with the same class gracefully", () => {
    expect.assertions(1);

    const color = UtilService.getColorFromHTMLElement("test-blue");

    expect(color).toBe("rgb(0, 0, 255)");
  });

  test("should capitalize the first letter", () => {
    expect.assertions(1);

    const result = UtilService.capitalizeFirstLetter("hello");

    expect(result).toBe("Hello");
  });

  test("should handle empty string gracefully", () => {
    expect.assertions(1);

    const result = UtilService.capitalizeFirstLetter("");

    expect(result).toBe("");
  });
});
