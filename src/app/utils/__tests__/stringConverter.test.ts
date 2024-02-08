import stringConverter from "../stringConverter";

describe("stringConverter", () => {
  it("should check function", () => {
    expect(stringConverter().toSnake('te*$s#@t')).toBe('te_s_t')
  });
});
