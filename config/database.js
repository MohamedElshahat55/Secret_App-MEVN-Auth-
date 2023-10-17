const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose
    .connect(process.env.DATABASE_URL)
    .then((conn) =>
      console.log(`DATABASE CONNECTED 💪:${conn.connection.host}`)
    )
    .catch((err) => {
      console.log(`DATABASE ERROR ❌ ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
