declare module "./models" {
  import type { Sequelize } from "sequelize";
  const sequelize: Sequelize;
  const SequelizeNS: typeof import("sequelize");
  const db: any;
  export { sequelize, SequelizeNS as Sequelize };
  export default db;
}
