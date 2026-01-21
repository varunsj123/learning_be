import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UsersDetails = sequelize.define(
  "users_details",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usercode: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    name: { // Changed from 'name' to 'fullname'
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true, 
      validate: { isEmail: true } 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    gender: { 
      type: DataTypes.ENUM("M", "F", "O"),
      allowNull: false 
    },
    role: { 
      type: DataTypes.ENUM("student", "teacher"), // Removed 'employee', 'parent'
      allowNull: false 
    },
  },
  {
    tableName: "users_details",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

/* Auto-generate user code: STU-0001 format */
UsersDetails.beforeValidate(async (user) => {
  if (!user.usercode) {
    const prefix = user.role === 'student' ? 'STU-' : 'TEA-';
    const lastUser = await UsersDetails.findOne({
      where: { role: user.role },
      order: [["id", "DESC"]],
    });
    const nextId = lastUser ? parseInt(lastUser.usercode.replace(prefix, '')) + 1 : 1;
    user.usercode = `${prefix}${String(nextId).padStart(4, "0")}`;
  }
});

export default UsersDetails;