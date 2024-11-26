import { useState } from "react";
import { ClipboardCheck, RefreshCcw } from "lucide-react";
import { Calculator } from "lucide-react";
const Calculadora = () => {
  const [valorTotal, setValorTotal] = useState("");
  const [cuotaInicial, setCuotaInicial] = useState("");
  const [iva, setIva] = useState("");
  const [preciocompra, setPrecioCompra] = useState("");
  const [saldoFinanciar, setSaldoFinanciar] = useState("");
  const [cuotas, setCuotas] = useState([]);

  const handleClean = () => {
    setValorTotal("")
    setCuotaInicial("")
    setSaldoFinanciar("")
    setIva("")
    setPrecioCompra("")
    setCuotas([])
  }

  const formatNumberWithCommas = (value) => {
    const numberOnly = value.replace(/[^\d]/g, '');
    return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseFormattedNumber = (value) => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  const handleValorTotalChange = (e) => {
    const formattedValue = formatNumberWithCommas(e.target.value);
    setValorTotal(formattedValue);
  };

  const handleCuotaInicialChange = (e) => {
    const formattedValue = formatNumberWithCommas(e.target.value);
    setCuotaInicial(formattedValue);
  };

  const calcularFinanciacion = () => {
    const valorTotalNumero = parseFormattedNumber(valorTotal);
    const cuotaInicialNumero = parseFormattedNumber(cuotaInicial);

    const ivaCalculado = valorTotalNumero / 1.19 - valorTotalNumero;
    const saldo = valorTotalNumero - cuotaInicialNumero;
    const preciocomprafinal = ivaCalculado + valorTotalNumero

    setIva(formatNumberWithCommas(ivaCalculado.toFixed(0)));
    setSaldoFinanciar(formatNumberWithCommas(saldo.toFixed(0)));
    setPrecioCompra(formatNumberWithCommas(preciocomprafinal.toFixed(0)))

    const nuevasCuotas = [
      { cantidad: 2, porcentaje: 51.53, cuotaMinima: saldo * 0.5153 },
      { cantidad: 3, porcentaje: 34.71, cuotaMinima: saldo * 0.3471 },
      { cantidad: 4, porcentaje: 26.29, cuotaMinima: saldo * 0.2629 },
      { cantidad: 5, porcentaje: 21.25, cuotaMinima: saldo * 0.2125 },
      { cantidad: 6, porcentaje: 17.88, cuotaMinima: saldo * 0.1788 },
      { cantidad: 7, porcentaje: 15.48, cuotaMinima: saldo * 0.1548 },
      { cantidad: 8, porcentaje: 13.68, cuotaMinima: saldo * 0.1368 },
      { cantidad: 9, porcentaje: 12.28, cuotaMinima: saldo * 0.1228 },
      { cantidad: 10, porcentaje: 11.16, cuotaMinima: saldo * 0.1116 },
      { cantidad: 11, porcentaje: 10.25, cuotaMinima: saldo * 0.1025 },
      { cantidad: 12, porcentaje: 9.49, cuotaMinima: saldo * 0.0949 },
      { cantidad: 13, porcentaje: 8.84, cuotaMinima: saldo * 0.0884 },
      { cantidad: 14, porcentaje: 8.29, cuotaMinima: saldo * 0.0829 },
      { cantidad: 15, porcentaje: 7.81, cuotaMinima: saldo * 0.0781 },
      { cantidad: 16, porcentaje: 7.4, cuotaMinima: saldo * 0.074 },
      { cantidad: 17, porcentaje: 7.03, cuotaMinima: saldo * 0.0703 },
      { cantidad: 18, porcentaje: 6.7, cuotaMinima: saldo * 0.067 },
      { cantidad: 19, porcentaje: 6.41, cuotaMinima: saldo * 0.0641 },
      { cantidad: 20, porcentaje: 6.15, cuotaMinima: saldo * 0.0615 },
      { cantidad: 21, porcentaje: 5.91, cuotaMinima: saldo * 0.0591 },
      { cantidad: 22, porcentaje: 5.69, cuotaMinima: saldo * 0.0569 },
      { cantidad: 23, porcentaje: 5.5, cuotaMinima: saldo * 0.055 },
      { cantidad: 24, porcentaje: 5.32, cuotaMinima: saldo * 0.0532 },
      { cantidad: 25, porcentaje: 5.15, cuotaMinima: saldo * 0.0515 },
      { cantidad: 26, porcentaje: 5.0, cuotaMinima: saldo * 0.05 },
    ];
    setCuotas(nuevasCuotas);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 mt-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center">Calculadora Financiera</h1>
        <p className="text-center text-gray-400">Calcula tu financiamiento</p>
      </header>

      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor Total</label>
            <input
              type="text"
              value={valorTotal}
              onChange={handleValorTotalChange}
              className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2"
              placeholder="Ingrese valor total"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cuota Inicial</label>
            <input
              type="text"
              value={cuotaInicial}
              onChange={handleCuotaInicialChange}
              className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2"
              placeholder="Ingrese cuota inicial"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">IVA</label>
            <input
              type="text"
              value={iva}
              readOnly
              className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Precio Compra</label>
            <input
              type="text"
              value={preciocompra}
              readOnly
              className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Saldo a Financiar</label>
            <input
              type="text"
              value={saldoFinanciar}
              readOnly
              className="w-full bg-gray-900 text-gray-300 border border-gray-600 rounded-md p-2"
            />
          </div>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={calcularFinanciacion}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <Calculator className="mr-2 w-5 h-5" />
            Calcular
          </button>
          <button
            onClick={handleClean}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <RefreshCcw className="mr-2 w-5 h-5" />
            Limpiar
          </button>
        </div>

        {cuotas.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">Opciones de Financiamiento</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-4 py-2 text-left">Número de Cuotas</th>
                    <th className="px-4 py-2 text-left">% Financiación</th>
                    <th className="px-4 py-2 text-right">Cuota Mínima</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((cuota, index) => (
                    <tr key={index} className="border-b border-gray-600">
                      <td className="px-4 py-2">{cuota.cantidad}</td>
                      <td className="px-4 py-2">{cuota.porcentaje}%</td>
                      <td className="px-4 py-2 text-right">
                        ${formatNumberWithCommas(cuota.cuotaMinima.toFixed(0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculadora;