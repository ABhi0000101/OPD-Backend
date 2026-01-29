class Doctor {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.createdAt = new Date();
  }
}

module.exports = Doctor;