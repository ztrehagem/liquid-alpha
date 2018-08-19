export default class Iterator<T> {

  private array: T[];

  constructor(array: T[]) {
    this.array = array;
  }

  next() {
    return this.array.shift();
  }

  peek() {
    return this.array[0];
  }
}