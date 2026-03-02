import { useState } from 'react';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, Download, TrendingUp, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { claims, policies, accounts, formatCurrency } from '../data/mock-data';
import { Skeleton } from '../components/ui/skeleton';

export function Reports() {
  const [reportType, setReportType] = useState('claims-overview');
  const [dateRange, setDateRange] = useState('7months');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [loading, setLoading] = useState(false);

  const handleReportChange = (value: string) => {
    setLoading(true);
    setReportType(value);
    setTimeout(() => setLoading(false), 800);
  };

  const handleDateRangeChange = (value: string) => {
    setLoading(true);
    setDateRange(value);
    setTimeout(() => setLoading(false), 600);
  };

  // Report data
  const claimsBySeverity = [
    { name: 'Minor', value: 3, color: '#10b981' },
    { name: 'Moderate', value: 4, color: '#f59e0b' },
    { name: 'Major', value: 4, color: '#ef4444' },
    { name: 'Critical', value: 1, color: '#991b1b' },
  ];

  const monthlyClaimsTrend = [
    { month: 'Aug', claims: 8, amount: 245000 },
    { month: 'Sep', claims: 12, amount: 385000 },
    { month: 'Oct', claims: 10, amount: 298000 },
    { month: 'Nov', claims: 15, amount: 520000 },
    { month: 'Dec', claims: 9, amount: 275000 },
    { month: 'Jan', claims: 11, amount: 412000 },
    { month: 'Feb', claims: 12, amount: 478000 },
  ];

  const premiumByType = [
    { type: 'Property', premium: 2105300, policies: 8 },
    { type: 'Liability', premium: 1586000, policies: 7 },
    { type: 'Auto', premium: 465700, policies: 3 },
    { type: 'Marine', premium: 380000, policies: 2 },
    { type: 'Specialty', premium: 2400000, policies: 2 },
  ];

  const riskDistribution = [
    { range: '0-40', count: 2, color: '#10b981' },
    { range: '41-60', count: 3, color: '#3b82f6' },
    { range: '61-80', count: 4, color: '#f59e0b' },
    { range: '81-100', count: 3, color: '#ef4444' },
  ];

  const provinceAnalysis = [
    { province: 'ON', accounts: 3, premium: 253500, claims: 2 },
    { province: 'BC', accounts: 2, premium: 904000, claims: 3 },
    { province: 'AB', accounts: 1, premium: 1250000, claims: 1 },
    { province: 'QC', accounts: 1, premium: 678000, claims: 2 },
    { province: 'NS', accounts: 1, premium: 156000, claims: 1 },
    { province: 'NB', accounts: 1, premium: 425000, claims: 1 },
    { province: 'MB', accounts: 1, premium: 542000, claims: 1 },
    { province: 'NT', accounts: 1, premium: 1850000, claims: 1 },
  ];

  const performanceMetrics = [
    { month: 'Aug', retention: 94, satisfaction: 88 },
    { month: 'Sep', retention: 96, satisfaction: 90 },
    { month: 'Oct', retention: 95, satisfaction: 89 },
    { month: 'Nov', retention: 93, satisfaction: 87 },
    { month: 'Dec', retention: 97, satisfaction: 92 },
    { month: 'Jan', retention: 96, satisfaction: 91 },
    { month: 'Feb', retention: 98, satisfaction: 93 },
  ];

  const renderReport = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-[400px]" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      );
    }

    switch (reportType) {
      case 'claims-overview':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Claims Trend Analysis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyClaimsTrend}>
                  <defs>
                    <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number, name: string) => {
                    if (name === 'amount') return [formatCurrency(value), 'Total Amount'];
                    return [value, 'Claims Count'];
                  }} />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="claims"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorClaims)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Claims by Severity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={claimsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {claimsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Claims Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Total Claims</span>
                    <span className="text-2xl font-bold text-slate-900">{claims.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                    <span className="text-emerald-700">Approved</span>
                    <span className="text-2xl font-bold text-emerald-700">
                      {claims.filter((c) => c.status === 'Approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <span className="text-amber-700">In Review</span>
                    <span className="text-2xl font-bold text-amber-700">
                      {claims.filter((c) => c.status === 'In Review' || c.status === 'Open').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                    <span className="text-rose-700">Total Amount</span>
                    <span className="text-2xl font-bold text-rose-700">
                      {formatCurrency(claims.reduce((sum, c) => sum + c.amount, 0))}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'premium-analysis':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Premium Distribution by Policy Type</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={premiumByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value?: number) => formatCurrency(value ?? 0)} />
                  <Legend />
                  <Bar dataKey="premium" fill="#3b82f6" name="Total Premium" />
                  <Bar dataKey="policies" fill="#10b981" name="Policy Count" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Province Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={provinceAnalysis} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <YAxis type="category" dataKey="province" width={50} />
                    <Tooltip formatter={(value?: number) => formatCurrency(value ?? 0)} />
                    <Bar dataKey="premium" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Premium Summary</h3>
                <div className="space-y-4">
                  {premiumByType.map((item) => (
                    <div key={item.type} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-slate-900">{item.type}</span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.premium)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>{item.policies} policies</span>
                        <span>{((item.premium / 7437000) * 100).toFixed(1)}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'risk-assessment':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Risk Score Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Number of Accounts">
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-emerald-700">Low Risk</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-700 mb-2">
                    {accounts.filter((a) => a.riskScore < 60).length}
                  </div>
                  <div className="text-sm text-slate-600">Accounts (Score 0-60)</div>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-amber-700">Medium Risk</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-700 mb-2">
                    {accounts.filter((a) => a.riskScore >= 60 && a.riskScore < 85).length}
                  </div>
                  <div className="text-sm text-slate-600">Accounts (Score 60-84)</div>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4 text-rose-700">High Risk</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-rose-700 mb-2">
                    {accounts.filter((a) => a.riskScore >= 85).length}
                  </div>
                  <div className="text-sm text-slate-600">Accounts (Score 85+)</div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Key Performance Indicators</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value?: number) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Client Retention Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    name="Customer Satisfaction"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Portfolio Health</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-emerald-900">Active Accounts</span>
                      <span className="text-2xl font-bold text-emerald-700">
                        {accounts.filter((a) => a.status === 'Active').length}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-700 mt-1">
                      {((accounts.filter((a) => a.status === 'Active').length / accounts.length) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-900">Active Policies</span>
                      <span className="text-2xl font-bold text-blue-700">
                        {policies.filter((p) => p.status === 'Active').length}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      {((policies.filter((p) => p.status === 'Active').length / policies.length) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-purple-900">Claims Closure Rate</span>
                      <span className="text-2xl font-bold text-purple-700">
                        {((claims.filter((c) => c.status === 'Closed').length / claims.length) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-purple-700 mt-1">
                      {claims.filter((c) => c.status === 'Closed').length} of {claims.length} claims closed
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Recent Achievements</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Retention Rate Increased</div>
                      <div className="text-sm text-slate-600">Up to 98% in February 2026</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Premium Growth</div>
                      <div className="text-sm text-slate-600">8% increase year-over-year</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Customer Satisfaction</div>
                      <div className="text-sm text-slate-600">Reached 93% in February 2026</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
        <p className="text-slate-600">
          Generate comprehensive reports and analyze insurance portfolio performance
        </p>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Report Type
            </label>
            <Select value={reportType} onValueChange={handleReportChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claims-overview">Claims Overview</SelectItem>
                <SelectItem value="premium-analysis">Premium Analysis</SelectItem>
                <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                <SelectItem value="performance">Performance Metrics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Date Range
            </label>
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="7months">Last 7 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 md:items-end">
            <Button variant="outline" className="flex-1 md:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
}
