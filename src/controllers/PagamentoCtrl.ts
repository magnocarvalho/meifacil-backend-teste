import { IPagamentoModel } from "../model/Pagamento";
import * as async from 'async';
import ContaCorrenteCtrl from "./ContaCorrenteCtrl";
import { IContaCorrenteModel } from "../model/Contacorrente";
import { Double, Int32 } from "bson";
import Utils from "../utils/Utils";
// import { ServerResponse } from "http";
class PagamentoCtrl {


  static create(req, res, next) {
    var obj: IPagamentoModel = req.body;
    var pagamento: any = { valor: obj.valor, parcelas: obj.parcelas, pagante: obj.pagador, recebendo: obj.recebedor };
    var retorno = {};
    //validando dados de entrada antes de acessar o banco de dados
    var testeDados = PagamentoCtrl.validarDados(obj);
    if (testeDados.Erro) {
      next(testeDados.Erro);
    }

    //inicio da conexão com o banco de dados 
    let passos = [async.apply(PagamentoCtrl.getPagador, pagamento),
    PagamentoCtrl.getRecebedor,
    PagamentoCtrl.getCalculos,
    PagamentoCtrl.realizarPagamento];
    try {
      async.waterfall(passos,
        (err, data) => {
          if (err) {
            console.log(err);
            next(err);
          }
          else {
            res.json(data);
            // console.error(data);
            // console.log(res);
            // retorno.ok = true;
            // res.sendStatus(200)
            //   .json(data)
            //   .send()
            //   .end();
          }
        });
    } catch (error) {
      console.error(error);
    }

  };
  public static getPagador(pag, callback) {
    ContaCorrenteCtrl.getById(pag.pagante).then(pagador => {
      pag.pagador = pagador;
      callback(null, pag);
    }).catch(erro => {
      callback(erro);
    });
  }
  public static getRecebedor(pag, callback) {
    ContaCorrenteCtrl.getById(pag.recebendo).then(recebedor => {
      pag.recebedor = recebedor;
      callback(null, pag);
    }).catch(erro => {
      callback(erro);
    });
  }
  public static getCalculos(pag, callback) {
    PagamentoCtrl.compararSaldos(pag).then(juros => {
      pag.valorLiquido = juros;
      callback(null, pag);
    }).catch(erro => {
      callback(erro);
    });
  }
  public static realizarPagamento(pag, callback) {
    ContaCorrenteCtrl.realizarPagamento(pag).then(sucesso => {
      pag.sucesso = sucesso;
      if (sucesso)
        callback(null, pag);
      else
        callback('Erro ao realizar pagamento', null);
    });
  }

  private static validarIDContaCorrente(id: string): boolean {
    //objectID do mongo db possui 24 caracteres 
    if (id.length != 24) { return false }
    return true;
  }

  private static compararSaldos(obj: any) {
    return new Promise<any>((resolve, reject) => {
      var pagadorSaldo: Double = obj.pagador.saldo;
      var valor: Double = obj.valor;
      var valorComJuros: Double = Utils.calcularJuros(valor, obj.parcelas);
      if (valorComJuros) {
        if (valorComJuros > pagadorSaldo) {
          reject({ 'Erro': 'Saldo Insuficiente' })
        } else {
          // retorna a valor com juros
          resolve(valorComJuros);
        }
      } else {
        reject({ 'Erro': 'Erro ao calcular o Juros' })
      }
    });
  }

  private static validarDados(obj: any): any {
    var valor: Double;
    var parcelas: Int32;
    if (PagamentoCtrl.validarIDContaCorrente(obj.pagador)) {
      return ({ 'Erro': 'Pagador Inválido' })
    }
    if (PagamentoCtrl.validarIDContaCorrente(obj.recebedor)) {
      return ({ 'Erro': 'Recebedor Inválido' })
    }
    try {
      valor = obj.valor;
    } catch (err) {
      return ({ 'Erro': 'Valor Inválido' });
    }
    try {
      parcelas = obj.parcelas;
    } catch (err) {
      return ({ 'Erro': 'Parcelas Inválido' });
    }
    if (valor < 0) {
      return ({ 'Erro': 'Valor Negativo' });
    }
    if (parcelas < 1 || parcelas > 3) {
      return ({ 'Erro': 'Quantidade de parcelas Inválida' });
    }
    return true;
  }


  private static getByIdPagador(id: any) {
    return ContaCorrenteCtrl.getById(id);
  }
  private static getByIdRecebedor(id: any) {
    return ContaCorrenteCtrl.getById(id);
  }



}
export default PagamentoCtrl;