import mongoose, {Schema, Model, Document} from "mongoose";

export interface IFile extends Document {
    public_id : string;
    url : string;
}

const fileSchema = new Schema<IFile>({
    url: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    }
},{timestamps:true})

export const FileModel = mongoose.model("image",fileSchema);