import bcrypt from "bcryptjs";
import User from "../models/users.models.js";
import { generateJWTToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
    const { email, fullName, password, profilePic } = req.body;

    try {
        if (!email || !fullName || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be atleast 6 characters' });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(200).send({
                message: 'User already exists',
            })
        }
        //hash password 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create a new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            profilePic
        })

        if (newUser) {
            //generate jwt token 
            generateJWTToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })

        } else {
            res.status(400).send({ message: 'Failed to create user' })
        }


    } catch (error) {
        console.log('Error in siginup', error.message);
        res.status(500).send({ message: 'Internal server error' })

    }
}


export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password' })
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }
        generateJWTToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    } catch (error) {
        console.log('Error in login', error.message);
        res.status(500).send({ message: 'Internal server error' })
    }

}


export const logout = (req, res) => {
    try {
        // Determine if we're in production for consistent cookie settings
        const isProduction = process.env.NODE_ENV === "production" || 
                            process.env.RENDER === "true" ||
                            process.env.DEPLOYED === "true";
        
        res.cookie("jwt", "", {
            httpOnly: true,
            maxAge: 0,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });
        res.status(200).json({
            message: 'Logged out successfully'
        })
    } catch (error) {
        console.log('Error in logout', error.message);
        res.status(500).send({ message: 'Internal server error' })
    }
}


export const updateProfile =async(req,res)=>{
    try{
    const {profilePic} = req.body;
    const userId = req.user._id;
    if(!profilePic){
        return res.status(400).json({message:'Please enter profile pic'})
    }
    const uploadResponse =  await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
    res.status(200).json(updatedUser)
    }catch(error){
        console.log("error in update profile",error);
        res.status(200).json({message:'Internal server error'});
    }
}

export const checkAuth = async(req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
}