import express from 'express';
import Series from '../models/Series.js';
const router = express.Router();

router.get('/', async (req,res)=> {
  const q = req.query.search;
  if (q) {
    const regex = new RegExp(q, 'i');
    const data = await Series.find({ $or:[{title:regex},{description:regex}] }).sort({createdAt:-1});
    return res.json(data);
  }
  const data = await Series.find().sort({createdAt:-1});
  res.json(data);
});

router.get('/:id', async (req,res)=> {
  const s = await Series.findById(req.params.id);
  if (!s) return res.status(404).json({ error:'Not found' });
  res.json(s);
});

export default router;
