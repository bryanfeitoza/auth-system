const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

const router = Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.put('/me', authenticate, ctrl.update);

module.exports = router;
