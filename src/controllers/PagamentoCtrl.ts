import { IPagamentoModel } from "../model/Pagamento";
import * as async from 'async';
import ContaCorrenteCtrl from "./ContaCorrenteCtrl";
import { IContaCorrenteModel } from "../model/Contacorrente";

class PagamentoCtrl {
  static create(req: { body: any; }, res: { json: (arg0: any) => void; }, next: (arg0: any) => void) {
    var obj: IPagamentoModel = req.body;
    console.log(obj);
    var pagamento: any = {};
    ContaCorrenteCtrl.getById(obj.pagador).then(pagador => {
      pagamento.pagador = pagador;
      console.log(pagamento);
      ContaCorrenteCtrl.getById(obj.recebedor).then(recebedor => {
        pagamento.recebedor = recebedor;
        res.json(pagamento);
      }, errRecebedor => {
        next({ recebedor: errRecebedor });
      })
    }, errPagador => {
      next({ pagador: errPagador });
    })
  };


  private static getByIdPagador(id: any) {
    return ContaCorrenteCtrl.getById(id);
  }
  private static getByIdRecebedor(id: any) {
    return ContaCorrenteCtrl.getById(id);
  }



}
export default PagamentoCtrl;