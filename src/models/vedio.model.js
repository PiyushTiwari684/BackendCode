import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const vedioShchema = new Schema(
  {
    vedioFile: {
      type: String, // cloudinary url
      required: true,
    },
    thumbnail: {
      type: String, 
      required: true,
    },
    title: {
      type: String, 
      required: true,
    },
    description: {
      type: String, 
      required: true,
    },
    duration: {
      type: Number, // cloudinary url
      required: true,
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
  },
  { timestamps: true }
);

vedioShchema.plugin(mongooseAggregatePaginate) 

export const Vedio = mongoose.model("Vedio",vedioShchema);