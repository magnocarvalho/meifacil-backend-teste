import * as express from 'express';
import ContaCorrenteCtrl from '../controllers/ContaCorrenteCtrl';

var router = express.Router();

router.post('/conta' , ContaCorrenteCtrl.create);

export = router;