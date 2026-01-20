import jwt from "jsonwebtoken";

export const generateJWTToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_EXPIRES_IN}`
    })

    // Determine if we're in production - check for production indicators
    // Render sets NODE_ENV=production, or we can check for the Render domain
    const isProduction = process.env.NODE_ENV === "production" || 
                        process.env.RENDER === "true" ||
                        process.env.DEPLOYED === "true";

    res.cookie('jwt', token, {
        httpOnly: true,   //prevents xss attacks cross-sitescripting attacks 
        maxAge: parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000, //millisec
        sameSite: isProduction ? "none" : "lax", // Use "none" for cross-origin (production), "lax" for local development
        secure: isProduction, // Must be true for cross-origin cookies
    })
    return token
}
