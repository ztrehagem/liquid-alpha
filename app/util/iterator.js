module.exports = class Iterator {
  constructor(array) {
    this.array = [...array];
  }

  next() {
    const value = this.array.shift();
    return { value, done: !this.array.length };
  }

  peek() {
    return this.array[0];
  }

  [Symbol.iterator]() {
    return this;
  }
}