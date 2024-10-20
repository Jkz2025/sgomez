import { useEffect, useState } from "react";

const Calculadora = () => {
  const [valorTotal, setValorTotal] = useState("");
  const [cuotaInicial, setCuotaInicial] = useState("");
  const [iva, setIva] = useState("");
  const [saldoFinanciar, setSaldoFinanciar] = useState("");
  const [cuotas, setCuotas] = useState([]);


    const handleClean = () => {
        setValorTotal("")
        setCuotaInicial("")
        setSaldoFinanciar("")
        setIva("")
    }
   // Nueva función para formatear números con comas
   const formatNumberWithCommas = (value) => {
    // Eliminar cualquier caracter que no sea número
    const numberOnly = value.replace(/[^\d]/g, '');
    // Convertir a número y formatear con comas
    return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

   // Nueva función para quitar el formato antes de hacer cálculos
   const parseFormattedNumber = (value) => {
    // Eliminar las comas y convertir a número
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
    // Convertir los valores formateados a números antes de calcular
    const valorTotalNumero = parseFormattedNumber(valorTotal);
    const cuotaInicialNumero = parseFormattedNumber(cuotaInicial);

    const ivaCalculado = valorTotalNumero * 0.19;
    const saldo = valorTotalNumero - cuotaInicialNumero;
    
    // Formatear los resultados con comas
    setIva(formatNumberWithCommas(ivaCalculado.toFixed(0)));
    setSaldoFinanciar(formatNumberWithCommas(saldo.toFixed(0)));
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
    <div className="p-4 mt-20">
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bole mb-4">Calculadora</h1>
        <div className="mb-4">
          <label htmlFor="" className="block mb-2">
            Valor Total
          </label>
          <input
            type="text"
            value={valorTotal}
            onChange={handleValorTotalChange}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">IVA:</label>
          <input
            type="text"
            value={iva}
            readOnly
            className="border p-2 w-full bg-gray-200"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="" className="block mb-2">
            Cuota Inicial:
          </label>
          <input
            type="text"
            value={cuotaInicial}
            onChange={(handleCuotaInicialChange)}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="" className="block mb-2">
            Saldo a Financiar:
          </label>
          <input
            type="text"
            value={saldoFinanciar}
            readOnly
            className="border p-2 w-full bg-gray-200"
          />
        </div>
        <div className="justify-between flex">
        <button
          onClick={calcularFinanciacion}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Calcular
        </button>
        <button
          onClick={handleClean}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Limpiar
        </button>
        </div>
      
        <table className="table-auto w-full mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">% Financiacion</th>
              <th className="px-4 py-2">Cuota Minima</th>
            </tr>
          </thead>
          <tbody>
            {cuotas.map((cuota, index) => (
               <tr key={index}>
               <td className="border px-4 py-2">{cuota.cantidad}</td>
               <td className="border px-4 py-2">{cuota.porcentaje}%</td>
               <td className="border px-4 py-2">
                 ${formatNumberWithCommas(cuota.cuotaMinima.toFixed(0))}
               </td>
             </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Calculadora;
