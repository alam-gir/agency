import mongoose , {Schema} from 'mongoose';

const serviceSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true
    },
    short_description:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    icon: {
        type: Schema.Types.ObjectId,
        ref: 'image'
    },
    package: {
        type: Schema.Types.ObjectId,
        ref: 'package'
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
})

export const ServiceModel = mongoose.model('service', serviceSchema);