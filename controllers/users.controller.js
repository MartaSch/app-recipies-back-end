import express from 'express';
import jwt from 'jsonwebtoken';
import gravatar from 'gravatar';
import User from '../models/users.models.js';
import path from 'path';
import fs from 'fs/promises';
import { Jimp } from 'jimp';
import multer from 'multer';
import optimizeImage from "../helpers/optimizeImage.js";
import dotenv from 'dotenv';
dotenv.config();
const secret = process.env.JWT_SECRET

const avatarDir = path.join(process.cwd(), '../public/avatars');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.body.email}-${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024},
});

const signUp = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();

    if(user) {
        return res.status(409).json({
            status: 'conflict',
            code: 409,
            message: 'Email in use',
        });
    }
    try {
        const newUser = new User({
            email,
            password,
        });
        newUser.setPassword(password);

        if(req.file) {
            await optimizeImage(req.file.path);
            newUser.avatarURL = `../public/avatars/${req.file.filename}`;
        } else {
            newUser.avatarURL = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
        }

        await newUser.save();

        return res.status(201).json({
            status: 'Created',
            code: 201,
            ResponseBody: {
                user: {
                    email: email,
                    avatarURL: newUser.avatarURL,
                    subscription: 'starter',
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

const uploadAvatar = upload.single('avatar');

const logIn = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if(!user || !user.validPassword(password)) {
        return res.status(400).json({
            status: 'Bad request',
            code: 400,
            message: 'Incorrect login or password',
        });
    }
    const payload = {
        id: user.id,
    }
    const token = jwt.sign(payload, secret, { expiresIn: '1h' })
    return res.json({
        status: 'success',
        code: 200,
        data: {
            id: user._id,
            email: email,
            token,
        }
    })
}

const logOut = async (req, res, next) => {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, { token: null });

    if(!user) {
        return res.status(401).json({
            status: 'Unauthorized',
            code: 401,
            message: 'Not authorized',
        })
    }
    res.status(204).json({
        status: 'No content',
        code: 204,
        message: 'Logged out',
    })
}

const currentUser = async (req, res) => {
    const { _id, email } = req.user;
    const user = await User.findById(_id)
    if(!user) {
        return res.status(401).json({
            status: 'Unauthorized',
            code: 401,
            message: 'Unauthorized',
        })
    }
    restart.status(200).json({
        status: 'OK',
        code: 200,
        ResponseBody: {
            email: email,
            subscription: 'starter',
        }
    })
}

export default {
    signUp,
    logIn,
    logOut,
    currentUser,
    uploadAvatar,
}