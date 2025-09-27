import "dotenv/config"; // kraća forma za dotenv
import express from "express";
import cors from "cors";
import db from "./db/models"; // <-- .js ekstenzija
const { sequelize } = db as any;
import documentsRoute from "./routes/documentsRoute";
//import authRoutes from './routes/auth.routes.js';
//import taskRoutes from './routes/task.routes.js';

const app = express();
app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/documents", documentsRoute);
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
