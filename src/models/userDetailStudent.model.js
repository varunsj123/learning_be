import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import UsersDetails from "./UsersDetails.model.js";

const UserDetailStudent = sequelize.define(
  "users_student",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    student_id: { // ADDED: Foreign key to users_details.id
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: UsersDetails,
        key: "id"
      },
      onDelete: 'CASCADE'
    },
    usercode: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: UsersDetails,
        key: "usercode"
      },
      onDelete: 'CASCADE'
    },
    admission_no: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false
    },
    division: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subjects: {
      type: DataTypes.JSON, // Array of objects
      allowNull: false,
      defaultValue: []
    },
    parent_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parent_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: "users_student",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

/* Auto-generate admission_no: ADM0001 format */
UserDetailStudent.beforeValidate(async (student) => {
  if (!student.admission_no) {
    const lastStudent = await UserDetailStudent.findOne({
      order: [["id", "DESC"]],
    });
    const nextId = lastStudent ? parseInt(lastStudent.admission_no.replace('ADM', '')) + 1 : 1;
    student.admission_no = `ADM${String(nextId).padStart(4, "0")}`;
  }
});

export default UserDetailStudent;