const Router = require('express');
const router = new Router();
const controller = require('../controller/controller');

router.get('/ticket/:polis/:doctor', controller.getTicket.bind(controller));
router.put('/ticket', controller.putLifeTicket.bind(controller));
router.get('/online-queue', controller.getDoctors.bind(controller));
router.put('/ticket/:date', controller.putOnlineTicket.bind(controller));
module.exports = router;