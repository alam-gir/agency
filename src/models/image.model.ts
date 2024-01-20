import mongoose, {Schema, Model, Document} from "mongoose";

export interface IImage extends Document {
    _id: string
    public_id : string
    url : string
    cloudinaryPath : string
}

const imageSchema = new Schema<IImage>({
    url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    cloudinaryPath: {
        type: String,
        required: true
    }
},{timestamps:true})

export const ImageModel = mongoose.model("image",imageSchema);