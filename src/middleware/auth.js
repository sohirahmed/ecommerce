import userModel from "../../db/models/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/globalErrorHandling.js";

export const auth = (roles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
      return res.status(400).json({ msg: "token not exist" });
    }
    if (!token.startsWith(process.env.bearerKey)) {
      return res.status(400).json({ msg: "invalid bearer key" });
    }
    const newToken = token.split(process.env.bearerKey)[1];

    const decoded = jwt.verify(newToken, process.env.signatureKey);
    if (!decoded?.email) {
      return res.status(400).json({ msg: "invalid token payload" });
    }

    const user = await userModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ msg: "user not found" });
    }
    //authorization
    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ msg: "you are not authorized to access this route" });
    }
    if (parseInt(user?.passwordChangeAt?.getTime() / 1000) > decoded.iat) {
      return res.status(403).json({ msg: "token expired please login again" });
    }
    req.user = user;
    next();
  });
};
