import UsersDetails from "../../models/UsersDetails.model.js";
import User from "../../models/User.model.js"

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password required",
      });
    }

    console.log({ email })
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        class: user.class,
        division: user.division,
        academic_year: user.academic_year,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
