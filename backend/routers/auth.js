import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
const router = express.Router();

// configure passport strategies
passport.serializeUser((user, done) => done(null, user.uid));
passport.deserializeUser(async (uid, done) => { const u = await User.findOne({ uid }); done(null, u || null); });

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: '/auth/google/callback'
}, async (_, __, profile, done) => {
  try {
    const uid = 'google-' + profile.id;
    let user = await User.findOne({ uid });
    if (!user) user = await User.create({ uid, provider:'google', name:profile.displayName, email:profile.emails?.[0]?.value||'', picture:profile.photos?.[0]?.value||'' });
    else { user.name = profile.displayName; user.email = profile.emails?.[0]?.value || user.email; user.picture = profile.photos?.[0]?.value || user.picture; await user.save(); }
    done(null, user);
  } catch (e) { done(e, null); }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  callbackURL: '/auth/github/callback'
}, async (_, __, profile, done) => {
  try {
    const uid = 'github-' + profile.id;
    let user = await User.findOne({ uid });
    if (!user) user = await User.create({ uid, provider:'github', name:profile.displayName||profile.username, email:profile.emails?.[0]?.value||'', picture:profile.photos?.[0]?.value||'' });
    else { user.name = profile.displayName||user.name; user.picture = profile.photos?.[0]?.value||user.picture; await user.save(); }
    done(null, user);
  } catch (e) { done(e, null); }
}));

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/reader' }), (req,res)=>res.redirect('/reader'));
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/reader' }), (req,res)=>res.redirect('/reader'));
router.get('/logout', (req,res)=>{ req.logout(()=>{}); res.redirect('/reader'); });

export default router;
