import { User, validate, passValidate } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandle.js";
import bcrypt from "bcrypt";
import { searchFile, getSheets } from "../utils/googleApi.js";
export const register = async (req, res, next) => {
  try {
    const { error } = validate(req.body);
    if (error) {
      return next(new ErrorHandler(error.details[0].message, 400));
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return next(
        new ErrorHandler("User with given email already exist!", 409)
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    await new User({ ...req.body, password: hashPassword }).save();
    res.status(201).send("User created Successfully");
  } catch (error) {
    return next(new ErrorHandler());
  }
};
export const login = async (req, res, next) => {
  try {
    const { error } = passValidate(req.body);
    if (error) return next(new ErrorHandler(error.details[0].message), 400);

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return next(new ErrorHandler("Invalid Email or Password"), 401);
    const token = user.generateAuthToken();
    res.status(200).send({ data: token, message: "logged in successfully" });
  } catch (error) {
    return next(new ErrorHandler());
  }
};

export const myProfile = async (req, res, next) => {
  let _id = req.id;
  const user = await User.findOne({ _id });
  res.status(200).json({
    success: true,
    user,
  });
};
export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid", {
      secure: false,
      httpOnly: false,
      sameSite: false,
    });
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  });
};

export const getFiles = async (req, res, next) => {
  const { token } = req.body;
  try {
    const data = await searchFile(token);
    res.status(200).json({
      message: "success",
      files: data,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getSheet = async (req, res, next) => {
  const { token, id } = req.body;
  try {
    const data = await getSheets(token, id);
    res.status(200).json({
      message: "success",
      sheets: data,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const addSheet = async (req, res, next) => {
  const { token, name, title, column, id } = req.body;
  let _id = req.id;
  try {
    const user = await User.findOne({ _id });
    const oldSheets = user.spreadSheets;
    const newSheets = [...oldSheets, { name, title, column, id }];
    const uniqSheets = [
      ...new Map(newSheets.map((obj) => [obj["id"], obj])).values(),
    ];
    const updatedUser = await User.findByIdAndUpdate(
      { _id: user._id },
      { $set: { spreadSheets: uniqSheets } },
      { new: true }
    );
    const otherUser = await User.findOne({accessToken:token});
    const otherOldSheets = otherUser.spreadSheets;
    const otherNewSheets = [...otherOldSheets,{name,title,column,id}]
    const otheruniqSheets = [
      ...new Map(otherNewSheets.map((obj) => [obj["id"], obj])).values(),
    ];
    await User.findByIdAndUpdate({_id:otherUser._id},{$set:{spreadSheets:otheruniqSheets}})
    res.status(200).send(updatedUser)
  } catch (err) {
    res.status(400).send(err)
  }
};
