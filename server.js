import express from "express";
import connectDB from "./db.js";
import userModel from "./userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import createHttpError from "http-errors";

import auth from "./middleware/auth.js";
const app = express();
app.use(express.json());
app.use(cookieParser());
//Routes

app.post("/register", async (req, res, next) => {
  //validation
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = createHttpError(400, "all fiels are required");
    return next(error);
  }
  try {
    const user = await userModel.findOne({ email: email });
    if (user) {
      const error = createHttpError(400, "already user exits");
      return next(error);
    }
  } catch (err) {
    return next(createHttpError(500, "eroor while getting user"));
  }

  //password->hash
  const hashedPassword = await bcrypt.hash(password, 10);
  let newUser;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      tokens: [],
    });
  } catch (err) {
    return next(createHttpError(500, "error while creating user"));
  }

  try {
    //token generation jwt
    const token = jwt.sign({ sub: newUser._id }, "123456789", {
      expiresIn: "7d",
      algorithm: "HS256",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
    });
    newUser.tokens.push({ token });

    // Save the updated user document
    await newUser.save();

    return res.status(201).json({ accessToken: token });
  } catch (err) {
    return next(createHttpError(500, "token generation failed"));
  }
});

app.post("/login", async (req, res, next) => {
  //validation
  const { email, password } = req.body;
  if (!email || !password) {
    const error = createHttpError(400, "all fiels are required");
    return next(error);
  }
  let user;
  try {
    user = await userModel.findOne({ email: email });
    if (!user) {
      const error = createHttpError(400, "user not find");
      return next(error);
    }
  } catch (err) {
    return next(createHttpError(500, "eroor while getting user"));
  }

  let isMatch;
  try {
    isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return next(createHttpError(400, "username or password is incorrect"));
    }
  } catch (err) {
    console.log(err);
    return next(createHttpError(400, "something went wrong"));
  }

  try {
    const token = jwt.sign({ sub: user._id }, "123456789", {
      expiresIn: "7d",
      algorithm: "HS256",
    });
    user.tokens.push({ token });

    // Save the updated user document
    await user.save();
    res.cookie("jwt", token, {
      httpOnly: true,
    });
    res.json({ accessToken: token });
  } catch (err) {
    console.log(err);
    return next(createHttpError(404, "something went wrong"));
  }
});

app.get("/secret", auth, (req, res, next) => {
  res.json({ cookie: req.cookies.jwt });
});

app.get("/logout", auth, async (req, res, next) => {
  try {
    // Filter out the token to be removed
    req.user.tokens = req.user.tokens.filter((currEle) => {
      return currEle.token !== req.token;
    });

    // Clear the JWT cookie
    res.clearCookie("jwt");

    // Save the user document with updated tokens array
    req.user.save();

    // Send a response indicating successful logout
    res.status(201).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);

    // If an error occurs, send a 400 status response with the error message
    res.status(400).json({ error: err.message });
  }
});

app.get("/logoutall", auth, async (req, res, next) => {
  try {
    // Filter out the token to be removed
    req.user.tokens = [];

    // Clear the JWT cookie
    res.clearCookie("jwt");

    // Save the user document with updated tokens array
    req.user.save();

    // Send a response indicating successful logout
    res.status(201).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);

    // If an error occurs, send a 400 status response with the error message
    res.status(400).json({ error: err.message });
  }
});

const startServer = async () => {
  const port = 8000;
  await connectDB();

  app.listen(port, () => {
    console.log(`server is running on port no ${port}`);
  });
};
startServer();
