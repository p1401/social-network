const User = require("../models/user");
const Followers = require("../models/user_followers");
const db = require("../db/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { QueryTypes, sequelize, Op } = require("sequelize");
const moment = require("moment");
moment().format("yyyy-MM-dd HH:mm:ss");

// Lấy ngày giờ hiện tại
const currentDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

//Kiểm tra chuỗi nhập vào
const isEmpty = function (value) {
  if (!value || 0 === value.length) {
    return true;
  }
};

//Kiểm tra datetime
const isDateTime = function (value) {
  let filterDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
  let filterDateTime =
    /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/;
  if (filterDate.test(value) || filterDateTime.test(value)) {
    return true;
  } else {
    return false;
  }
};

//Kiểm tra email
const isEmail = function (value) {
  let filter =
    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (filter.test(value)) {
    return true;
  } else {
    return false;
  }
};

//Đăng ký
exports.signUp = async function (users) {
  if (
    isEmpty(users.email) ||
    isEmpty(users.password) ||
    isEmpty(users.firstname) ||
    isEmpty(users.lastname)
  ) {
    let err = {
      code: "INVALID_INPUT",
      message: "Email, password, firstname, lastname can not blank",
    };
    throw err;
  }

  // Kiểm tra định dạng email
  if (!isEmail(users.email)) {
    let err = {
      code: "DATATYPE_ERROR",
      message: "Email is incorrect datatype",
    };
    throw err;
  }

  // Kiểm tra email đã tồn tại hay chưa, chưa có thì throw lỗi
  let checkEmail = await User.findOne({ where: { email: users.email } });
  if (checkEmail != null) {
    let err = {
      code: "ER_DUP_ENTRY",
      message: "Email must be unique",
    };
    throw err;
  }

  // Kiểm tra định dạng ngày tháng
  if (!isDateTime(users.birth)) {
    let err = {
      code: "INCORRECT_DATATYPE",
      message: "Date of birth is incorrect datatype",
    };
    throw err;
  }
  const hashPass = bcrypt.hashSync(users.password, 10);
  users.password = hashPass;
  var result = await User.create(users);
  return result;
};

// Tạo token khi đăng nhập
exports.generateToken = async (users, secretSignature) => {
  try {
    //Kiểm tra dữ liệu nhập vào có trống hay không
    if (isEmpty(users.email) || isEmpty(users.password)) {
      let err = {
        code: "INVALID_INPUT",
        message: "Email and password can not blank",
      };
      throw err;
    }
    // Kiểm tra tài khoản có tồn tại hay không, nếu không thì in ra lỗi
    let checkUser = await User.findOne({ where: { email: users.email } });
    if (checkUser === null) {
      let err = {
        code: "NOT_FOUND",
        message: "Can not found user",
      };
      throw err;
    }
    //Kiểm tra mật khẩu chính xác hay không
    let isPassValid = bcrypt.compareSync(users.password, checkUser.password);
    if (!isPassValid) {
      let err = {
        code: "INCORRECT_PASSWORD",
        message: "Password is incorrect",
      };
      throw err;
    }
    const payload = {
      idUser: checkUser.id,
      email: checkUser.email,
    };
    return jwt.sign(
      {
        payload,
      },
      secretSignature,
      {
        algorithm: "HS256",
      }
    );
  } catch (error) {
    throw error;
  }
};

//Lấy thông tin user
exports.profile = async (email) => {
  try {
    let result = await User.findOne({ where: { email: email } });
    return (data = {
      email: result.email,
      birth: result.birth,
      firstname: result.firstname,
      lastname: result.lastname,
      avatar: result.avatar,
    });
  } catch (err) {
    throw err;
  }
};

exports.getFollowBy = async (user_id) => {
  try {
    let result = await db.query(
      `SELECT email, birth, firstname, lastname, avatar FROM users 
      WHERE find_in_set(id, (SELECT GROUP_CONCAT(DISTINCT t1.user_id) 
      FROM user_followers t1 WHERE t1.followed_id = ${user_id}))`,
      { plain: false, type: QueryTypes.SELECT }
    );
    return result;
  } catch (err) {
    throw err;
  }
};

exports.getFollowTo = async (user_id) => {
  try {
    let result = await db.query(
      `SELECT email, birth, firstname, lastname, avatar FROM users 
      WHERE find_in_set(id, (SELECT GROUP_CONCAT(DISTINCT t1.followed_id) 
      FROM user_followers t1 WHERE t1.user_id = ${user_id}))`,
      { plain: false, type: QueryTypes.SELECT }
    );
    return result;
  } catch (err) {
    throw err;
  }
};

// follow/unfollow users
exports.follow = async (user_id, followed_id) => {
  let message;
  try {
    let isUserExists = await checkUserExist(followed_id);
    let alreadyFollowed = await checkFollowerExist(user_id, followed_id);
    if (Number(followed_id) === Number(user_id)) {
      // Condition of not following self
      let err = {
        code: "INVALID_INPUT",
        message: "You cannot follow yourself",
      };
      throw err;
    }
    if (!isUserExists) {
      // Check if there is an user in database
      let err = {
        code: "NOT_FOUND",
        message: "User not found!",
      };
      throw err;
    }
    if (alreadyFollowed) {
      let message = "Unfollow successfully";
      // Destroy when already follow
      await Followers.destroy({
        where: {
          user_id,
          followed_id,
        },
      });
      return message;
    }
    message = "Follow successfully";
    // Create new follow
    await Followers.create({
      followed_at: currentDateTime,
      user_id,
      followed_id,
    });
    return message;
  } catch (err) {
    throw err;
  }
};

// check user exist
const checkUserExist = async (id) => {
  try {
    if (!isNaN(id)) {
      const user = await User.findByPk(id);
      return user;
    }
  } catch (error) {
    throw error;
  }
};

// check follower exist
const checkFollowerExist = async (user_id, followed_id) => {
  try {
    if (!isNaN(user_id) && !isNaN(followed_id)) {
      const like = await Followers.findOne({
        where: {
          user_id,
          followed_id,
        },
      });
      return like;
    }
  } catch (error) {
    throw error;
  }
};
