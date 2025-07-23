import crypto from 'node:crypto'

export default class Die {
  faces = [];
  constructor(faces) {
    this.faces = faces;
  }
  getfaces() {
    return this.faces;
  }
  roll(i) {
    return this.faces[i];
  }
}
