
import { IDefault, Inject } from './IDefault';
import * as mongoose from 'mongoose';
import { Double, Int32 } from 'bson';

export interface IPagamentoModel extends IDefault, mongoose.Document{
    id: string;
    pagador:string;
    recebedor:string;
    valor:Double;
    parcelar: Int32;
}

let schema = {
    pagador: {type: mongoose.Schema.Types.ObjectId, ref: 'Conta', required: true},
    recebedor: {type: mongoose.Schema.Types.ObjectId, ref: 'Conta', required: true},
    valor: {type: Double, required: true},
    parcelas: {type: Int32, required: true}
};

Inject(schema);
export const PagamentoMasterSchema = new mongoose.Schema(schema);
export const PagamentoModel = mongoose.model<IPagamentoModel>('Pagamento', PagamentoMasterSchema, 'pagamento', false);