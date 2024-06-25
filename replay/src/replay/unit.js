
export default class Unit {

  constructor(owner, type, id, x, y) {
    this.owner = owner;
    this.type = type;
    this.id = id;
    this.x = x;
    this.y = y;
  }

  toString() {
    return this.type + " " + this.id;
  }
}
