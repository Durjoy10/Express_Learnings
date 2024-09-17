import  mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,  
        required: true,
        unique: true,
    },
    displayName: {
        type: String,  
    },
    password: {
        type: String,  
        required: true,
    }
});


export const User = mongoose.model('User', UserSchema);
