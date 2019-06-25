import { IPagamentoModel, PagamentoModel } from "../model/Pagamento";
import * as async from 'async';
import ContaCorrenteCtrl from "./ContaCorrenteCtrl";
import { IContaCorrenteModel } from "../model/Contacorrente";
import { Double, Int32 } from "bson";
import Utils from "../utils/Utils";
import { readdirSync } from "fs";
import { response } from "express";
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
    // PagamentoCtrl.verificarSaldo(pagamento).then();
  };
  public static verificarSaldo(pagamento) {
    try {

      PagamentoModel.aggregate([
        {
          $lookup: {
            from: "contacorrente",
            localField: pagamento.pagador,
            foreignField: "_id",
            as: "contacorrente"
          }

        },
        {
          unwind: "$contacorrente"
        }

      ]).exec((err, lancamento) => {
        if (err) {
          return ({ code: "erro lancamento", error: err });
        }
        return (lancamento);
      });
    } catch (error) {
      console.error(error);
    }


  };



  // //inicio da conexão com o banco de dados 
  // let passos = [async.apply(PagamentoCtrl.getPagador, pagamento),
  // PagamentoCtrl.getRecebedor,
  // PagamentoCtrl.getCalculos,
  // PagamentoCtrl.realizarPagamento];
  // try {
  //   async.waterfall(passos,
  //     (err, data) => {
  //       if (err) {
  //         console.log(err);
  //         next(err);
  //       }
  //       else {
  //         response.json(data);
  //        // console.error(data);
  //         // console.log(res);
  //         // retorno.ok = true;
  //         // res.sendStatus(200)
  //         //   .json(data)
  //         //   .send()
  //         //   .end();
  //       }
  //     });
  // } catch (error) {
  //   console.error(error);
  // }

  // };
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
    pagador.saldo = Number(pagador.saldo) - liquido;
    ContaCorrenteCtrl.getByIdDescontar(pagador.id, pagador).then(desconto => {
      lancamento = { saldoPagador: Number(desconto.saldo), pagador: desconto._id };
      pag.sucesso = desconto;
      if (desconto)
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