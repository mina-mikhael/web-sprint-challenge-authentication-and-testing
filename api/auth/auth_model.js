const db = require("../../data/dbConfig");

async function add(user) {
  const newUserId = await db("users").insert(user);
  return findById(newUserId);
}

async function findById(id) {
  return db("users").where("id", id).first();
}
async function findBy(filter) {
  return db("users").where(filter).first();
}

module.exports = {
  findById,
  findBy,
  add,
};
