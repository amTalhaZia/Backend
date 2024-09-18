import mongoose, { Schema } from "mongoose";

const videoSchema  = new mongoose.Schema(
    {
      videoFile: {
        type: String,
        required: true
      },
      thumbnail: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      edescription: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      },
      views: {
        type: Number,
        default: 0
      },
      isPublished: {
        type: boolean,
        default: true
      },
      owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    },{timestamps:true}
)

export const Video = mongoose.model("Video", videoSchema)