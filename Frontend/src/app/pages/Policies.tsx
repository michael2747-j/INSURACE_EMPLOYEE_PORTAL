import { useState, useEffect } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { DetailDrawer } from '../components/DetailDrawer';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate, getStatusColor } from '../data/mock-data';
import { Card } from '../components/ui/card';
import { FileText, Calendar, DollarSign, MapPin, Building2, AlertCircle } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { api } from '@/lib/api';

interface Policy {
  policy_id: string;
  account_id: string;
  policy_number: string;
  policy_type: string;
  status: string;
  effective_date: string;
  expiry_date: string;
  premium_amount: number;
  payment_frequency: string;
  created_at: string;
  updated_at: string;
}

interface PolicyDetail extends Policy {
  account?: {
    legal_name: string;
    account_number: string;
    province: string;
  };
  coverages?: any[];
}

export function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch policies from API
  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getPolicies({ limit: 100 });
        setPolicies(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch policies:', err);
        setError('Failed to load policies. Please check if the backend is running.');
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // Fetch policy details when selected
  const handleRowClick = async (policy: Policy) => {
    try {
      setLoadingDetail(true);
      const details = await api.getPolicyDetail(policy.policy_id);
      setSelectedPolicy(details);
      setLoadingDetail(false);
    } catch (err) {
      console.error('Failed to fetch policy details:', err);
      setError('Failed to load policy details');
      setLoadingDetail(false);
    }
  };

  // Map status for display
  const mapStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Check if policy is expiring soon (within 90 days)
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  };

  const columns: Column<Policy>[] = [
    {
      key: 'policy_number',
      header: 'Policy Number',
      sortable: true,
      render: (policy) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {policy.policy_number}
        </span>
      ),
    },
    {
      key: 'policy_type',
      header: 'Type',
      sortable: true,
      render: (policy) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          <FileText className="w-3 h-3" />
          {policy.policy_type}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (policy) => (
        <StatusBadge 
          status={mapStatus(policy.status)} 
          variant={getStatusColor(mapStatus(policy.status))} 
        />
      ),
    },
    {
      key: 'premium_amount',
      header: 'Premium',
      sortable: true,
      render: (policy) => (
        <div>
          <div className="font-semibold text-slate-900">
            {formatCurrency(policy.premium_amount)}
          </div>
          <div className="text-xs text-slate-500">{policy.payment_frequency}</div>
        </div>
      ),
    },
    {
      key: 'effective_date',
      header: 'Effective Date',
      sortable: true,
      render: (policy) => (
        <span className="text-sm text-slate-600">
          {formatDate(new Date(policy.effective_date))}
        </span>
      ),
    },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
      sortable: true,
      render: (policy) => {
        const expiringSoon = isExpiringSoon(policy.expiry_date);
        return (
          <div className={expiringSoon ? 'text-amber-600 font-medium' : 'text-slate-600'}>
            {formatDate(new Date(policy.expiry_date))}
            {expiringSoon && (
              <div className="text-xs">⚠️ Expiring soon</div>
            )}
          </div>
        );
      },
    },
  ];

  // Calculate metrics
  const activePolicies = policies.filter((p) => p.status === 'active').length;
  const expiringSoon = policies.filter((p) => isExpiringSoon(p.expiry_date)).length;
  const totalPremium = policies.reduce((sum, p) => sum + parseFloat(p.premium_amount.toString()), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Policies</h1>
          <p className="text-slate-600">Loading policies...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Policies</h1>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Error Loading Policies</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Policies</h1>
        <p className="text-slate-600">
          View and manage all active insurance policies
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Total Policies</div>
          <div className="text-2xl font-bold text-slate-900">{policies.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-emerald-600">{activePolicies}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Expiring Soon</div>
          <div className="text-2xl font-bold text-amber-600">{expiringSoon}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Total Premium</div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(totalPremium)}
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="p-6">
        <DataTable
          data={policies}
          columns={columns}
          onRowClick={handleRowClick}
          searchPlaceholder="Search policies..."
          searchKeys={['policy_number', 'policy_type']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'quote', label: 'Quote' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'expired', label: 'Expired' },
              ],
            },
            {
              key: 'policy_type',
              label: 'Type',
              options: [
                { value: 'auto', label: 'Auto' },
                { value: 'home', label: 'Home' },
                { value: 'life', label: 'Life' },
                { value: 'health', label: 'Health' },
                { value: 'business', label: 'Business' },
                { value: 'umbrella', label: 'Umbrella' },
              ],
            },
          ]}
        />
      </Card>

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
        title={`Policy ${selectedPolicy?.policy_number || ''}`}
      >
        {loadingDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        ) : selectedPolicy ? (
          <div className="space-y-6">
            {/* Policy Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Policy Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Policy Number</div>
                  <div className="font-mono font-semibold text-blue-600">
                    {selectedPolicy.policy_number}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Status</div>
                  <StatusBadge
                    status={mapStatus(selectedPolicy.status)}
                    variant={getStatusColor(mapStatus(selectedPolicy.status))}
                  />
                </div>
                {selectedPolicy.account && (
                  <div className="col-span-2">
                    <div className="text-sm text-slate-600 mb-1">Account</div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="font-medium">{selectedPolicy.account.legal_name}</div>
                        <div className="text-xs text-slate-500 font-mono">
                          {selectedPolicy.account.account_number}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-slate-600 mb-1">Policy Type</div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{selectedPolicy.policy_type}</span>
                  </div>
                </div>
                {selectedPolicy.account && (
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Province</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{selectedPolicy.account.province}</span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-slate-600 mb-1">Payment Frequency</div>
                  <div className="font-medium">{selectedPolicy.payment_frequency}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Created</div>
                  <div className="text-sm">{formatDate(new Date(selectedPolicy.created_at))}</div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Annual Premium</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(selectedPolicy.premium_amount)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Paid {selectedPolicy.payment_frequency}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Coverage Period */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Coverage Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div className="text-sm text-slate-600">Effective Date</div>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {formatDate(new Date(selectedPolicy.effective_date))}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <div className="text-sm text-slate-600">Expiry Date</div>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {formatDate(new Date(selectedPolicy.expiry_date))}
                  </div>
                  {isExpiringSoon(selectedPolicy.expiry_date) && (
                    <div className="mt-2 text-xs text-amber-600 font-medium">
                      ⚠️ Expiring soon - Renewal required
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Coverages */}
            {selectedPolicy.coverages && selectedPolicy.coverages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Coverage Details</h3>
                <div className="space-y-3">
                  {selectedPolicy.coverages.map((coverage: any) => (
                    <Card key={coverage.coverage_id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-slate-900">{coverage.coverage_type}</div>
                        <div className="text-sm font-semibold text-blue-600">
                          {formatCurrency(coverage.premium_amount)}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-600">Limit: </span>
                          <span className="font-medium">
                            {formatCurrency(coverage.coverage_limit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Deductible: </span>
                          <span className="font-medium">
                            {formatCurrency(coverage.deductible)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => window.open(`http://localhost:8000/docs#/default/get_policy_policies__policy_id__get`, '_blank')}
              >
                View in API Docs
              </button>
              <button className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                Generate Report
              </button>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </div>
  );
}
