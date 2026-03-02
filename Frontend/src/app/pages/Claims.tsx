import { useEffect, useMemo, useState } from 'react';
import { DataTable, Column } from '../components/DataTable';
import { DetailDrawer } from '../components/DetailDrawer';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/ui/card';
import { AlertCircle, DollarSign, Calendar, FileText, MapPin } from 'lucide-react';

// --- UI Claim type used by this page (NOT mock-data) ---
type ClaimRow = {
  id: string;          // claim_number or claim_id
  claimId: string;         // claim_id
  policyId: string;        // policy_id
  accountName: string;     // from backend join or fallback
  policyType: string;      // from backend join or fallback
  severity: string;        // display-friendly
  status: string;          // display-friendly
  amount: number;          // estimated_loss or approved_amount
  dateReported: string | null; // filed_date
  province: string;        // from backend join or fallback
  description: string;
};

const API_BASE =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000';

// --- helpers ---
function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

function formatDateSafe(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

// Map DB statuses -> UI statuses (adjust if your backend uses different words)
function toUiStatus(dbStatus: string | null | undefined) {
  const s = (dbStatus ?? '').toLowerCase();
  if (s === 'submitted') return 'Open';
  if (s === 'under_review') return 'In Review';
  if (s === 'approved') return 'Approved';
  if (s === 'denied') return 'Denied';
  if (s === 'closed') return 'Closed';
  return dbStatus ? dbStatus : '—';
}

function toUiSeverity(dbSeverity: string | null | undefined) {
  const s = (dbSeverity ?? '').toLowerCase();
  if (s === 'minor') return 'Minor';
  if (s === 'moderate') return 'Moderate';
  if (s === 'major') return 'Major';
  if (s === 'catastrophic') return 'Critical'; // your UI uses Critical
  return dbSeverity ? dbSeverity : '—';
}

// If your StatusBadge expects variants, keep your existing logic here:
function getStatusColor(status: string) {
  switch (status) {
    case 'Open': return 'warning';
    case 'In Review': return 'warning';
    case 'Approved': return 'success';
    case 'Denied': return 'danger';
    case 'Closed': return 'neutral';
    default: return 'neutral';
  }
}

function getSeverityColor(sev: string) {
  switch (sev) {
    case 'Critical': return 'danger';
    case 'Major': return 'danger';
    case 'Moderate': return 'warning';
    case 'Minor': return 'success';
    default: return 'neutral';
  }
}

export function Claims() {
  const [data, setData] = useState<ClaimRow[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch from backend
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/claims`);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`Backend /claims failed (${res.status}) ${txt}`);
        }

        const rows = await res.json();

        // Map backend -> UI
        const mapped: ClaimRow[] = (rows ?? []).map((c: any) => {
          const uiStatus = toUiStatus(c.status);
          const uiSeverity = toUiSeverity(c.severity);

          const amount =
            typeof c.approved_amount === 'number' ? c.approved_amount :
            typeof c.estimated_loss === 'number' ? c.estimated_loss :
            0;

          return {
            id: c.claim_number ?? c.claim_id,
            claimId: c.claim_id,
            policyId: c.policy_id,
            accountName: c.legal_name ?? c.account_name ?? '—',
            policyType: c.policy_type ?? '—',
            severity: uiSeverity,
            status: uiStatus,
            amount,
            dateReported: c.filed_date ?? null,
            province: c.province ?? '—',
            description: c.description ?? '',
          };
        });

        if (alive) setData(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message ?? 'Failed to load claims');
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, []);

  const columns: Column<ClaimRow>[] = [
    {
      key: 'id',
      header: 'Claim ID',
      sortable: true,
      render: (claim) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {claim.id}
        </span>
      ),
    },
    {
      key: 'accountName',
      header: 'Account',
      sortable: true,
      render: (claim) => (
        <div>
          <div className="font-medium text-slate-900">{claim.accountName}</div>
          <div className="text-xs text-slate-500">{claim.policyType}</div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (claim) => (
        <StatusBadge status={claim.severity} variant={getSeverityColor(claim.severity)} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (claim) => (
        <StatusBadge status={claim.status} variant={getStatusColor(claim.status)} />
      ),
    },
    {
      key: 'amount',
      header: 'Claim Amount',
      sortable: true,
      render: (claim) => (
        <span className="font-semibold text-slate-900">
          {formatCurrency(claim.amount)}
        </span>
      ),
    },
    {
      key: 'dateReported',
      header: 'Date Reported',
      sortable: true,
      render: (claim) => formatDateSafe(claim.dateReported),
    },
    { key: 'province', header: 'Province', sortable: true },
  ];

  const summary = useMemo(() => {
    const total = data.length;
    const open = data.filter((c) => c.status === 'Open' || c.status === 'In Review').length;
    const approved = data.filter((c) => c.status === 'Approved').length;

    const nonDenied = data.filter((c) => c.status !== 'Denied');
    const totalAmount = nonDenied.reduce((sum, c) => sum + (c.amount || 0), 0);
    const avgAmount = nonDenied.length ? totalAmount / nonDenied.length : 0;

    return { total, open, approved, avgAmount };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Claims</h1>
        <p className="text-slate-600">Track and manage insurance claims across your portfolio</p>

        {error && (
          <div className="mt-3 text-sm text-rose-600">
            Failed to load claims: {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Total Claims</div>
          <div className="text-2xl font-bold text-slate-900">{loading ? '—' : summary.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Open/In Review</div>
          <div className="text-2xl font-bold text-amber-600">{loading ? '—' : summary.open}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Approved</div>
          <div className="text-2xl font-bold text-emerald-600">{loading ? '—' : summary.approved}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Avg Claim Amount</div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? '—' : formatCurrency(summary.avgAmount)}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <DataTable
          data={data}
          columns={columns}
          onRowClick={setSelectedClaim}
          searchPlaceholder="Search claims..."
          searchKeys={['id', 'accountName', 'description']}
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: 'Open', label: 'Open' },
                { value: 'In Review', label: 'In Review' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Denied', label: 'Denied' },
                { value: 'Closed', label: 'Closed' },
              ],
            },
            {
              key: 'severity',
              label: 'Severity',
              options: [
                { value: 'Minor', label: 'Minor' },
                { value: 'Moderate', label: 'Moderate' },
                { value: 'Major', label: 'Major' },
                { value: 'Critical', label: 'Critical' },
              ],
            },
          ]}
        />
      </Card>

      <DetailDrawer
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        title={`Claim ${selectedClaim?.id || ''}`}
      >
        {selectedClaim && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Claim Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Claim ID</div>
                  <div className="font-mono font-semibold text-blue-600">{selectedClaim.id}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Status</div>
                  <StatusBadge status={selectedClaim.status} variant={getStatusColor(selectedClaim.status)} />
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-slate-600 mb-1">Account</div>
                  <div className="font-medium text-slate-900">{selectedClaim.accountName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Policy ID</div>
                  <div className="font-mono text-sm text-blue-600">{selectedClaim.policyId}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Policy Type</div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{selectedClaim.policyType}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Province</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{selectedClaim.province}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Date Reported</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{formatDateSafe(selectedClaim.dateReported)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Severity Assessment</h3>
              <Card className="p-4 bg-gradient-to-br from-rose-50 to-amber-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-slate-900">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Severity Level</div>
                    <div className="text-2xl font-bold text-slate-900">{selectedClaim.severity}</div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Financial Impact</h3>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Claim Amount</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatCurrency(selectedClaim.amount)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Claim Description</h3>
              <Card className="p-4">
                <p className="text-slate-700 leading-relaxed">{selectedClaim.description}</p>
              </Card>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}