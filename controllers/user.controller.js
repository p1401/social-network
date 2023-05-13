const User = require("../models/user");
const Follower = require("../models/user_followers");
const db = require("../db/config");
const { QueryTypes } = require("sequelize");
const userService = require("../services/user.service");
const bcrypt = require("bcryptjs");

// Đăng kí tài khoản
exports.signUp = async function (req, res, next) {
  try {
    // const salt = await bcrypt.genSalt(10);
    // const hashPass = await bcrypt.hashSync(req.body.password, salt);
    const users = {
      email: req.body.email,
      password: req.body.password,
      birth: req.body.birth,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      avatar: req.body.avatar,
    };
    await userService.signUp(users);
    res.status(200).json({
      status: "Success",
      code: null,
      message: null,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

// Đăng nhập tài khoản
exports.signIn = async (req, res) => {
  try {
    const users = {
      email: req.body.email,
      password: req.body.password,
    };
    const accessToken = await userService.generateToken(
      users,
      process.env.ACCESS_TOKEN_SECRET
    );
    return res.json({
      status: "Success",
      code: null,
      message: null,
      token: accessToken,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      token: null,
    });
  }
};

exports.profile = async (req, res, next) => {
  try {
    let result = await userService.profile(req.email);
    return res.json({
      status: "Success",
      code: null,
      message: null,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

// Lấy tất cả Users đang theo dõi và được theo dõi
exports.getFollower = async (req, res) => {
  try {
    let status = req.query.status;
    let result;
    if (status === "followTo") {
      result = await userService.getFollowTo(req.id);
    }
    if (status === "followBy") {
      result = await userService.getFollowBy(req.id);
    }
    return res.json({
      status: "Success",
      code: null,
      message: null,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

// find all users by name
exports.searchUserByName = async (req, res) => {
  try {
    let name = req.query.name;
    if (name) {
      let result = await db.query(
        `SELECT * FROM users WHERE CONCAT(firstname,  ' ', lastname) LIKE '%${name}%'`,
        { plain: false, type: QueryTypes.SELECT }
      );
      return res.json({
        status: "Success",
        code: null,
        message: null,
        data: result,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};

// follow/unfollow users
exports.changeFollow = async (req, res) => {
  try {
    let results = await userService.follow(req.id, req.params.id);
    return res.json({
      status: "Success",
      code: null,
      message: results,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "Error",
      code: err.code,
      message: err.message,
      data: null,
    });
  }
};
