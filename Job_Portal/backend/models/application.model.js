import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Job',
        required:true
    },
    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'accepted', 'rejected', 'interview-scheduled', 'interview-completed', 'on-hold', 'selected', 'under-review'],
        default:'pending'
    },
    feedback:{
        type:String,
        default:''
    },
    rejectionReason:{
        type:String,
        default:''
    },
    selectionDate:{
        type:Date
    },
    interviewFeedback:{
        type:mongoose.Schema.Types.Mixed
    }
},{timestamps:true});

export const Application = mongoose.model("Application", applicationSchema);
