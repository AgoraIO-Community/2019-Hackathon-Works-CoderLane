import { Router } from "express";
import passport from "passport";

const router = Router();

router.get('/github', passport.authenticate('github'));
router.get(
  '/github/callback',
  passport.authenticate('github', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/'
  }),
  (req, res) => {
    res.redirect('/');
  }
);
router.get('/signout', (req, res) => {
  req.logout();
  res.redirect('/');
});

export default router;