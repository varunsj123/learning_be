import StudentMarks from "../../models/StudentMarks.model.js";
import { Sequelize } from "sequelize";

export const getBatches = async (class_number) => {
  const where = {};
  if (class_number) {
    where.class_number = Number(class_number);
  }

  const rows = await StudentMarks.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("batch")), "batch"]],
    where,
    raw: true,
  });

  return rows.map((r) => r.batch);
};

export const getClasses = async () => {
  const rows = await StudentMarks.findAll({
    attributes: [
      [Sequelize.fn("DISTINCT", Sequelize.col("class_number")), "class_number"],
    ],
    order: [[Sequelize.col("class_number"), "ASC"]],
    raw: true,
  });

  return rows.map((r) => r.class_number);
};
