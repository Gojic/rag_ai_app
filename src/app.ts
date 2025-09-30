import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db/models"; // <-- .js ekstenzija
const { sequelize } = db as any;
import documentsRoute from "./routes/documentsRoute";
import collectionsRoute from "./routes/collectionsRoute";
import attachOrg from "./middleware/org";
const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use(attachOrg);
app.use("/documents", documentsRoute);
app.use("/collections", collectionsRoute);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1);
  }
})();
