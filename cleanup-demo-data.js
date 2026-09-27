require("dotenv").config();
const mongoose = require("mongoose");
const Event = require("./models/Event").default || require("./models/Event");
const SwapRequest = require("./models/SwapRequest").default || require("./models/SwapRequest");
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const eventResult = await Event.deleteMany({});
  const requestResult = await SwapRequest.deleteMany({});
  console.log("Deleted Events:", eventResult.deletedCount);
  console.log("Deleted SwapRequests:", requestResult.deletedCount);
  await mongoose.disconnect();
})().catch((err) => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});