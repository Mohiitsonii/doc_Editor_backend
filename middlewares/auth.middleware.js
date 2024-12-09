import jwt from "jsonwebtoken";

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
console.log(token)
        if (!token) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
                console.log
            req.user = decoded;

            next();
        } catch (error) {
            res.status(401).json({ msg: "Token is not valid", error: error.message });
            console.log("Error verifying token:", error);
        }
    } catch (error) {
        res.status(500).json({ msg: "Internal server error" });
        console.log("Unexpected error:", error);
    }
}

export default authenticateToken;