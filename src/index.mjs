import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { users } from "./utils/users.mjs";
import passport from "passport";
import "./strategies/discord-strategy.mjs";
// import "./strategies/local-strategy.mjs";
import mongoose from "mongoose";
import { User } from "./mongoose/schemas/user.mjs";
import {createUserValidationSchema} from "./utils/validationSchemas.mjs"
import {checkSchema, validationResult, query, matchedData} from "express-validator";
import { hashPassword } from "./utils/hashpass.mjs";
import MongoStore from "connect-mongo";

const app = express();

mongoose.connect("mongodb://localhost:27017/Express_Lesson")
    .then(() => {
        console.log("Connected to MongoDB...");
    }) .catch ((err) => {
        console.log(err, "Error to connect MongoDB");
    })


const PORT = process.env.PORT || 3000;

app.use(express.json());

//for store cookies and session
app.use(cookieParser("Hello Cookie"));
app.use(
    session({
        secret: 'you are on illusion',
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000 * 60,
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
        }),
    })
);

//initialized Passport
app.use(passport.initialize());
app.use(passport.session());

//default url to store session cookies and if its working or not checking
app.get('/', (req, res) => {
    console.log(req.session.id);
    req.session.visited = true;
    res.cookie("hello", "cookie", { maxAge: 30000, signed: true });
    res.status(201).send({ msg: "working!!" })
});


// //post method to authenticate user session
// app.post('/api/auth', (req, res) => {
//     const {
//         body: { userName, password },

//     } = req;

//     const findUser = users.find((user) => user.userName === userName);
//     // if(!findUser) return res.status(401).send( { msg: "Bad Credential" } );
//     if(!findUser || findUser.password !== password) return res.status(401).send( { msg: "Bad Credential" } );
//     req.session.user = findUser;
//     return res.status(200).send(findUser);
// });


// //get method to see that authenticate user session
// app.get('/api/auth/status', (req,res) => {
//     req.sessionStore.get(req.sessionID, (err, session) =>{
//         console.log(session);
//     })

//     return req.session.user  
//     ? res.status(201).send(req.session.user)
//     : res.status(401).send({ msg: "Not Authenticate" });
// })

// //post method to add cart item for that session user
app.post('/api/cart', (req,res) => {
    if(!req.session.user) return res.sendStatus(401);
    const {body: item} = req;
    const {cart} = req.session;
    if(cart){
        cart.push(item)
    } else{
        req.session.cart = [item];
    }
    return res.status(201).send(item);
});


// //get method view cart item for that session user
app.get('/api/cart', (req,res) => {
    if(!req.session.user) return res.sendStatus(401);
    return res.send(req.session.cart ?? []);
});


// passport.js authentication
app.post('/api/auth', passport.authenticate("local"), (req, res) => {
    res.sendStatus(200);
});

app.get('/api/auth/status', (req, res) => {
    console.log("inside /auth/status endpoint");
    console.log(req.user);
    return req.user ? res.send(req.user) : res.sendStatus(401);
})

//Logout from the session
app.post('/api/auth/logout', (req, res) => {
    if (!req.user) return res.sendStatus(401);
    req.logout((err) => {
        if (err) return res.sendStatus(400);
        res.send(200);
    })
})


//Connected to mongodb
app.post('/api/users', checkSchema(createUserValidationSchema), async (req,res) =>{
    const result = validationResult(req);
    if(!result.isEmpty()) return res.status(401).send(result.array());
    
    const data = matchedData(req);
    data.password = hashPassword(data.password);
    const newUser = new User(data);
    try{
        const saveUser = await newUser.save();
        return res.status(201).send(saveUser);
    } catch(err) {
        console.log(err);
        return res.sendStatus(401)
        
    }
});

app.get("/api/auth/discord", passport.authenticate("discord"));
app.get("/api/auth/discord/redirect", passport.authenticate("discord"), (req, res) => {
    res.sendStatus(201);
});

//running the server on localhost 3000
app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
})
