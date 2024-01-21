import mongoose, {Document, Schema} from "mongoose";
import { ICategory } from "./category.model";
import { IImage } from "./image.model";
import { IFile } from "./file.model";

export interface IProject extends Document{
    title : string
    description: string
    category: mongoose.Types.ObjectId | ICategory
    images : mongoose.Types.ObjectId[] | IImage[]
    files : mongoose.Types.ObjectId[] | IFile[]
    author : mongoose.Types.ObjectId
    active : boolean
}

interface IProjectPopulate extends Document, IProject {
    category : ICategory;
    images : IImage[];
    files : IFile[];
}

const projectSchema = new Schema<IProject>({

})


export const ProjectModel = mongoose.model("project",projectSchema);