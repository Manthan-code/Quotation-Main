const router = require('express').Router();
const ctrl   = require('../controllers/hardwareController');

router.get('/',       ctrl.getAll);
router.post('/',      ctrl.create);
router.put('/:id',    ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
