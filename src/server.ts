import app from "./app";
import db from "./db/models";

const { sequelize } = db as any;

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
