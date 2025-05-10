import { formatUserData } from "../helpers/dataFormatter.js";
import { createJWT } from "../utils/jwt.js";
import { PASSWORD_REGEX } from "../constants/regex.js";
import authService from "../services/authService.js";

const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone)
      return res.status(422).send("Email or phone is required.");

    if (!password) return res.status(422).send("Password is required.");

    const data = await authService.login(req.body);

    const formattedData = formatUserData(data);

    const token = createJWT(formattedData);

    res.cookie("authToken", token);

    res.json({ ...formattedData, token });
  } catch (error) {
    res.status(error.statusCode || 500).send(error.message);
  }
};

const register = async (req, res) => {
  try {
    const { address, email, name, phone, password, confirmPassword } = req.body;

    if (!address?.city)
      return res.status(422).send("Address city is required.");
    if (!email) return res.status(422).send("Email is required.");
    if (!name) return res.status(422).send("Name is required.");
    if (!phone) return res.status(422).send("Phone number is required.");
    if (!password) return res.status(422).send("Password is required.");
    if (!confirmPassword)
      return res.status(422).send("Confirm password is required.");
    if (password != confirmPassword)
      return res.status(422).send("Passwords do not match.");

    if (!PASSWORD_REGEX.test(password))
      return res
        .status(422)
        .send(
          "Password must contain uppercase, lowercase, number and special character."
        );

    const data = await authService.register(req.body);

    const formattedData = formatUserData(data);

    const token = createJWT(formattedData);

    res.cookie("authToken", token);

    res.json({ ...formattedData, token });
  } catch (error) {
    res.status(error.statusCode || 500).send(error.message);
  }
};

const logout = (req, res) => {
  res.clearCookie("authToken");

  res.json({ message: "Logout successful." });
};

/**
 * 1. User forgot password
 * 2. User request for reset password in email
 * 3. User gets email
 * 4. Email has reset password link
 */

const forgotPassword = async (req, res) => {
  const email = req.body.email;

  if (!email) return res.status(422).send("Email is required.");

  try {
    const data = await authService.forgotPassword(email);

    res.json(data);
  } catch (error) {
    res.json(error);
  }
};

const resetPassword = async (req, res) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const token = req.query.token;
  const userId = req.params.userId;

  if (!password) return res.status(422).send("Password is required.");
  if (!confirmPassword)
    return res.status(422).send("Confirm password is required.");

  if (password != confirmPassword)
    return res.status(422).send("Passwords do not match.");

  try {
    const data = await authService.resetPassword(userId, token, password);

    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).send(error.message);
  }
};

// /reset-password?token=<some-token-secret>

export { login, register, logout, forgotPassword, resetPassword };
