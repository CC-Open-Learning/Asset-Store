import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true
    },
    googleId: {
      sparse: true, // Ensures that the unique constraint only applies to documents where googleId is present. Documents without a googleId will not be included in this unique constraint check
      type: String,
      unique: true
    },
    hash: { type: String },
    picture: { default: "default", type: String },
    refreshToken: {
      default: null,
      type: String
    },
    role: {
      default: "user",
      enum: ["user", "admin"],
      type: String
    },
    salt: { type: String },
    username: { required: true, type: String, unique: true }
  },
  { collection: "User", strict: false, timestamps: true }
);

const userModel = model("User", UserSchema);
export { userModel, UserSchema };
