const jwt   = require("jsonwebtoken");
const User  = require("../models/User");
const bcrypt = require("bcryptjs");

const signToken = (id, name, email, role, avatar) =>
  jwt.sign({ id, name, email, role , avatar }, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ───────── Sign‑up ───────── */
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

   
    const user  = await User.create({ name, email, password, role: "Client" });

    const token = signToken(user._id, user.name, user.email, user.role , user.avatar);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role ,avatar: user.avatar || null,},
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ───────── Login ───────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required" });
      
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    const token = signToken(user._id, user.name, user.email, user.role, user.avatar);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null,},
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ───────── Logout (semantic) ───────── */
exports.logout = (_req, res) => {
  res.json({ msg: "Logged out (client must delete token)" });
};

/* ───────── Update profile ───────── */
exports.updateProfile = async (req, res) => {
  try {
    console.log("REQ FILE:", req.file);  // <-- log Cloudinary response
    console.log("REQ BODY:", req.body);

    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.file?.path) updateFields.avatar = req.file.path;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "User not found" });

    res.json({
      msg: "Profile updated",
      user: { id: updated._id, name: updated.name, email: updated.email, avatar: updated.avatar },
    });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);  // <-- print error
    res.status(500).json({ msg: "Internal Server Error" });
  }
};




exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ───────── Change password ───────── */
exports.changePassword = async (req, res) => {
  try {
    const { currentPw, newPw } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    if (!user || !(await user.comparePw(currentPw)))
      return res.status(400).json({ msg: "Current password incorrect" });

    user.password = newPw;
    await user.save();
    res.json({ msg: "Password updated" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/* ───────── Update user role ───────── */
exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["Admin", "Client", "Purchase", "Site Engineer"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  res.status(200).json(user);
};
