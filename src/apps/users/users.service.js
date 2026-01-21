import sequelize from "../../config/db.js";
import UsersDetails from "../../models/UsersDetails.model.js";
import UserDetailStudent from "../../models/userDetailStudent.model.js";
import Student from "../../models/Student.model.js";

export async function createUserDetailsService(payload) {
  console.log("🔧 createUserDetailsService called with:", payload);
  
  const transaction = await sequelize.transaction();
  console.log("📊 Transaction started");

  try {
    const {
      name,
      email,
      password,
      gender = "M",
      class: studentClass,
      division,
      subjects = [],
      parent_name,
      parent_email,
      academic_year
    } = payload;

    console.log("👤 Creating user in users_details table...");
    
    // 1. Create in users_details table
    const user = await UsersDetails.create(
      {
        name: name.trim(),
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@school.com`,
        password: password || "default@123",
        gender,
        role: "student"
      },
      { transaction }
    );

    console.log("✅ User created in users_details:", user.usercode, "ID:", user.id);

    const { usercode, id: userId } = user;

    // 2. Generate admission_no
    const lastStudentRecord = await UserDetailStudent.findOne({
      order: [["id", "DESC"]],
      transaction
    });
    console.log("📝 Last student record:", lastStudentRecord?.admission_no);
    
    const lastAdmissionNo = lastStudentRecord?.admission_no;
    const nextAdmissionId = lastAdmissionNo ? parseInt(lastAdmissionNo.replace('ADM', '')) + 1 : 1;
    const admission_no = `ADM${String(nextAdmissionId).padStart(4, "0")}`;
    console.log("🎫 Generated admission_no:", admission_no);

    // 3. Create in users_student table with student_id
    console.log("📚 Creating record in users_student table...");
    const studentDetail = await UserDetailStudent.create(
      {
        student_id: userId,
        usercode,
        admission_no,
        class: studentClass,
        division,
        subjects: Array.isArray(subjects) ? subjects.map(subject => ({ name: subject })) : [],
        parent_name: parent_name?.trim() || null,
        parent_email: parent_email?.trim() || null,
        academic_year
      },
      { transaction }
    );

    console.log("✅ Student detail created in users_student:", studentDetail.id);

    // 4. 🚨 FIXED: Create in your EXISTING students table
    console.log("📋 Creating in existing students table...");
    await Student.create({
      admission_no,
      student_name: name.trim(), // ✅ CORRECT: Use 'student_name' not 'name'
      gender,
      class: studentClass,
      division,
      academic_year
    }, { transaction });

    console.log("✅ Created in existing students table");

    await transaction.commit();
    console.log("✅ Transaction committed successfully");
    
    return {
      usercode,
      admission_no,
      name: user.name,
      email: user.email,
      gender: user.gender,
      class: studentClass,
      division,
      subjects: Array.isArray(subjects) ? subjects : [],
      parent_name: parent_name?.trim() || null,
      parent_email: parent_email?.trim() || null,
      academic_year
    };

  } catch (error) {
    console.error("❌ Error in createUserDetailsService:", error.message);
    console.error("❌ Error stack:", error.stack);
    await transaction.rollback();
    console.log("↩️ Transaction rolled back");
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error("❌ Unique constraint error:", error.errors);
      if (error.errors[0].path === 'email') {
        throw new Error('Email already registered');
      } else if (error.errors[0].path === 'admission_no') {
        throw new Error('Admission number already exists');
      } else if (error.errors[0].path === 'usercode') {
        throw new Error('User code conflict. Please try again.');
      }
    }
    
    throw error;
  }
}