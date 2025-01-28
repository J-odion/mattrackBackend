import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const users = [
  {
    id: 1,
    email: "admin@example.com",
    password: bcrypt.hashSync("password123", 10), // Example hashed password
    role: "admin",
  },
  {
    id: 2,
    email: "user@example.com",
    password: bcrypt.hashSync("userpassword", 10),
    role: "viewer",
  },
];

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    // Validate the input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    try {
      // Check if the user exists
      const user = users.find((u) => u.email === email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Verify the password
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key", // Use an environment variable for the secret
        { expiresIn: "1h" }
      );

      // Send the token and user info back to the client
      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}
