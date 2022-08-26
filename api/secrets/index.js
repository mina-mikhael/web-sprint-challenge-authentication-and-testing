require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "don't tell anyone!";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 8;
const NODE_ENV = process.env.NODE_ENV || "development";

module.exports = { JWT_SECRET, BCRYPT_ROUNDS, NODE_ENV };
