import { Sequelize } from 'sequelize';

const db = new Sequelize('db_penggajian3', 'root', '', {
    host: "localhost",
    dialect: "mysql"
});

db.authenticate()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Connection error:", err));
  
export default db;