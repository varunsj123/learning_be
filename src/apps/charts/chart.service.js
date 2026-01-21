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

export const getPerformanceDistribution = async (query) => {
  const where = buildWhere(query);

  const rows = await StudentMarks.findAll({
    attributes: [
      "admission_no",
      [Sequelize.literal("AVG(scored_mark / max_mark) * 100"), "percentage"],
    ],
    where,
    group: ["admission_no"],
  });

  const ranges = { "90-100": 0, "75-89": 0, "50-74": 0, "<50": 0 };

  rows.forEach((r) => {
    const p = Number(r.dataValues.percentage);
    if (p >= 90) ranges["90-100"]++;
    else if (p >= 75) ranges["75-89"]++;
    else if (p >= 50) ranges["50-74"]++;
    else ranges["<50"]++;
  });

  return Object.entries(ranges).map(([subject, avg_score]) => ({
    subject,
    avg_score,
  }));
};

export const getSubjectPassFail = async (query) => {
  const where = buildWhere(query);

  const rows = await StudentMarks.findAll({
    attributes: [
      "subject",
      [
        Sequelize.fn(
          "SUM",
          Sequelize.literal(
            "CASE WHEN (scored_mark / max_mark) * 100 >= 40 THEN 1 ELSE 0 END"
          )
        ),
        "pass",
      ],
      [
        Sequelize.fn(
          "SUM",
          Sequelize.literal(
            "CASE WHEN (scored_mark / max_mark) * 100 < 40 THEN 1 ELSE 0 END"
          )
        ),
        "fail",
      ],
    ],
    where,
    group: ["subject"],
  });

  return rows.flatMap((r) => [
    { subject: r.subject, term: "Pass", avg_score: r.dataValues.pass },
    { subject: r.subject, term: "Fail", avg_score: r.dataValues.fail },
  ]);
};

export const getSubjectAverage = async (query) => {
  const where = buildWhere(query);

  const rows = await StudentMarks.findAll({
    attributes: [
      "subject",
      [Sequelize.literal("AVG(scored_mark / max_mark) * 100"), "avg_score"],
    ],
    where,
    group: ["subject"],
  });

  return rows.map((r) => ({
    subject: r.subject,
    avg_score: Number(r.dataValues.avg_score).toFixed(2),
  }));
};

export const getTermComparison = async (query) => {
  const where = buildWhere(query);

  const rows = await StudentMarks.findAll({
    attributes: [
      "subject",
      "term",
      [Sequelize.literal("AVG(scored_mark / max_mark) * 100"), "avg_score"],
    ],
    where,
    group: ["subject", "term"],
  });

  return rows.map((r) => ({
    subject: r.subject,
    term: r.term,
    avg_score: Number(r.dataValues.avg_score).toFixed(2),
  }));
};

export const getReportSubjectAvg = async (query) => {
  const where = buildWhere(query);

  return await StudentMarks.findAll({
    attributes: [
      "subject",
      [Sequelize.literal("AVG(scored_mark / max_mark) * 100"), "avg_score"],
    ],
    where,
    group: ["subject"],
  });
};

export const getReportTermAvg = async (query) => {
  const where = buildWhere(query);

  return await StudentMarks.findAll({
    attributes: [
      "term",
      [Sequelize.literal("AVG(scored_mark / max_mark) * 100"), "avg_score"],
    ],
    where,
    group: ["term"],
  });
};
