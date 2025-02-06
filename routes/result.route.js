const {Router} = require('express');
const { createResult, getResultByEventId, updateResult, deleteResult, declareResultForEvent } = require('../controllers/results.controller.js');
const { restrictLogIn } = require('../middlewares/authCheck.js');
const resultRouter = Router();

resultRouter.get('/get/:eventId',restrictLogIn, getResultByEventId);
resultRouter.get('/');
resultRouter.post('/add',restrictLogIn,createResult);
resultRouter.put('/update/:id',restrictLogIn, updateResult);
resultRouter.delete('/delete/:id',restrictLogIn,deleteResult);
resultRouter.get('/declare/:eventId',restrictLogIn,declareResultForEvent);



module.exports = resultRouter;