import { AppConfig, dateApplicationFormat, dateFilterFormat, dateFormat, datePickerFormat, dateRequestFormat, format, mmDdYyFormat, permissions, pnaStatuses, resourceLocations, resourceStatuses, reverseDateFormat, types } from "../AppConfig";

describe("Appconfig", () => {
  it("should check type", () => {
    expect(AppConfig).toBeInstanceOf(Object);
    expect(types).toBeInstanceOf(Array);
    expect(permissions).toBeInstanceOf(Object);
    expect(typeof format).toBe('string');
    expect(typeof dateFormat).toBe('string');
    expect(typeof reverseDateFormat).toBe('string');
    expect(typeof dateFilterFormat).toBe('string');
    expect(typeof dateApplicationFormat).toBe('string');
    expect(typeof mmDdYyFormat).toBe('string');
    expect(typeof dateRequestFormat).toBe('string');
    expect(typeof datePickerFormat).toBe('string');
    expect(pnaStatuses).toBeInstanceOf(Array);
    expect(resourceStatuses).toBeInstanceOf(Array);
    expect(resourceLocations).toBeInstanceOf(Array);
  });
});
