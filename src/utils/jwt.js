import jwt from "jsonwebtoken";

function createJWT(data) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be defined");

  return jwt.sign(data, secret, { expiresIn: "1d" });
}

function verifyJWT(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be defined");

  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

export { createJWT, verifyJWT };
