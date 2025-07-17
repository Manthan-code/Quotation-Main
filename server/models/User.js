const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["Admin", "Client", "Purchase", "Site Engineer"], default: "Client" },
    avatar: { type: String, default: "" }, // URL to avatar image
  },
  { timestamps: true }
);

/* hash password before every save */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


/* helper to check pw on login */
userSchema.methods.comparePw = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = model("User", userSchema);
