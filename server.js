import express from "express";
import cors from "cors";
import sequelize from "./src/config/db.js";
import routes from "./src/routes/index.js";


const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});




app.use("/api", routes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    // await sequelize.sync({ alter: true });

    app.listen(4000, () => {
      console.log("Server running on http://localhost:4000");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

startServer();
