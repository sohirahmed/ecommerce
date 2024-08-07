import userModel from "../../../db/models/user.model.js";
import { AppError } from "../../utils/classError.js";
import { asyncHandler } from "../../utils/globalErrorHandling.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "./../../service/sendEmail.js";
import bcrypt from "bcrypt";
import { nanoid, customAlphabet } from "nanoid";

//===================================getUser=====================================
export const getUser = asyncHandler(async (req, res, next) => {
  const users = await userModel.find();
  res.status(200).json({ msg: "done", users });
});

//=================================signUp===================================

export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, age, phone, address, role } = req.body;

  const userExist = await userModel.findOne({ email: email.toLowerCase() });
  
  userExist && next(new AppError("user already exist", 409));
  // if(userExist){
  //     return next (new AppError( "user already exist" , 409))
  // }
  const token = jwt.sign({ email }, process.env.signatureKey, {
    expiresIn: "1d",
  });
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;

  const refToken = jwt.sign({ email }, process.env.signatureKeyRefresh);
  const refLink = `${req.protocol}://${req.headers.host}/users/refreshToken/${refToken}`;

  await sendEmail(
    email,
    "verify your email",
    `<a href="${link}">click here</a> <br>
      <a href="${refLink}">click here to resend the link</a>`
  );
  const hash = bcrypt.hashSync(password, Number(process.env.saltRounds)); //ba7awel le number (Number() , + , parsInt)
  const user = new userModel({
    name,
    email,
    password: hash,
    age,
    phone,
    address,
    role
  });
  const newUser = await user.save();
  newUser
    ? res.status(201).json({ msg: "done", user: newUser })
    : next(new AppError("user not created", 400));
});

//=======================================verifyEmail=========================================

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.signatureKey);
  if (!decoded?.email) return next(new AppError("inValid token", 400));
  const user = await userModel.findOneAndUpdate(
    { email: decoded.email, confirmed: false },
    { confirmed: true },
    { new: true }
  );
  user
    ? res.status(200).json({ msg: "done", user })
    : next(new AppError("user not found or already confirmed", 400));
});

//=======================================refreshToken=========================================

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refToken } = req.params;
  const decoded = jwt.verify(refToken, process.env.signatureKeyRefresh);
  if (!decoded?.email) return next(new AppError("inValid token", 400));

  const user = await userModel.findOne({
    email: decoded.email,
    confirmed: true,
  });
  if (user) {
    return next(new AppError("user already confirmed", 400));
  }

  const token = jwt.sign({ email: decoded.email }, process.env.signatureKey, {
    expiresIn: "1d",
  });
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;

  await sendEmail(
    decoded.email,
    "verify your email",
    `<a href="${link}">click here</a>`
  );
  res.status(200).json({ msg: "done" });
});

//==========================================forgotPassword====================================

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new AppError("user not exist", 404));
  }
  const code = customAlphabet("0123456789", 5);
  const newCode = code();

  await sendEmail(
    email,
    "code for reset password",
    `<h1>your code is ${newCode}</h1>`
  );
  await userModel.updateOne({ email }, { code: newCode });

  res.status(200).json({ msg: "done" });
});

//========================================resetPassword=========================================

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body;

  const user = await userModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new AppError("user not exist"));
  }
  if (user.code !== code || code == "") {
    return next(new AppError("invalid code", 400));
  }

  // console.log();
  // console.log(decoded.iat);
  // if (parseInt(user.passwordChangeAt.getTime() / 1000) > decoded.iat) {
  //   return res.status(403).json({ msg: " token expired please login again" });
  // }

  const hash = bcrypt.hashSync(password, +process.env.saltRounds);
  await userModel.updateOne(
    { email },
    { password: hash, code: "", passwordChangeAt: Date.now() }
  );

  res.status(200).json({ msg: "done" });
});

//==========================================signIn============================================

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email: email.toLowerCase(),
    confirmed: true,
  });
  if (!user || !bcrypt.compare(password, user.password)) {
    return next(new AppError("inValid email or inValid password ", 400));
  }
  const token = jwt.sign(
    { id: user._id, email, role: user.role },
    process.env.signatureKey
  );

  await userModel.updateOne({ email }, { loggedIn: true });
  // console.log(token)
  return res.status(200).json({ msg: "done", token });
});
