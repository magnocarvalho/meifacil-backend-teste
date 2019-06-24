import { ContaCorrenteModel, IContaCorrenteModel } from "../model/Contacorrente";
import { reject } from "async";
import { ILancamentoModel } from "../model/Lancamento";

class ContaCorrenteCtrl {
  static create(req: { body: any; }, res: { json: (arg0: any) => void; }, next: (arg0: any) => void) {
    var obj = req.body;
    //para teste, rota de salva noca contacorrente apenas com valor inicial da conta e nome, nao valida campos.
    ContaCorrenteModel.create(obj, (err: any, data: any) => {
      if (err) next(err);
      else res.json(data);
    });
  }
  static getDadosUsuario(req: { params: { id: any; }; }, res: { json: (arg0: IContaCorrenteModel) => void; }, next: (arg0: any) => void) {
    var id = req.params.id;
    ContaCorrenteCtrl.getById(id).then(
      data => {
        res.json(data);
      },
      err => {
        next(err);
      }
    );
  }
  static realizarPagamento(obj: any) {
    return new Promise<any>((resolve, reject) => {
      var lancamento: any = { pagador: obj.pagador._id };
      var liquido = Number(obj.valorLiquido);
      var pagador: IContaCorrenteModel = obj.pagador;
      pagador.saldo = Number(pagador.saldo) - liquido;
      ContaCorrenteCtrl.getByIdDescontar(pagador.id, pagador).then(desconto => {
        resolve({ saldoPagador: Number(desconto.saldo), pagador: desconto._id });
      }, erroDesconto => {
        reject(erroDesconto);
      })
    })
  }
  public static getById(id: any) {
    return new Promise<IContaCorrenteModel>((resolve, reject) => {
      ContaCorrenteModel.findOne({ isDeleted: false, _id: id }, (err, data) => {
        if (err || data === null) reject(err);
        else {
          resolve(data);
        }
      });
    });
  }

  public static getByIdDescontar(id: any, obj: any) {
    return new Promise<IContaCorrenteModel>((resolve, reject) => {
      ContaCorrenteModel.findByIdAndUpdate(id, obj, (err, data) => {
        if (err || data === null) reject(err);
        else {
          console.error(data);
          resolve(data);
        }
      });
    });
  }
  public static getByIdPagar(id: any, obj: any) {
    return new Promise<IContaCorrenteModel>((resolve, reject) => {
      ContaCorrenteModel.findOneAndUpdate({ isDeleted: false, _id: id }, obj, (err, data) => {
        if (err || data === null) reject(err);
        else {
          resolve(data);
        }
      });
    });
  }
  private static getByIdReceber(id: any, obj: any) {
    return new Promise<IContaCorrenteModel>((resolve, reject) => {
      ContaCorrenteModel.findOneAndUpdate({ isDeleted: false, id: id }, obj, (err, data) => {
        if (err || data === null) reject(err);
        else {
          resolve(data);
        }
      });
    });
  }
}
export default ContaCorrenteCtrl;