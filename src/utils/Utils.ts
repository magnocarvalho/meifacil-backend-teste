import { Double, Int32, Decimal128 } from "bson";

class Utils {
    public static calcularJuros(valor: Double, parcelas: Int32): Double {
        var num = Number(valor);
        switch (parcelas) {
            case 1:
                var retorno = ((num / 100) * 3.79) + num;
                return retorno;
                break;
            case 2:
                var retorno = ((num / 100) * 5.78) + num;
                return retorno;
                break;
            case 3:
                var retorno = ((num / 100) * 7.77) + num;
                return retorno;
                break;
            default:
                return null;
                break;
        }
    }
}
export default Utils;