const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/itemController');

const router = Router();

router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
