
export default class Unit {

  constructor(owner, type, id, loop, x, y) {
    this.owner = owner;
    this.type = type;
    this.id = id;
    this.enter = loop ? loop : 0;
    this.x = x;
    this.y = y;
    this.exit = Infinity;
  }

  toString() {
    return this.type + " " + this.id;
  }
}
