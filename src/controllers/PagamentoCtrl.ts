import {  IPagamentoModel } from "../model/Pagamento";
import * as async from 'async';
import ContaCorrenteCtrl from "./ContaCorrenteCtrl";

var waterfall = require('async-waterfall');
var callback:EventListener;

class PagamentoCtrl {
  static create(req: { body: any; }, res: { json: (arg0: any) => void; }, next: (arg0: any) => void) {
    var obj: IPagamentoModel = req.body;
    waterfall([
      this.getPagador(obj, callback),
      
    ], function (error: any, sucesso: any) {
      if (error) {
        next(error);
      } else {
        res.json(sucesso);
      }
    })

  };

  public static getPagador(obj: any, callback: EventListener) {
    ContaCorrenteCtrl.getById(obj.pagador).then(res => {
      var pagador = res;
      callback(res);
    })
    callback(obj);
  }
  public static getRecebedor(obj: any, callback: EventListener) {
    callback(obj);
  }
  public static checkValor(obj: any, callback: EventListener) {
    callback(obj);
  }
  public static valorParcelas(obj: any, callback: EventListener) {
    callback(obj);
  }
}
export default PagamentoCtrl;