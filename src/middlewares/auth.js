import { verifyJWT } from "../utils/jwt.js";

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let authToken;

    console.log("Authorization header:", authHeader);
    console.log("Cookies header:", req.headers.cookie);

    if (authHeader && authHeader.startsWith("Bearer ")) {
      authToken = authHeader.split(" ")[1];
    } else {
      const rawCookie = req.headers.cookie;

      if (!rawCookie) {
        console.warn("No cookie header present");
        return res.status(401).send("User not authenticated. No token provided.");
      }

      const cookies = Object.fromEntries(
        rawCookie.split("; ").map((cookie) => {
          const [key, ...val] = cookie.split("=");
          return [key, val.join("=")];
        })
      );

      authToken = cookies.authToken;

      if (!authToken) {
        console.warn("authToken cookie not found");
        return res.status(401).send("User not authenticated. No token found in cookies.");
      }
    }

    console.log("Received token:", authToken);

    const decoded = await verifyJWT(authToken);
    console.log("Token verified successfully:", decoded);

    req.user = decoded; // ✅ Set user on request object
    next(); // ✅ Continue to route
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(401).send("Invalid or expired token");
  }
}

export default auth;
