import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

import usersRouter from "./routes/users.routes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
import "./config/config-passport.js";
app.use('/api', usersRouter);

app.use((err,_,res,__) => {
    console.log(err.stack);
    res.status(500).json({
        status: 'fail',
        code: 500,
        message: err.message,
        data: 'Internal Server Error',
    });
});

const PORT = process.env.PORT || 3000;
const uriDB = process.env.DATABASE_URL
const connection = mongoose.connect(uriDB, {
    dbName: 'Users',
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

connection.then(() => {
    console.log('Database connection succesful');
    app.listen(PORT, () => {
        console.log(`Server running. Use our API on port: ${PORT}`)
    });
})
.catch((err) => {
    console.log(`Error while establishing connection: [${err}]`)
    process.exit(1)
});


