import jwt from "jsonwebtoken";
import userModel from "../userModel.js";

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    const verifyUser = jwt.verify(token, "123456789");
    console.log("verifyuser", verifyUser);

    console.log("verified here");
    const user = await userModel.findOne({ _id: verifyUser.sub });
    console.log(user);
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
  next();
};
export default auth;
