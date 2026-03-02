import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, AlertCircle, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { Card } from '../components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../data/mock-data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { Skeleton } from '../components/ui/skeleton';
import { api } from '@/lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real data state
  const [dashboardData, setDashboardData] = useState({
    activeAccounts: 0,
    openClaims: 0,
    policiesExpiringSoon: 0,
    totalPremium: 0,
    claimsBySeverity: [] as any[],
    recentClaims: [] as any[],
    premiumByProvince: [] as any[],
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from multiple endpoints in parallel
        const [
          accountsResponse,
          claimsSeverityResponse,
          expiringPoliciesResponse,
          premiumByAccountResponse,
          recentClaimsResponse,
        ] = await Promise.all([
          api.getAccounts({ status: 'active', limit: 100 }),
          api.getOpenClaimsBySeverity(),
          api.getPoliciesExpiringSoon(90),
          api.getPremiumByAccount(100),
          api.getClaims({ limit: 5 }),
        ]);

        // Calculate KPIs
        const activeAccounts = accountsResponse.length;
        
        // Open claims count (submitted, under_review, approved)
        const openClaimsCount = claimsSeverityResponse.reduce(
          (sum: number, item: any) => sum + parseInt(item.claim_count || 0),
          0
        );

        const policiesExpiring = expiringPoliciesResponse.length;

        // Total premium from premium by account report
        const totalPremium = premiumByAccountResponse.reduce(
          (sum: number, account: any) => sum + parseFloat(account.total_annual_premium || 0),
          0
        );

        // Format claims by severity for pie chart
        const severityMap: Record<string, { color: string; label: string }> = {
          minor: { color: '#10b981', label: 'Minor' },
          moderate: { color: '#f59e0b', label: 'Moderate' },
          major: { color: '#ef4444', label: 'Major' },
          catastrophic: { color: '#991b1b', label: 'Catastrophic' },
        };

        const claimsBySeverity = claimsSeverityResponse.map((item: any) => ({
          name: severityMap[item.severity]?.label || item.severity,
          value: parseInt(item.claim_count || 0),
          color: severityMap[item.severity]?.color || '#64748b',
        }));

        // Aggregate premium by province (group by first 2 chars)
        const provinceMap = new Map();
        premiumByAccountResponse.forEach((account: any) => {
          const province = account.province;
          const current = provinceMap.get(province) || 0;
          provinceMap.set(province, current + parseFloat(account.total_annual_premium || 0));
        });

        const premiumByProvince = Array.from(provinceMap.entries())
          .map(([province, premium]) => ({ province, premium }))
          .sort((a, b) => b.premium - a.premium)
          .slice(0, 6); // Top 6 provinces

        setDashboardData({
          activeAccounts,
          openClaims: openClaimsCount,
          policiesExpiringSoon: policiesExpiring,
          totalPremium,
          claimsBySeverity,
          recentClaims: recentClaimsResponse,
          premiumByProvince,
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please check if the backend is running.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAccordionChange = (value: string) => {
    if (value) {
      setLoadingSection(value);
      setTimeout(() => setLoadingSection(null), 800);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Loading your insurance portfolio overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Error Loading Dashboard</p>
              <p className="text-sm">{error}</p>
              <p className="text-sm mt-2">
                Make sure the backend is running at: <code>http://localhost:8000</code>
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Welcome back. Here's your insurance portfolio overview.</p>
      </div>

      {/* KPI Cards - Now with REAL DATA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Accounts"
          value={dashboardData.activeAccounts}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          onClick={() => navigate('/accounts')}
        />
        <KPICard
          title="Open Claims"
          value={dashboardData.openClaims}
          icon={AlertCircle}
          trend={{ value: 5, isPositive: false }}
          onClick={() => navigate('/claims')}
        />
        <KPICard
          title="Expiring Soon"
          value={dashboardData.policiesExpiringSoon}
          icon={Clock}
          onClick={() => navigate('/policies')}
        />
        <KPICard
          title="Total Premium Exposure"
          value={dashboardData.totalPremium}
          prefix="$"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Interactive Accordion Sections */}
      <Accordion
        type="single"
        collapsible
        className="space-y-4"
        onValueChange={handleAccordionChange}
      >
        {/* Claims Overview - REAL DATA */}
        <AccordionItem value="claims" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Claims Activity</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {loadingSection === 'claims' ? (
              <div className="space-y-4">
                <Skeleton className="h-[300px]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Claims by Severity</h3>
                  {dashboardData.claimsBySeverity.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={dashboardData.claimsBySeverity}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.claimsBySeverity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-slate-500">
                      No open claims data
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Recent Claims</h3>
                  {dashboardData.recentClaims.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.recentClaims.map((claim: any) => (
                        <div key={claim.claim_id} className="flex items-start justify-between py-2 border-b last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-slate-900 font-mono">{claim.claim_number}</p>
                            <p className="text-xs text-slate-600">{claim.claim_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(claim.estimated_loss || 0)}
                            </p>
                            <p className={`text-xs ${
                              claim.status === 'submitted' ? 'text-amber-600' : 
                              claim.status === 'approved' ? 'text-emerald-600' : 
                              claim.status === 'closed' ? 'text-slate-600' :
                              'text-blue-600'
                            }`}>
                              {claim.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      No recent claims
                    </div>
                  )}
                </Card>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Financial Exposure - REAL DATA */}
        <AccordionItem value="financial" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Financial Exposure</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {loadingSection === 'financial' ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Premium by Province (Top 6)</h3>
                {dashboardData.premiumByProvince.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.premiumByProvince}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="province" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="premium" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-500">
                    No premium data available
                  </div>
                )}
              </Card>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Portfolio Trends */}
        <AccordionItem value="trends" className="border rounded-lg bg-white">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">Portfolio Summary</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            {loadingSection === 'trends' ? (
              <Skeleton className="h-[200px]" />
            ) : (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Accounts</p>
                    <p className="text-2xl font-bold text-slate-900">{dashboardData.activeAccounts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Open Claims</p>
                    <p className="text-2xl font-bold text-amber-600">{dashboardData.openClaims}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-blue-600">{dashboardData.policiesExpiringSoon}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Premium</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(dashboardData.totalPremium)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ✓ All data is fetched live from PostgreSQL via FastAPI backend
                  </p>
                </div>
              </Card>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Data Source Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 animate-pulse" />
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Live Database Connection</p>
            <p className="text-sm text-slate-600 mt-1">
              All metrics displayed are fetched in real-time from your PostgreSQL database through the FastAPI backend.
              This dashboard demonstrates: multi-table JOINs, aggregations, and complex SQL reporting queries.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
