const express = require("express");
const connectDB = require("./config/database.js");
const User = require("./model/user.js");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const userAuth = require("./middlewares/auth.js");
const app = express();
connectDB();
app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
  try {
    // validate the data
    validateSignUpData(req);
    const { password, firstName, lastName, emailId } = req.body;
    // encrypt the passeword
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    // creating a new instance of the user
    const userInfo = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const user = await userInfo.save();
    res.json({ message: "User data saved Sucessfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    if (!emailId || !password) {
      return res
        .status(400)
        .json({ sucess: false, message: "Body is Invalid  " });
    }
    if (!validator.isEmail(emailId)) {
      return res.status(400).json({ message: "Invalid Email ID", emailId });
    }
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials", user });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      // create a token
      const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$7890",{
         expiresIn:"1d",
      });
      console.log(token);
      // add the token in the cookie and send the response back to the user
      res.cookie("token", token,{
         expires: new Date(Date.now() + 8 * 3600000),
      });
      res.status(200).json({ sucess: true, message: "Login Successful" });
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.get("/profile",userAuth, async (req, res) => {
  try {
    const user =req.user;
    return res.status(200).json({success:true,message:"user Found Sucessfully: " , user})
  } catch (error) {
    return res.status(500).json({
      sucess: false,
      message: error.message || "Something went wrong",
    });
  }
});


app.post("/sendConnectionRequest",userAuth,async(req,res)=>{
  const user=req.user

  res.send(`${user.firstName} is sending connection requres `)
})


















app.get("/userbyEmail", async (req, res) => {
  const email = req.body.emailId;
  try {
    const user = await User.findOne({ email });
    res.json({ message: "User found sucessfully", user });
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" } + error.message);
  }
});

// findbyid
app.get("/userbyId", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findById({ _id: userId });
    res.json({ message: "Data fetched Sucessfully", user });
  } catch (error) {
    res.status(400).json({ message: "Soomething went wrong" } + error.message);
  }
});

// deletebyemail
app.delete("/deletebyemail", async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOneAndDelete({ email: email });
    res.json({ message: "User deleted sucessfully", user });
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" } + error.message);
  }
});

// deletbyId
app.delete("/deletebyid", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(
      { _id: userId },
      {
        returnDocument: "before",
      }
    );
    res.json({ message: "User delete by id sucessfully", user });
  } catch (error) {
    res.status(400).json({ message: "user delete by id " } + error.message);
  }
});

// updatebyEmail
app.patch("/updatebyemail", async (req, res) => {
  const emailId = req.body;
  // const {emailId,...data} = req.body;
  //   {
  //     "userId":"6820a7c7e3723517138df7f7",
  //     "firstName": "ashutosh  ",
  //     "lastName":"MoniSingh",
  //     "emailId":"moni1@12345678",
  //     "gender":"male",
  //     "skills":"avc"

  // }
  const ALLOWED_UPDATES = [
    "userId",
    "firstName",
    "lastName",
    "gender",
    "skills",
    "age",
  ];

  const isAllowedUpdate = Object.keys(data).every((k) =>
    ALLOWED_UPDATES.includes(k)
  );
  if (!isAllowedUpdate) {
    // res send("Update Not Allowed");
  }
  try {
    const user = await User.findOneAndUpdate({ emailId: emailId }, data, {
      returnDocument: "after",
    });
    res.json({ message: "user updated sucessfully", user });
  } catch (error) {
    res.status(400).json({ message: "some thing went wrong" + error.message });
  }
});

// updatebyid
app.patch("/updatebyId/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = [
      "firstName",
      "photoUrl",
      "about",
      "lastName",
      "gender",
      "skills",
      "age",
    ];
    const isAllowedUpdate = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isAllowedUpdate) {
      return res.status(400).send("update not allowed");
    }
    if (data.skills.length > 10) {
      return res.status(400).json({ message: "Skills not more than" });
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.json({ message: "User updated suceffully", user });
  } catch (error) {
    res.status(400).json({ message: "something went wrong: " + error.message });
  }
});

connectDB()
  .then(() => {
    console.log("Database connected Sucessfully");

    app.listen(4000, () => {
      console.log("server sucessfully running on the port 4000");
    });
  })
  .catch((error) => {
    console.log("Database not connected Sucessfully" + error.message);
  });
