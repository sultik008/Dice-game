import crypto from 'node:crypto'

export default class Die {
  faces = [];
  constructor(faces) {
    this.faces = faces;
  }
  getfaces() {
    return this.faces;
  }
  roll() {
    const index = crypto.randomInt(this.faces.length)
    return this.faces[index];
  }
}
