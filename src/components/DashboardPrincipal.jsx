import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

const DashboardPrincipal = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalUsers: 0,
    totalOrders: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    // Simular datos - en producción esto vendría de Supabase
    setStats({
      totalSales: 125000,
      totalUsers: 1247,
      totalOrders: 892,
      monthlyRevenue: 45000
    });
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, positive }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-600/20 rounded-xl">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <div className={`flex items-center space-x-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="text-sm font-semibold">{change}%</span>
        </div>
      </div>
      <h3 className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</h3>
      <p className="text-blue-200 text-sm">{title}</p>
    </div>
  );

  const RecentActivity = () => (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-blue-400" />
        Actividad Reciente
      </h3>
      <div className="space-y-4">
        {[
          { action: 'Nueva venta', user: 'Juan Pérez', time: 'Hace 5 min', positive: true },
          { action: 'Registro de usuario', user: 'María García', time: 'Hace 15 min', positive: true },
          { action: 'Pedido completado', user: 'Carlos López', time: 'Hace 30 min', positive: true },
          { action: 'Producto actualizado', user: 'Admin', time: 'Hace 1 hora', positive: false },
        ].map((activity, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${activity.positive ? 'bg-green-400' : 'bg-blue-400'}`} />
              <div>
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-blue-200 text-sm">{activity.user}</p>
              </div>
            </div>
            <span className="text-blue-300 text-sm">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const QuickActions = () => (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 gap-3">
        <button className="gradient-button p-4 rounded-xl flex flex-col items-center justify-center space-y-2">
          <ShoppingBag className="w-6 h-6" />
          <span className="text-sm">Agendar Cita</span>
        </button>
        <button className="gradient-button p-4 rounded-xl flex flex-col items-center justify-center space-y-2">
          <Users className="w-6 h-6" />
          <span className="text-sm">Agregar Programas</span>
        </button>
        <button className="gradient-button p-4 rounded-xl flex flex-col items-center justify-center space-y-2">
          <BarChart3 className="w-6 h-6" />
          <span className="text-sm">Ver Reportes</span>
        </button>
        <button className="gradient-button p-4 rounded-xl flex flex-col items-center justify-center space-y-2">
          <Calendar className="w-6 h-6" />
          <span className="text-sm">Calendario Pendientes</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="mt-20 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard Principal</h1>
          <p className="text-blue-200">Bienvenido de nuevo, aquí está el resumen de tu negocio</p>
        </div>

        {/* Stats Grid */}
        <div className="card-grid mb-8">
          <StatCard 
            title="Ventas Totales" 
            value={stats.totalSales} 
            change={12} 
            icon={DollarSign} 
            positive={true}
          />
          <StatCard 
            title="Usuarios Activos" 
            value={stats.totalUsers} 
            change={8} 
            icon={Users} 
            positive={true}
          />
          <StatCard 
            title="Pedidos" 
            value={stats.totalOrders} 
            change={5} 
            icon={ShoppingBag} 
            positive={true}
          />
          <StatCard 
            title="Ingreso Mensual" 
            value={stats.monthlyRevenue} 
            change={15} 
            icon={TrendingUp} 
            positive={true}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Placeholder */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  Rendimiento Mensual
                </h3>
                <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                  <option>Últimos 30 días</option>
                  <option>Últimos 7 días</option>
                  <option>Este año</option>
                </select>
              </div>
              <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-float" />
                  <p className="text-blue-200">Gráfico de rendimiento</p>
                  <p className="text-blue-300 text-sm">Los datos se cargarán desde Supabase</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <RecentActivity />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            
            {/* Performance Card */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                Rendimiento
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-200">Ventas</span>
                    <span className="text-white">78%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-200">Clientes</span>
                    <span className="text-white">65%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-200">Objetivos</span>
                    <span className="text-white">92%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPrincipal;