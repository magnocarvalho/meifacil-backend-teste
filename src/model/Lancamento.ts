
import { IDefault, Inject } from './IDefault';
import * as mongoose from 'mongoose';
import { Double, Int32, Decimal128 } from 'bson';

export interface ILancamentoModel extends IDefault, mongoose.Document{
    id: string;
    pagador:string;
    recebedor:string;
    valorTotal:Double;
    parcelas: Int32;
    saldoPagador:Double;
    saldoRecebedor:Double;
}

let schema = {
    pagador: {type: mongoose.Schema.Types.ObjectId, ref: 'contacorrente', required: true},
    recebedor: {type: mongoose.Schema.Types.ObjectId, ref: 'contacorrente', required: true},
    valorTotal: {type: Decimal128, required: true},
    parcelas: {type: Int32, required: true},
    saldoPagador: {type: Decimal128, required: true},
    saldoRecebedor: {type: Decimal128, required: true}
};

Inject(schema);
export const LancamentoMasterSchema = new mongoose.Schema(schema);
export const LancamentoModel = mongoose.model<ILancamentoModel>('lancamento', LancamentoMasterSchema, 'lancamento', false);