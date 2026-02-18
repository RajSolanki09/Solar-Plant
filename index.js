const express = require("express");
const connectDB = require("./config/database");
const adminRouter = require("./routes/admin.routes");
const authRouter = require("./routes/auth.routes");
const solarRouter = require("./routes/solar.routes");
const sprinklerRouter = require("./routes/sprinkler.routes");
const followupRouter = require("./routes/followup.routes");
const serviceRouter = require("./routes/service.routes");

const app = express();
const PORT = process.env.PORT || 8000;
require("dotenv").config();


app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/solar", solarRouter);
app.use("/api/sprinkler", sprinklerRouter);
app.use("/api/followup", followupRouter);
app.use("/api/service", serviceRouter);


app.get("/", (req, res) => {
  res.send("Solar Plant Management System API");
});


app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
});
