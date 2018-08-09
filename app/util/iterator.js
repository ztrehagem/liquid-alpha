module.exports = class Iterator {
  constructor(array) {
    this.array = [...array];
  }

  // next() {
  //   const value = this.array.shift();
  //   return { value, done: !this.array.length };
  // }

  // shift() {
  next() {
    return this.array.shift();
  }

  peek() {
    return this.array[0];
  }

  // [Symbol.iterator]() {
  //   return this;
  // }
}