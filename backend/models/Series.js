import mongoose from 'mongoose';
const ChapterSchema = new mongoose.Schema({ number:Number, title:String, images:[String] }, {_id:true});
const SeriesSchema = new mongoose.Schema({
  title:String, description:String, cover:String, status:String, chapters:[ChapterSchema], createdAt:{type:Date,default:Date.now}
});
export default mongoose.models.Series || mongoose.model('Series', SeriesSchema);
