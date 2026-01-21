import express from "express";
import {
  performanceDistribution,
  subjectPassFail,
  subjectAverage,
  termComparison,
  reportSubjectAvg,
  reportTermAvg,
} from "./chart.controller.js";

const router = express.Router();

router.get("/performance-distribution", performanceDistribution);
router.get("/subject-pass-fail", subjectPassFail);
router.get("/subject-average", subjectAverage);
router.get("/term-comparison", termComparison);
router.get("/report-subject-avg", reportSubjectAvg);
router.get("/report-term-avg", reportTermAvg);

export default router;
