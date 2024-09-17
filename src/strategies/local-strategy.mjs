import passport from "passport";
import { Strategy } from "passport-local";
import { users } from "../utils/users.mjs";
import mongoose from "mongoose"
import {User} from "../mongoose/schemas/user.mjs"
import { comparePassword } from "../utils/hashpass.mjs";

passport.serializeUser((user, done) =>{
    console.log("serializeUser");
    console.log(user);
    
    done(null, user.id);
})

passport.deserializeUser( async (id, done) =>{
    console.log("deserializeUser");
    console.log(`deserializeUser id ${id}`);
    try{
        const findUser = await User.findById(id);
        if(!findUser) throw new Error("User Not found!!!");
        done(null, findUser);
    }catch (err){
        done(err, null);
    }
});

export default passport.use(
    new Strategy( async (userName, password, done) => {
        try {
            const findUser = await User.findOne({userName});
            if(!findUser) throw new Error("User not Found !!!");
            if(!comparePassword(password, findUser.password) ) throw new Error("Password not Found !!!");
            done(null, findUser);
        }
        catch (err) {
            done(err, null);
        }
    })
);