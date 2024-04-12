import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  //this is technique in which basically we are trying to get the thing done
  //when .save method will be called on userSchema  we want something to be done before that ,and then this will be used
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
