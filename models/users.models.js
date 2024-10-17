import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema } = mongoose;

const user = new Schema(
    {
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 6 characters long"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
        },
        subscription: {
            type: String,
            enum: ["starter", "pro", "business"],
            default: "starter",
        },
        token: {
            type: String,
            default: null,
        },
        avatarURL: {
            type: String,
            default: 'default-avatar-url',
        }
    },
    {
        timestamps: true,
    }
);

user.methods.setPassword = function(password) {
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8))
};

user.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

user.pre('save', function(next){
    if (this.isModified('password') || this.isNew) {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8))
    }
    next();
});

const User = mongoose.model("User", user);
export default User;