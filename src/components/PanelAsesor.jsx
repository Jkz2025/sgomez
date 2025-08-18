import React, { useState } from 'react';
import { Calendar, TrendingUp, Users, Eye, Grid, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import AuthFlow from './Interfaz/AuthFlow';
import { useFetchVisitas } from './useFetchs/useFetchVisitas';

const PanelAsesor = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [visitas, setVisitas] = useState([]);

    useFetchVisitas(setVisitas);

    // Datos simulados para el ejemplo
    const citasHoy = [
        { id: 1, cliente: 'María García', hora: '09:00', estado: 'Completada', resultado: 'Venta' },
        { id: 2, cliente: 'Juan Pérez', hora: '11:30', estado: 'Completada', resultado: 'Seguimiento' },
        { id: 3, cliente: 'Ana López', hora: '14:00', estado: 'Completada', resultado: 'R' },
        { id: 4, cliente: 'Carlos Ruiz', hora: '16:30', estado: 'Pendiente', resultado: '-' }
    ];

    const visitasR = [
        { id: 1, cliente: 'Ana López', fecha: '2025-01-08', motivo: 'No tiene presupuesto suficiente' },
        { id: 2, cliente: 'Pedro Martín', fecha: '2025-01-07', motivo: 'Necesita consultar con su pareja' },
        { id: 3, cliente: 'Laura Silva', fecha: '2025-01-06', motivo: 'Prefiere otro tipo de programa' }
    ];

    const programas = [
        { 
            id: 1, 
            nombre: 'Programa Premium', 
            color: 'from-blue-500 to-blue-700',
            referidos: [
                { nombre: 'María García', fecha: '2025-01-08', estado: 'Activo' },
                { nombre: 'Roberto Villa', fecha: '2025-01-05', estado: 'Pendiente' }
            ]
        },
        { 
            id: 2, 
            nombre: 'Programa Básico', 
            color: 'from-green-500 to-green-700',
            referidos: [
                { nombre: 'Juan Pérez', fecha: '2025-01-07', estado: 'Activo' },
                { nombre: 'Carmen Díaz', fecha: '2025-01-04', estado: 'Activo' },
                { nombre: 'Luis Torres', fecha: '2025-01-03', estado: 'Pendiente' }
            ]
        },
        { 
            id: 3, 
            nombre: 'Programa VIP', 
            color: 'from-purple-500 to-purple-700',
            referidos: [
                { nombre: 'Sandra Mora', fecha: '2025-01-06', estado: 'Activo' }
            ]
        }
    ];

    const reporteMensual = {
        mesActual: { visitas: 45, ventas: 28, referidos: 15 },
        mesAnterior: { visitas: 38, ventas: 22, referidos: 12 }
    };

    const calcularPorcentaje = (actual, anterior) => {
        if (anterior === 0) return 100;
        return ((actual - anterior) / anterior * 100).toFixed(1);
    };

    const renderDashboard = () => (
        
        <div className="space-y-8">
            {/* Panel de Citas de Hoy */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                    <Calendar className="w-6 h-6 text-blue-400 mr-2" />
                    <h2 className="text-xl font-semibold">Citas de Hoy</h2>
                </div>
                <div className="grid gap-3">
                    {visitas.map(cita => (
                        <div key={cita.id} className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3">
                            <div className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${
                                    cita.estado === 'Completada' ? 'bg-green-400' : 'bg-yellow-400'
                                }`}></div>
                                <span className="font-medium">{cita.cliente}</span>
                                <span className="text-gray-400">{cita.hora}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">{cita.estado}</span>
                                {cita.resultado !== '-' && (
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        cita.resultado === 'Venta' ? 'bg-green-600' : 
                                        cita.resultado === 'R' ? 'bg-red-600' : 'bg-yellow-600'
                                    }`}>
                                        {cita.resultado}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reporte Comparativo */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
                    <h2 className="text-xl font-semibold">Comparación Mensual</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <h3 className="text-gray-400 text-sm mb-2">Visitas</h3>
                        <div className="text-2xl font-bold mb-1">{reporteMensual.mesActual.visitas}</div>
                        <div className={`text-sm flex items-center justify-center ${
                            calcularPorcentaje(reporteMensual.mesActual.visitas, reporteMensual.mesAnterior.visitas) >= 0 
                            ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {calcularPorcentaje(reporteMensual.mesActual.visitas, reporteMensual.mesAnterior.visitas)}%
                            <TrendingUp className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <h3 className="text-gray-400 text-sm mb-2">Ventas</h3>
                        <div className="text-2xl font-bold mb-1">{reporteMensual.mesActual.ventas}</div>
                        <div className={`text-sm flex items-center justify-center ${
                            calcularPorcentaje(reporteMensual.mesActual.ventas, reporteMensual.mesAnterior.ventas) >= 0 
                            ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {calcularPorcentaje(reporteMensual.mesActual.ventas, reporteMensual.mesAnterior.ventas)}%
                            <TrendingUp className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <h3 className="text-gray-400 text-sm mb-2">Referidos</h3>
                        <div className="text-2xl font-bold mb-1">{reporteMensual.mesActual.referidos}</div>
                        <div className={`text-sm flex items-center justify-center ${
                            calcularPorcentaje(reporteMensual.mesActual.referidos, reporteMensual.mesAnterior.referidos) >= 0 
                            ? 'text-green-400' : 'text-red-400'
                        }`}>
                            {calcularPorcentaje(reporteMensual.mesActual.referidos, reporteMensual.mesAnterior.referidos)}%
                            <TrendingUp className="w-4 h-4 ml-1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={() => setActiveView('visitas-r')}
                    className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    <div className="flex items-center justify-center mb-2">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold">Ver Visitas R</h3>
                    <p className="text-sm opacity-80">Revisar motivos de rechazo</p>
                </button>
                
                <button 
                    onClick={() => setActiveView('programas')}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                    <div className="flex items-center justify-center mb-2">
                        <Grid className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold">Ver Programas</h3>
                    <p className="text-sm opacity-80">Gestionar referidos por programa</p>
                </button>
            </div>
        </div>
    );

    const renderVisitasR = () => (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <button 
                    onClick={() => setActiveView('dashboard')}
                    className="mr-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold">Visitas con Resultado R</h2>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="space-y-4">
                    {visitasR.map(visita => (
                        <div key={visita.id} className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg">{visita.cliente}</h3>
                                <span className="text-sm text-gray-400">{visita.fecha}</span>
                            </div>
                            <div className="bg-red-900/20 rounded-lg p-3 border border-red-800/30">
                                <p className="text-red-200">
                                    <span className="font-medium">Motivo: </span>
                                    {visita.motivo}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderProgramas = () => (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <button 
                    onClick={() => setActiveView('dashboard')}
                    className="mr-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold">Programas y Referidos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programas.map(programa => (
                    <div 
                        key={programa.id}
                        onClick={() => {
                            setSelectedProgram(programa);
                        }}
                        className={`bg-gradient-to-br ${programa.color} p-6 rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
                    >
                        <h3 className="text-xl font-bold mb-2">{programa.nombre}</h3>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                            <p className="text-sm opacity-90">
                                <Users className="w-4 h-4 inline mr-2" />
                                {programa.referidos.length} referidos
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReferidos = () => (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <button 
                    onClick={() => {
                        setSelectedProgram(null);
                        setActiveView('programas');
                    }}
                    className="mr-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold">
                    Referidos - {selectedProgram?.nombre}
                </h2>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="space-y-4">
                    {selectedProgram?.referidos.map((referido, index) => (
                        <div key={index} className="bg-gray-700/30 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`w-3 h-3 rounded-full ${
                                    referido.estado === 'Activo' ? 'bg-green-400' : 'bg-yellow-400'
                                }`}></div>
                                <div>
                                    <h3 className="font-semibold">{referido.nombre}</h3>
                                    <p className="text-sm text-gray-400">Referido el: {referido.fecha}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                referido.estado === 'Activo' ? 'bg-green-600' : 'bg-yellow-600'
                            }`}>
                                {referido.estado}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 mt-8">
            <header className="mb-8">
                <h1 className='text-3xl font-bold text-center'>Panel Asesor</h1>
                <p className="text-center text-gray-400">
                    Panel enfocado en mejorar y optimizar las visitas y ventas
                </p>
            </header>
            
            <main className="max-w-7xl mx-auto">
                {activeView === 'dashboard' && renderDashboard()}
                {activeView === 'visitas-r' && renderVisitasR()}
                {activeView === 'programas' && selectedProgram === null && renderProgramas()}
                {activeView === 'programas' && selectedProgram !== null && renderReferidos()}
            </main>
        </div>
    );
};

export default PanelAsesor;