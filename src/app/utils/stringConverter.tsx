function stringConverter() {
  const toSnake = (string: string) => {
    return string
      .replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map((word) => word.toLowerCase())
      .join('_');
  };

  return {
    toSnake,
  };
}

export default stringConverter;
