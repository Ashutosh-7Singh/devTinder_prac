const jwt = require("jsonwebtoken");
const User = require("../model/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token the req cookies
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is not valid" });
    }
    // Validate the token
    const decodeObj = await jwt.verify(token, "DEV@Tinder$7890");
    // Find the user
    const { _id } = decodeObj;

    const user = await User.findById(_id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

module.exports = userAuth;
