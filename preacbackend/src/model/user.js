const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      // maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email Address");
        }
      },
    },
    password: {
      required:true,
      type: String,
      trim:true,
      validate(value){
        if(!validator.isStrongPassword(value)){
          throw new Error("Your password is not strong" + value)
        }
      }
    },
    age: {
      type: Number,
      max: 18,
      trim:true
    },
    gender: {
      trim:true,
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid");
        }
      },
    },
    about: {

      type: String,
      default: "this is default about",
    },
    skills: {
      type: [String],
    },
    photoUrl: {
      type: String,
      default: "https://avatars.githubusercontent.com/u/7790161?v=4",
      validate(value){
        if(!validator.isURL(value)){
          throw new Error("Invalid Proto URL: " + value )
        }
      }
    },
  },
  {
    timestamps: true,
  }
);




const User = mongoose.model("User", userSchema);

module.exports = User;
