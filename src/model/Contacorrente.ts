
import { IDefault, Inject } from './IDefault';
import * as mongoose from 'mongoose';
import { Double } from 'bson';


export interface IContaCorrenteModel extends IDefault, mongoose.Document{
    id: string;
    saldo: Double;
    titular: string;
}

let schema = {
   saldo: {type: Double, required: true},
   titular: {type: String}
};

Inject(schema);
export const ContaCorrenteMasterSchema = new mongoose.Schema(schema);
export const ContaCorrenteModel = mongoose.model<IContaCorrenteModel>('contacorrente', ContaCorrenteMasterSchema, 'contacorrente', false);