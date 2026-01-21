import StudentMarks from "../../models/StudentMarks.model.js";
import { Sequelize } from "sequelize";

const buildWhere = (query) => {
  const where = {};
  if (query.class_number && query.class_number !== "ALL") {
    where.class_number = query.class_number;
  }
  if (query.batch && query.batch !== "ALL") {
    where.batch = query.batch;
  }
  return where;
};

export const getTopStudentsOverall = async (query) => {
  const where = buildWhere(query);

  const rows = await StudentMarks.findAll({
    attributes: [
      "admission_no",
      "student_name",
      [Sequelize.literal("AVG(scored_mark / max_mark) * 100"), "avg_marks"],
    ],
    where,
    group: ["admission_no", "student_name"],
    order: [[Sequelize.literal("avg_marks"), "DESC"]],
    limit: 5,
  });

  return rows.map((r, i) => ({
    rank: i + 1,
    admission_no: r.admission_no,
    student_name: r.student_name,
    avg_marks: Number(r.dataValues.avg_marks).toFixed(2),
  }));
};

export const getTopStudentsSubject = async (query) => {
  const where = {};
  if (query.class_number && query.class_number !== "ALL") {
    where.class_number = query.class_number;
  }
  if (query.batch && query.batch !== "ALL") {
    where.batch = query.batch;
  }

  const rows = await StudentMarks.findAll({
    attributes: [
      "subject",
      "student_name",
      "class_number",
      "batch",
      [Sequelize.fn("SUM", Sequelize.col("scored_mark")), "total_marks"],
      [
        Sequelize.literal("ROUND(AVG(scored_mark / max_mark) * 100, 2)"),
        "avg_score",
      ],
    ],
    where,
    group: ["subject", "student_name", "class_number", "batch"],
    order: [
      ["subject", "ASC"],
      [Sequelize.literal("avg_score"), "DESC"],
    ],
    raw: true,
  });

  const ranked = {};
  const finalData = [];

  rows.forEach((r) => {
    if (!ranked[r.subject]) ranked[r.subject] = 1;

    finalData.push({
      rank: ranked[r.subject]++,
      subject: r.subject,
      student_name: r.student_name,
      total_marks: r.total_marks,
      avg_score: r.avg_score,
      class_number: r.class_number,
      batch: r.batch,
    });
  });

  return finalData.slice(0, 5);
};

export const getLeaderboard = async () => {
  const rows = await StudentMarks.findAll({
    attributes: [
      "student_name",
      "class_number",
      "batch",
      [
        Sequelize.literal("ROUND(AVG(scored_mark / max_mark) * 100, 2)"),
        "percentage",
      ],
    ],
    group: ["student_name", "class_number", "batch"],
    order: [[Sequelize.literal("percentage"), "DESC"]],
    raw: true,
  });

  return rows.slice(0, 5).map((r, index) => ({
    rank: index + 1,
    student_name: r.student_name,
    class_number: r.class_number,
    batch: r.batch,
    percentage: r.percentage,
  }));
};
