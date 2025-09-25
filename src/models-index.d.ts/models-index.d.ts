// Tipovi za ./models/index.js (Sequelize CLI index)
declare module "./models/index.js" {
  import type { Sequelize } from "sequelize";
  const sequelize: Sequelize;
  const SequelizeNS: typeof import("sequelize");
  const db: any; // { sequelize, Sequelize, ...svi modeli }
  export { sequelize, SequelizeNS as Sequelize };
  export default db;
}
