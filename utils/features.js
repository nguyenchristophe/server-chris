// utils/features.js
import DataUriParser from "datauri/parser.js";
import path from "path";
import { createTransport } from "nodemailer";

export const getDataUri = (file) => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export const sendToken = (user, res, message, statusCode) => {
  const token = user.generateToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      ...cookieOptions,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 jours
    })
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        // … tout autre champ à exposer
      },
      token,    // ← on renvoie le JWT ici
    });
};

export const cookieOptions = {
  secure: process.env.NODE_ENV === "Development" ? false : true,
  httpOnly: process.env.NODE_ENV === "Development" ? false : true,
  sameSite: process.env.NODE_ENV === "Development" ? false : "none",
};

export const sendEmail = async (subject, to, text) => {
  const transporter = createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    to,
    subject,
    text,
  });
};
