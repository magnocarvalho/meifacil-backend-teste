import { IPagamentoModel, PagamentoModel } from "../model/Pagamento";
import * as async from 'async';
import ContaCorrenteCtrl from "./ContaCorrenteCtrl";
import { IContaCorrenteModel } from "../model/Contacorrente";
import { Double, Int32, Decimal128 } from "bson";
import Utils from "../utils/Utils";
import { readdirSync } from "fs";
import { response } from "express";
// import { ServerResponse } from "http";
class PagamentoCtrl {


  static create(req, res, next) {
    var obj: IPagamentoModel = req.body;
    var pagamento: any = { valor: obj.valor, parcelas: obj.parcelas, pagante: obj.pagador, recebendo: obj.recebedor };
    // var retorno = {};
    //validando dados de entrada antes de acessar o banco de dados
    var testeDados = PagamentoCtrl.validarDados(obj);
    if (testeDados.Erro) {
      next(testeDados.Erro);
    } else {
      let passos = [async.apply(PagamentoCtrl.getPagador, pagamento),
      PagamentoCtrl.getRecebedor,
      PagamentoCtrl.getCalculos,
      PagamentoCtrl.realizarPagamento
      ];
      try {
        async.waterfall(passos,
          (err, data) => {
            if (err) {
              console.log(err);
              next(err);
            }
            else {
              res.json(data);

            }
          });
      } catch (error) {
        console.log("Try catch");
        console.error(error);
        next(error);
      }
    }

  };
  public static getPagador(pag, callback) {
    ContaCorrenteCtrl.getById(pag.pagante).then(pagador => {
      pag.pagador = pagador;
      if (pagador)
        callback(null, pag);
      else
        callback("Erro ao buscar pagador", null);
    });
  }
  public static getRecebedor(pag, callback) {
    ContaCorrenteCtrl.getById(pag.recebendo).then(recebedor => {
      pag.recebedor = recebedor;
      if (recebedor)
        callback(null, pag);
      else
        callback("Erro ao buscar recebedor", null);
    });
  }
  public static getCalculos(pag, callback) {
    // var pagaador: IContaCorrenteModel = pag.pagador;
    PagamentoCtrl.compararSaldos(pag).then(juros => {
      pag.valorLiquido = juros;
      if (juros)
        callback(null, pag);
      else
        callback("Erro ao processar juros", null);
    });
  }
  public static realizarPagamento(pag, callback) {
    var lancamento: any = { pagador: pag.pagador._id };
    var liquido = Number(pag.valorLiquido);
    var pagador: IContaCorrenteModel = pag.pagador;
    var recebedor: IContaCorrenteModel = pag.recebedor;
    pagador.saldo = Number(pagador.saldo) - liquido;
    ContaCorrenteCtrl.getByIdDescontar(pagador.id, pagador).then(desconto => {
      lancamento = { saldoPagador: desconto.saldo, pagador: desconto._id };
      pag.sucesso = desconto;
      ContaCorrenteCtrl.getByIdPagar(recebedor.id, recebedor).then(pagamento => {
        lancamento = { saldoRecebedor: pagamento.saldo, recebedor: recebedor._id }
        if (desconto)
          callback(null, pag);
      }).catch((erroCredito) => {
        console.log(erroCredito);
        callback('Erro ao realizar pagamento', null);
      })
    }).catch(erroDesconto => {
      console.error(erroDesconto);
    });
  }

  private static validarIDContaCorrente(id: string): boolean {
    //objectID do mongo db possui 24 caracteres 
    if (id.length != 24) { return true }
    else
      return false;
  }

  private static compararSaldos(obj: any) {
    var valorComJuros = Utils.calcularJuros(obj.valor, obj.parcelas);
    var erroJuros = false;
    var labelErro = "";
    if (valorComJuros) {
      if (obj.pagador.saldo > valorComJuros) {
        erroJuros = true;
      }
      else {
        labelErro = "Saldo insuficiente";
      }
    }
    return new Promise<any>((resolve, reject) => {
      if (erroJuros) {
        resolve(valorComJuros)
      } else {
        if (labelErro) {
          reject(labelErro)
        }
        else {
          reject("Erro ao comparar juros");
        }
      }
    }).catch((erro) => {
      console.error(erro);
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
}
export default PagamentoCtrl;