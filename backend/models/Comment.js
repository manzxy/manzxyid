import mongoose from 'mongoose';
const ReplySchema = new mongoose.Schema({ userId:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, text:String, createdAt:{type:Date,default:Date.now}, readByOwner:{type:Boolean,default:false} }, {_id:true});
const CommentSchema = new mongoose.Schema({
  seriesId:{type:mongoose.Schema.Types.ObjectId, ref:'Series', required:true},
  userId:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
  text:String,
  likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
  replies:[ReplySchema],
  createdAt:{type:Date,default:Date.now}
});
export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
