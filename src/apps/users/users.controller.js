import { createUserDetailsService } from "./users.service.js";

export async function createUsersDetails(req, res) {
  console.log("📦 Received request to create user:", req.body); // ADD THIS
  try {
    const {
      name, // This is fullname
      gender = "M",
      class: studentClass,
      division,
      academic_year,
      subjects = [],
      email,
      password,
      parent_name,
      parent_email
    } = req.body;


    // Validation
    if (!name || !studentClass || !division || !academic_year) {
      return res.status(400).json({
        error: "Name, Class, Division, and Academic Year are required"
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        error: "Select at least one subject"
      });
    }

    // Validate academic year format
    const yearRegex = /^\d{4}-\d{2}$/;
    if (!yearRegex.test(academic_year)) {
      return res.status(400).json({
        error: "Academic Year format: YYYY-YY (e.g., 2024-25)"
      });
    }

    const studentData = await createUserDetailsService({
      name, // Passed as 'name' to service
      gender,
      class: studentClass,
      division,
      academic_year,
      subjects,
      email,
      password,
      parent_name,
      parent_email
    });

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      student: studentData
    });

  } catch (err) {
    console.error("Create user error:", err.message);

    if (err.message.includes('already') || err.message.includes('exists')) {
      return res.status(409).json({ error: err.message });
    }

    res.status(500).json({
      error: "Failed to create student",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}