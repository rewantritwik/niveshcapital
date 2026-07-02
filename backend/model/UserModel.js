const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  userId: {
    type: String,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

userSchema.pre("save", async function () {
  if (!this.userId) {
    let offset = await mongoose.model("User").countDocuments();
    let generatedId = "NIVESH" + (100 + offset);
    let userExists = await mongoose.model("User").findOne({ userId: generatedId });
    while (userExists) {
      offset++;
      generatedId = "NIVESH" + (100 + offset);
      userExists = await mongoose.model("User").findOne({ userId: generatedId });
    }
    this.userId = generatedId;
  }
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
module.exports.UserModel = UserModel;