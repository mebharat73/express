import User from "../models/User.js";
import ResetPassword from "../models/ResetPassword.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/email.js";

const login = async (data) => {
  const user = await User.findOne({
    $or: [{ email: data.email }, { phone: data.phone }],
  });

  if (!user) {
    throw {
      statusCode: 404,
      message: "User not found.",
    };
  }

  const isPasswordMatch = bcrypt.compareSync(data.password, user.password);

  if (!isPasswordMatch) {
    throw {
      statusCode: 400,
      message: "Incorrect email or password.",
    };
  }

  return user;
};

const register = async (data) => {
  const user = await User.findOne({
    $or: [{ email: data.email }, { phone: data.phone }],
  });

  if (user) {
    throw {
      statusCode: 409,
      message: "User already exists.",
    };
  }

  const hashedPassword = bcrypt.hashSync(data.password);

  return await User.create({
    address: data.address,
    name: data.name,
    phone: data.phone,
    email: data.email,
    password: hashedPassword,
    roles: data.roles,
  });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw {
      statusCode: 404,
      message: "User not found.",
    };
  }

  const otp = Math.floor(Math.random() * 1000000);

  await ResetPassword.create({
    userId: user?._id,
    token: otp,
  });

  // Send email to user
  await sendEmail(email, {
    subject: "Reset password link",
    body: `${process.env.APP_URL}/reset-password/${user?._id}?token=${otp}`,
  });

  return { message: "Reset password link has been sent" };
};

const resetPassword = async (userId, token, password) => {
  const data = await ResetPassword.findOne({
    userId,
    expiresAt: { $gt: Date.now() },
  });

  if (!data || data.token !== token) {
    throw {
      statusCode: 400,
      message: "Invalid token.",
    };
  }

  if (data.isUsed) {
    throw {
      statusCode: 400,
      message: "Token already used.",
    };
  }

  const hashedPassword = bcrypt.hashSync(password);

  await User.findByIdAndUpdate(userId, {
    password: hashedPassword,
  });

  await ResetPassword.findByIdAndUpdate(data._id, {
    isUsed: true,
  });

  return { message: "Password reset successful." };
};

export default { login, register, forgotPassword, resetPassword };
