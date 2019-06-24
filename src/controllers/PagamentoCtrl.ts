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
    var pagamento: any = { valor: obj.valor, parcelas: obj.parcelas };
    var retorno = {};
    //inicio da conexão com o banco de dados 
    var testeDados = PagamentoCtrl.validarDados(obj);
    if (testeDados.Erro) {
      next(testeDados.Erro);
    }

    //validando dados de entrada antes de acessar o banco de dados
    // res.setHeader('Content-Type', 'application/json');

    async.series([
      function getPagador(done) {
        ContaCorrenteCtrl.getById(obj.pagador).then(pagador => {
          pagamento.pagador = pagador;
          done(null, pagamento);
        }).catch(err => {
          next(err);
          throw new Error(err);
        });
      },
      function getRecebedor(done) {
        ContaCorrenteCtrl.getById(obj.recebedor).then(recebedor => {
          pagamento.recebedor = recebedor;
          done(null, pagamento);
        }).catch(err => {
          next(err);
          throw new Error(err);
        });
      },

      function getCalculos(done) {
        PagamentoCtrl.compararSaldos(pagamento).then(juros => {
          pagamento.valorLiquido = juros;
          done(null, pagamento);
        }).catch(err => {
          next(err);
          throw new Error(err);
        });
      },
      function realizarPagamento(done) {
        ContaCorrenteCtrl.realizarPagamento(pagamento).then(sucesso => {
          retorno = sucesso;
          res.json(retorno);
          done(null, pagamento);
        }).catch(err => {
          next(err);
          throw new Error(err);
        });
      }
    ],
      function (err) {
        if (err) {
          next(err);
          throw new Error(err.message);
        } else {
          console.log('Todas as transaçoes OK!');
         
        }
      });
  };


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