const Router = require('express');
const router = new Router();
const controller = require('../controller/controller');

router.get('/ticket/:polis/:doctor', controller.getTicket.bind(controller));
router.put('/ticket', controller.putTicket.bind(controller));
module.exports = router;