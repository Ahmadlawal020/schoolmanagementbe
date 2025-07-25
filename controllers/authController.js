// const User = require("../models/userSchema");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const ACCESS_TOKEN_EXPIRES_IN = "15m";
// const REFRESH_TOKEN_EXPIRES_IN = "1d";

// const cookieOptions = {
//   httpOnly: true,
//   secure: true,
//   sameSite: "None",
//   maxAge: 24 * 60 * 60 * 1000, // 1 day
// };

// // LOGIN
// const handleLogin = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;

//     // Validate input
//     if (!email || !password || !role) {
//       return res.status(400).json({
//         message: "Email, password, and role are required.",
//       });
//     }

//     // Check for user existence
//     const user = await User.findOne({ email }).select(
//       "+password +refreshToken"
//     );
//     if (!user) {
//       return res
//         .status(404)
//         .json({ message: "No account found with this email." });
//     }

//     // Convert stored role(s) to array for consistency
//     const roles = Array.isArray(user.role) ? user.role : [user.role];

//     // Check if the provided role is allowed
//     if (!roles.includes(role)) {
//       return res.status(403).json({
//         message: `Access denied. You do not have ${role} access.`,
//       });
//     }

//     // Compare password
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(401).json({ message: "Incorrect password." });
//     }

//     const { firstName, lastName, _id: id } = user;

//     // Generate access token
//     const accessToken = jwt.sign(
//       {
//         UserInfo: {
//           id,
//           email,
//           roles,
//           firstName,
//           lastName,
//         },
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
//     );

//     // Generate refresh token
//     const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
//       expiresIn: REFRESH_TOKEN_EXPIRES_IN,
//     });

//     // Save refresh token in DB
//     user.refreshToken = refreshToken;
//     await user.save();

//     // Send cookie and response
//     res.cookie("jwt", refreshToken, cookieOptions);
//     res.json({ id, roles, accessToken });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // LOGOUT
// const handleLogout = async (req, res) => {
//   try {
//     const cookies = req.cookies;
//     if (!cookies?.jwt) return res.sendStatus(204);

//     const refreshToken = cookies.jwt;
//     const user = await User.findOne({ refreshToken });

//     if (!user) {
//       res.clearCookie("jwt", cookieOptions);
//       return res.sendStatus(204);
//     }

//     user.refreshToken = "";
//     await user.save();

//     res.clearCookie("jwt", cookieOptions);
//     res.sendStatus(204);
//   } catch (err) {
//     console.error("Logout Error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // REFRESH TOKEN
// const handleRefreshToken = async (req, res) => {
//   try {
//     const cookies = req.cookies;
//     if (!cookies?.jwt) return res.sendStatus(401);

//     const refreshToken = cookies.jwt;
//     const user = await User.findOne({ refreshToken });

//     if (!user) return res.sendStatus(403);

//     jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET,
//       (err, decoded) => {
//         if (err || user.email !== decoded.email) return res.sendStatus(403);

//         const { firstName, lastName, role, _id: id } = user;
//         const roles = Array.isArray(role) ? role : [role];

//         const accessToken = jwt.sign(
//           {
//             UserInfo: {
//               id,
//               email: user.email,
//               roles,
//               firstName,
//               lastName,
//             },
//           },
//           process.env.ACCESS_TOKEN_SECRET,
//           { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
//         );

//         res.json({ id, roles, accessToken });
//       }
//     );
//   } catch (err) {
//     console.error("Refresh Token Error:", err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// module.exports = {
//   handleLogin,
//   handleLogout,
//   handleRefreshToken,
// };

const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "1d";

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// LOGIN
const handleLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "Email, password, and role are required.",
      });
    }

    // Check for user existence
    const user = await User.findOne({ email }).select(
      "+password +refreshToken"
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    // Convert stored role(s) to array
    const roles = Array.isArray(user.role) ? user.role : [user.role];

    // Check role access
    if (!roles.includes(role)) {
      return res.status(403).json({
        message: `Access denied. You do not have ${role} access.`,
      });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const { firstName, lastName, _id: id } = user;

    // Create access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id,
          email,
          roles,
          firstName,
          lastName,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    // Create refresh token
    const refreshToken = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Send refresh token in cookie & access token in response
    res.cookie("jwt", refreshToken, cookieOptions);
    res.json({ id, roles, accessToken });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGOUT
const handleLogout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(204).json({ message: "No content." }); // No token
    }

    const refreshToken = cookies.jwt;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      res.clearCookie("jwt", cookieOptions);
      return res
        .status(204)
        .json({ message: "Token not found. Cleared cookie." });
    }

    user.refreshToken = "";
    await user.save();

    res.clearCookie("jwt", cookieOptions);
    res.status(204).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// REFRESH TOKEN
const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    const refreshToken = cookies.jwt;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res
        .status(403)
        .json({ message: "Forbidden: invalid refresh token." });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || user.email !== decoded.email) {
          return res
            .status(403)
            .json({ message: "Token verification failed." });
        }

        const { firstName, lastName, role, _id: id } = user;
        const roles = Array.isArray(role) ? role : [role];

        const accessToken = jwt.sign(
          {
            UserInfo: {
              id,
              email: user.email,
              roles,
              firstName,
              lastName,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
        );

        res.json({ id, roles, accessToken });
      }
    );
  } catch (err) {
    console.error("Refresh Token Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  handleLogin,
  handleLogout,
  handleRefreshToken,
};
