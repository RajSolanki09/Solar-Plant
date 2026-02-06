
const express = require("express");
const connectDB = require("./config/database");
const adminRouter = require("./routes/admin.routes");
const authRouter = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 8000;
require("dotenv").config();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Solar Plant Management System API");
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});