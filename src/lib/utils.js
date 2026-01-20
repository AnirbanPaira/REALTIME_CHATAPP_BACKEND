import jwt from "jsonwebtoken";

export const generateJWTToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: `${process.env.JWT_EXPIRES_IN}`
    })

    res.cookie('jwt', token, {
        httpOnly: true,   //prevents xss attacks cross-sitescripting attacks 
        maxAge: parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000, //millisec
        sameSite: "strict", // CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV != "development"
    })
    return token
}
