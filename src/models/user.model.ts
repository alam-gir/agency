import mongoose, {Document, Schema, mongo} from "mongoose";
import bcrypt from "bcrypt"
import JWT from "jsonwebtoken"
import { IImage } from "./image.model";

export interface IUser extends Document {
    name: string;
    email: string;
    avatar: mongoose.Types.ObjectId | IImage;
    phone: string;
    password: string;
    role: string;
    refreshToken: string;
    _id: string;
    generateAccessToken: () => string;
    generateRefreshToken:  () => string;
    isPasswordValid: (password: string) => Promise<boolean>;
}

export interface IUserPopulate extends IUser{
    avatar : IImage
}

const userSchema = new Schema<IUser>({
    name:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unique : true
    },
    avatar:{
        type : mongoose.SchemaTypes.ObjectId,
        ref: "image"
    },
    phone:{
        type : String,
        required : true,
        unique : true
    },
    password:{
        type : String,
        required : true,
        min: [5, "Password required minimum 5 characters!"],
        max: [20, "Password required maximum 20 characters!"],
    },
    role:{
        type : String,
        enum: ["guest","user", "admin", "super-admin"],
        default: "user"
    },
    refreshToken: {
        type: String
    }

},{
    timestamps: true
});


// hash password before on save if modify the password.
userSchema.pre("save",async function(next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next();
})


// function to check password validation
userSchema.methods.isPasswordValid = async function(password : string) {
    return await bcrypt.compare(password, this.password)
}

// generate accessToken
userSchema.methods.generateAccessToken = function() {
    return JWT.sign({
        name: this.name, email : this.email, avatar: this.avatar, phone: this.phone, role: this.role, _id: this._id
    }, process.env.ACCESS_TOKEN_SECRET as string,{
        expiresIn: '1h',
    })
}

// generate accessToken
userSchema.methods.generateRefreshToken = function() {
    return JWT.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET as string,{
        expiresIn: "30d",
    })
}


const UserModel = mongoose.model<IUser>("user", userSchema);

export {
    UserModel
}