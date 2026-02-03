
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';
import { DOIEntry, DOIStatus } from '../types';
import { CheckCircle, AlertCircle, Clock, FileText, TrendingUp } from 'lucide-react';

interface DashboardProps {
  entries: DOIEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const stats = useMemo(() => ({
    total: entries.length,
    transmitted: entries.filter(e => e.status === DOIStatus.TRANSMITTED).length,
    pending: entries.filter(e => e.status === DOIStatus.READY || e.status === DOIStatus.DRAFT).length,
    error: entries.filter(e => e.status === DOIStatus.ERROR).length,
  }), [entries]);

  const chartData = useMemo(() => [
    { name: 'Transmitidas', value: stats.transmitted, color: '#10b981' },
    { name: 'Pendentes', value: stats.pending, color: '#f59e0b' },
    { name: 'Erro', value: stats.error, color: '#ef4444' },
  ], [stats]);

  const timeData = [
    { day: '01/02', count: 12 },
    { day: '02/02', count: 18 },
    { day: '03/02', count: 15 },
    { day: '04/02', count: 25 },
    { day: '05/02', count: 20 },
    { day: '06/02', count: 32 },
    { day: '07/02', count: 28 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total de DOIs"
          value={stats.total}
          icon={<FileText className="text-slate-600" />}
          color="bg-white"
          trend="+12% que mês passado"
        />
        <StatCard
          label="Transmitidas"
          value={stats.transmitted}
          icon={<CheckCircle className="text-green-600" />}
          color="bg-white"
          trend="98.5% de sucesso"
        />
        <StatCard
          label="Pendentes"
          value={stats.pending}
          icon={<Clock className="text-yellow-600" />}
          color="bg-white"
          trend="Aguardando revisão"
        />
        <StatCard
          label="Com Erro"
          value={stats.error}
          icon={<AlertCircle className="text-red-600" />}
          color="bg-white"
          trend="Ação requerida"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Evolução de Transmissões</h3>
            <select className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2 py-1 rounded-lg">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-6">Status por Categoria</h3>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Mini-list */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg mb-6">Transmissões Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 px-4">Imóvel</th>
                <th className="pb-3 px-4">Data</th>
                <th className="pb-3 px-4">Valor</th>
                <th className="pb-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.slice(0, 5).map((entry) => (
                <tr key={entry.id} className="text-sm">
                  <td className="py-4 px-4 font-medium text-slate-900 max-w-xs truncate">{entry.propertyAddress}</td>
                  <td className="py-4 px-4 text-slate-500">{entry.date}</td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${entry.status === DOIStatus.TRANSMITTED ? 'bg-green-100 text-green-700' :
                        entry.status === DOIStatus.ERROR ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend }) => (
  <div className={`${color} p-6 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <div className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold uppercase tracking-tight">Active</div>
    </div>
    <div className="space-y-1">
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-50">
      <p className="text-xs text-slate-400 flex items-center gap-1">
        <TrendingUp size={12} className="text-green-500" />
        {trend}
      </p>
    </div>
  </div>
);

// TrendingUp now imported from lucide-react

export default Dashboard;
