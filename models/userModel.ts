import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";

const emailRegePattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  age: number;
  sex: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  address: string;
  pincode: string;
  specificProblem: string;
  role: string;
  // previousDoctorBookings: Schema.Types.ObjectId[];
  isVerified: boolean;
  comparePassword(password: string): Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Your name cannot exceed 30 characters"],
      minLength: [4, "Your name must be at least 4 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: {
        validator: function (email: string): boolean {
          return emailRegePattern.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [5, "Your password must be longer than 6 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
    age: {
      type: Number,
    },
    sex: {
      type: String,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /\d{10}/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
      // required: [true, "User phone number required"],
    },
    alternativePhoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /\d{10}/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
      // required: [false, "User alternative phone number is not required"],
    },
    address: {
      type: String,
    },
    pincode: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /\d{6}/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid pincode!`,
      },
      // required: [true, "User pincode is required"],
    },
    specificProblem: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

//hash password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

//sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.ACCESS_TOKEN || ("" as string),
    {
      expiresIn: "5m",
    }
  );
};
// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN || ("" as string),
    {
      expiresIn: "3d",
    }
  );
};
const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
