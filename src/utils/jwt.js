import jwt from "jsonwebtoken";

function createJWT(data) {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: 86400,
  });
}

async function verifyJWT(authToken) {
  return await new Promise((resolve, reject) => {
    jwt.verify(authToken, process.env.JWT_SECRET, (error, data) => {
      if (error) return reject(error);

      resolve(data);
    });
  });
}

export { createJWT, verifyJWT };
