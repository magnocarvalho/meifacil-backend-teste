
import { IDefault, Inject } from './IDefault';
import * as mongoose from 'mongoose';
import { Double } from 'bson';


export interface IPagamentoModel extends IDefault, mongoose.Document{
    id: string;
    saldo: Double;
    titular: string;
}

let schema = {
   saldo: {type: Double, required: true},
   titular: {type: String}
};

Inject(schema);
export const PagamentoMasterSchema = new mongoose.Schema(schema);
export const PagamentoModel = mongoose.model<IPagamentoModel>('Pagamento', PagamentoMasterSchema, 'pagamento', false);