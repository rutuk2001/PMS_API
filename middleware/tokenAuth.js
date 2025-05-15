const jwt = require("jsonwebtoken");

const jWtAuth = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      console.log("Invalid authorization called");
      return res.status(401).json({ Message: "Unauthorized, token missing" });
    }

    if (!token.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ Message: "Unauthorized, incorrect token format" });
    }

    const jwtToken = token.split(" ")[1];

    const decodedToken = jwt.verify(jwtToken, process.env.SECRET);

    req.user = decodedToken;

    next();
  } catch (err) {
    console.log("Error", err);
    return res.status(401).json({ Message: "Unauthorized, invalid token" });
  }
};

module.exports = { jWtAuth };
