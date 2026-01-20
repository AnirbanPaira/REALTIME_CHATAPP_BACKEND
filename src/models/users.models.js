import mongoose from 'mongoose';

const userScheam = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    profilePic:{
        type:String,
        default:""
    }
},
{
    timestamps:true
}
)

//exporting the model
const User = mongoose.model('User',userScheam);
export default User;