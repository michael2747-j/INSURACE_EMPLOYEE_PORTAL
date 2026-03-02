import { useState, useEffect } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { DetailDrawer } from '../components/DetailDrawer';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate, getStatusColor } from '../data/mock-data';
import { Card } from '../components/ui/card';
import { Building2, MapPin, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { api } from '@/lib/api';

interface Account {
  account_id: string;
  account_number: string;
  legal_name: string;
  account_type: string;
  province: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AccountDetail extends Account {
  contacts?: any[];
  policies?: any[];
}

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAccounts({ limit: 100 });
        setAccounts(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
        setError('Failed to load accounts. Please check if the backend is running.');
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch account details when selected
  const handleRowClick = async (account: Account) => {
    try {
      setLoadingDetail(true);
      const details = await api.getAccountDetail(account.account_id);
      setSelectedAccount(details);
      setLoadingDetail(false);
    } catch (err) {
      console.error('Failed to fetch account details:', err);
      setError('Failed to load account details');
      setLoadingDetail(false);
    }
  };

  // Calculate metrics
  const activeAccounts = accounts.filter((a) => a.status === 'active').length;
  const totalAccounts = accounts.length;

  // Map status for display
  const mapStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const columns: Column<Account>[] = [
    {
      key: 'account_number',
      header: 'Account Number',
      sortable: true,
      render: (account) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {account.account_number}
        </span>
      ),
    },
    {
      key: 'legal_name',
      header: 'Account Name',
      sortable: true,
      render: (account) => (
        <div>
          <div className="font-medium text-slate-900">{account.legal_name}</div>
          <div className="text-xs text-slate-500">{account.account_type}</div>
        </div>
      ),
    },
    {
      key: 'province',
      header: 'Province',
      sortable: true,
      render: (account) => (
        <span className="font-medium">{account.province}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (account) => (
        <span className="text-sm text-slate-600">{account.email || 'N/A'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (account) => (
        <StatusBadge 
          status={mapStatus(account.status)} 
          variant={getStatusColor(mapStatus(account.status))} 
        />
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (account) => (
        <span className="text-sm text-slate-600">
          {formatDate(new Date(account.created_at))}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Accounts</h1>
          <p className="text-slate-600">Loading accounts...</p>
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Accounts</h1>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Error Loading Accounts</p>
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Accounts</h1>
        <p className="text-slate-600">
          Manage and monitor all insurance accounts across your portfolio
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Total Accounts</div>
          <div className="text-2xl font-bold text-slate-900">{totalAccounts}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-emerald-600">{activeAccounts}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Inactive</div>
          <div className="text-2xl font-bold text-slate-600">
            {accounts.filter((a) => a.status !== 'active').length}
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-sm text-blue-800 mb-1">Data Source</div>
          <div className="text-sm font-semibold text-blue-900">Live Database</div>
          <div className="text-xs text-blue-700 mt-1">PostgreSQL via API</div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="p-6">
        <DataTable
          data={accounts}
          columns={columns}
          onRowClick={handleRowClick}
          searchPlaceholder="Search accounts..."
          searchKeys={['account_number', 'legal_name', 'province', 'email']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'closed', label: 'Closed' },
              ],
            },
            {
              key: 'account_type',
              label: 'Type',
              options: [
                { value: 'business', label: 'Business' },
                { value: 'individual', label: 'Individual' },
              ],
            },
            {
              key: 'province',
              label: 'Province',
              options: [
                { value: 'ON', label: 'Ontario' },
                { value: 'BC', label: 'British Columbia' },
                { value: 'QC', label: 'Quebec' },
                { value: 'AB', label: 'Alberta' },
              ],
            },
          ]}
        />
      </Card>

      {/* Detail Drawer */}
      <DetailDrawer
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        title={selectedAccount?.legal_name || ''}
      >
        {loadingDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        ) : selectedAccount ? (
          <div className="space-y-6">
            {/* Account Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Account Number</div>
                  <div className="font-mono font-semibold text-blue-600">
                    {selectedAccount.account_number}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Status</div>
                  <StatusBadge
                    status={mapStatus(selectedAccount.status)}
                    variant={getStatusColor(mapStatus(selectedAccount.status))}
                  />
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Account Type</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{selectedAccount.account_type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Province</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{selectedAccount.province}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Email</div>
                  <div className="text-sm font-medium">{selectedAccount.email || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Phone</div>
                  <div className="text-sm font-medium">{selectedAccount.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Created</div>
                  <div className="font-medium">{formatDate(new Date(selectedAccount.created_at))}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Last Updated</div>
                  <div className="font-medium">{formatDate(new Date(selectedAccount.updated_at))}</div>
                </div>
              </div>
            </div>

            {/* Associated Policies */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Associated Policies</h3>
              {!selectedAccount.policies || selectedAccount.policies.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No policies found for this account
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedAccount.policies.map((policy: any) => (
                    <Card key={policy.policy_id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-mono font-semibold text-blue-600">
                            {policy.policy_number}
                          </div>
                          <div className="text-sm text-slate-600">{policy.policy_type}</div>
                        </div>
                        <StatusBadge
                          status={mapStatus(policy.status)}
                          variant={getStatusColor(mapStatus(policy.status))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Premium: </span>
                          <span className="font-semibold">
                            {formatCurrency(policy.premium_amount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Expires: </span>
                          <span className="font-semibold">
                            {formatDate(new Date(policy.expiry_date))}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Contacts */}
            {selectedAccount.contacts && selectedAccount.contacts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacts</h3>
                <div className="space-y-3">
                  {selectedAccount.contacts.map((contact: any) => (
                    <Card key={contact.contact_id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-slate-900">
                            {contact.first_name} {contact.last_name}
                            {contact.is_primary && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-600">{contact.contact_type}</div>
                        </div>
                        <div className="text-right text-sm">
                          <div>{contact.email || 'N/A'}</div>
                          <div className="text-slate-500">{contact.phone || 'N/A'}</div>
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
                onClick={() => window.open(`http://localhost:8000/docs#/default/get_account_accounts__account_id__get`, '_blank')}
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