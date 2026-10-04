require('dotenv').config();
const express = require('express');
const cors = require("cors")
const app = express();


const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
const { connectRedis } = require("./config/redis")


const userRouter = require("./routes/User")
const lodgeOwnerRouter = require("./routes/lodgeOwner")
const adminRouter = require("./routes/admin");
const bookingRouter = require("./routes/booking")

app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/user", userRouter);
app.use("/api/owner", lodgeOwnerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/booking", bookingRouter)

mongoose.connect(process.env.MONGO_URL).then(() => console.log("Database connected successfully")).catch((err) => console.log("Databse connection failed", err));
const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();