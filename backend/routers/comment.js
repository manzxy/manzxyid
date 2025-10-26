import express from 'express';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Series from '../models/Series.js';
import { calcTitleFromCount } from '../utils/title.js';
import { sendSecurityEmail } from '../utils/mailer.js';
const router = express.Router();

function requireLogin(req,res,next){ if(!req.user) return res.status(401).json({ error:'Login required' }); next(); }

// SSE clients
const sseClients = new Set();
router.get('/events', (req,res)=> {
  res.set({ 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', Connection:'keep-alive' });
  res.flushHeaders();
  sseClients.add(res);
  req.on('close', ()=> sseClients.delete(res));
});
function broadcast(event, payload){ const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`; for(const r of sseClients){ try{ r.write(msg); }catch(e){} } }

router.post('/series/:id/comment', requireLogin, async (req,res)=> {
  const text = (req.body.text||'').trim();
  if(!text) return res.status(400).json({ error:'Empty' });
  const series = await Series.findById(req.params.id);
  if(!series) return res.status(404).json({ error:'Series not found' });
  const user = await User.findOne({ uid: req.user.uid });
  if(!user) return res.status(404).json({ error:'User not found' });

  // Spoiler detection: keyword list
  const SPOILER_KEYWORDS = ['dead','dies','ending','mati','terbunuh','true form','final'];
  const hasSpoiler = SPOILER_KEYWORDS.some(k=> text.toLowerCase().includes(k));
  const isTagged = text.includes('[spoiler]') && text.includes('[/spoiler]');
  if(hasSpoiler && !isTagged){
    user.warnings = (user.warnings||0) + 1;
    if(user.warnings >= 3){ user.isBanned = true; user.banExpires = null; }
    else if(user.warnings === 2){ user.isBanned = true; user.banExpires = new Date(Date.now()+24*60*60*1000); }
    await user.save();
    return res.status(400).json({ error: 'Komentar dianggap spoiler tanpa tag. Anda telah diperingatkan atau diblokir.' });
  }

  const comment = await Comment.create({ seriesId: series._id, userId: user._id, text });
  user.commentsCount = (user.commentsCount||0) + 1; user.title = calcTitleFromCount(user.commentsCount);
  await user.save();
  broadcast('title-updated', { uid: user.uid, newTitle: user.title });
  const pop = await Comment.findById(comment._id).populate('userId', 'name picture title role');
  res.json({ success:true, comment: pop, user:{ uid:user.uid, title:user.title, commentsCount:user.commentsCount } });
});

router.get('/series/:id/comments', async (req,res)=> {
  const comments = await Comment.find({ seriesId: req.params.id }).sort({ createdAt:-1 }).populate('userId','name picture title role');
  res.json(comments);
});

router.post('/comment/:id/reply', requireLogin, async (req,res)=> {
  const text = (req.body.text||'').trim(); if(!text) return res.status(400).json({ error:'Empty' });
  const user = await User.findOne({ uid: req.user.uid }); const comment = await Comment.findById(req.params.id).populate('userId', 'email name');
  if(!comment) return res.status(404).json({ error:'Not found' });
  comment.replies.push({ userId: user._id, text }); await comment.save();
  if(comment.userId && comment.userId.email) sendSecurityEmail(comment.userId.email, 'Balasan di komentar kamu', `<p>Ada balasan: ${text}</p>`).catch(()=>{});
  broadcast('comment-replied', { commentId: comment._id.toString(), text });
  res.json({ success:true });
});

router.post('/comment/:id/like', requireLogin, async (req,res)=> {
  const user = await User.findOne({ uid: req.user.uid }); const comment = await Comment.findById(req.params.id);
  if(!comment) return res.status(404).json({ error:'Not found' });
  const idx = comment.likes.findIndex(id=> id.toString() === user._id.toString());
  let liked=false; if(idx===-1){ comment.likes.push(user._id); liked=true; } else { comment.likes.splice(idx,1); liked=false; }
  await comment.save(); broadcast('comment-liked', { commentId: comment._id.toString(), likes: comment.likes.length });
  res.json({ success:true, likes: comment.likes.length, liked });
});

export default router;
