require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const authRoutes = require("./routes/authRoutes");
const PORT       = process.env.PORT || 5000;

const productRoutes = require('./routes/productRoutes');
const glassRoutes = require('./routes/glassRoutes');
const hsnRoutes = require('./routes/hsnRoutes');
const lockRoutes         = require('./routes/lockRoutes');
const productGroupRoutes = require('./routes/productGroupRoutes');
const productTypeRoutes  = require('./routes/productTypeRoutes');
const projectRoutes      = require('./routes/projectRoutes');
const unitRoutes      = require('./routes/unitRoutes');
const aluminiumRoutes = require('./routes/aluminiumRoutes');
const hardwareRoutes = require('./routes/hardwareRoutes');
const finishRoutes = require('./routes/finishRoutes');
const quotationEditorRoutes = require('./routes/quotationEditorRoutes');
const MTO = require('./routes/mtoRoutes');
const app = express();

/* ── global middleware ────────────────────────── */
app.use(express.json());

app.use(cors());

/* ── connect DB then mount routes ─────────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");

    // auth routes
    app.use("/api/auth", authRoutes);

    // other routes
    app.use('/api/products', productRoutes);
    app.use('/api/glass', glassRoutes);
    app.use('/api/hsn', hsnRoutes);
    app.use('/api/locks',lockRoutes);
    app.use('/api/product-groups',productGroupRoutes);
    app.use('/api/product-types',productTypeRoutes);
    app.use('/api/projects',projectRoutes);
    app.use('/api/unit',      unitRoutes);
    app.use('/api/aluminium',aluminiumRoutes);
    app.use('/api/hardware',hardwareRoutes);
    app.use('/api/finish', finishRoutes);
    app.use('/api/quotationEditor', quotationEditorRoutes);
    app.use('/api/mto',MTO);

    // health check
    app.get("/", (_req, res) => res.send("API up ✅"));
    app.get("/test", (req, res) => {
  res.send("Test route working ✅");
});
    app.listen(PORT, () =>
      console.log(`🚀  Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("DB connection error:", err.message);
    process.exit(1);
  });
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    console.error("❌ Bad JSON:", err.message);
    return res.status(400).json({ msg: "Invalid JSON" });
  }
  next();
});