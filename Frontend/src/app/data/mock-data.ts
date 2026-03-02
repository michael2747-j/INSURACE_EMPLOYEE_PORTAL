// Mock data for the insurance platform

export interface Account {
  id: string;
  name: string;
  type: 'Corporate' | 'Individual' | 'Government';
  status: 'Active' | 'Inactive' | 'Pending';
  province: string;
  totalPremium: number;
  policyCount: number;
  lastUpdated: Date;
  riskScore: number;
}

export interface Policy {
  id: string;
  accountId: string;
  accountName: string;
  type: 'Property' | 'Liability' | 'Auto' | 'Marine' | 'Specialty';
  status: 'Active' | 'Expired' | 'Pending Renewal' | 'Cancelled';
  premium: number;
  effectiveDate: Date;
  expiryDate: Date;
  province: string;
}

export interface Claim {
  id: string;
  policyId: string;
  accountName: string;
  policyType: string;
  severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  status: 'Open' | 'In Review' | 'Approved' | 'Denied' | 'Closed';
  amount: number;
  dateReported: Date;
  province: string;
  description: string;
}

// Generate mock accounts
export const accounts: Account[] = [
  {
    id: 'ACC001',
    name: 'Maple Industries Ltd.',
    type: 'Corporate',
    status: 'Active',
    province: 'ON',
    totalPremium: 245000,
    policyCount: 8,
    lastUpdated: new Date('2026-02-08'),
    riskScore: 72,
  },
  {
    id: 'ACC002',
    name: 'Pacific Transport Inc.',
    type: 'Corporate',
    status: 'Active',
    province: 'BC',
    totalPremium: 892000,
    policyCount: 15,
    lastUpdated: new Date('2026-02-09'),
    riskScore: 85,
  },
  {
    id: 'ACC003',
    name: 'Alberta Energy Solutions',
    type: 'Corporate',
    status: 'Active',
    province: 'AB',
    totalPremium: 1250000,
    policyCount: 12,
    lastUpdated: new Date('2026-02-10'),
    riskScore: 91,
  },
  {
    id: 'ACC004',
    name: 'Maritime Fisheries Co-op',
    type: 'Corporate',
    status: 'Active',
    province: 'NS',
    totalPremium: 156000,
    policyCount: 6,
    lastUpdated: new Date('2026-02-07'),
    riskScore: 68,
  },
  {
    id: 'ACC005',
    name: 'Prairie Agriculture Group',
    type: 'Corporate',
    status: 'Pending',
    province: 'SK',
    totalPremium: 320000,
    policyCount: 9,
    lastUpdated: new Date('2026-02-10'),
    riskScore: 75,
  },
  {
    id: 'ACC006',
    name: 'Quebec Manufacturing Corp.',
    type: 'Corporate',
    status: 'Active',
    province: 'QC',
    totalPremium: 678000,
    policyCount: 11,
    lastUpdated: new Date('2026-02-09'),
    riskScore: 82,
  },
  {
    id: 'ACC007',
    name: 'Northern Mining Operations',
    type: 'Corporate',
    status: 'Active',
    province: 'NT',
    totalPremium: 1850000,
    policyCount: 7,
    lastUpdated: new Date('2026-02-08'),
    riskScore: 94,
  },
  {
    id: 'ACC008',
    name: 'City of Winnipeg',
    type: 'Government',
    status: 'Active',
    province: 'MB',
    totalPremium: 542000,
    policyCount: 18,
    lastUpdated: new Date('2026-02-10'),
    riskScore: 65,
  },
  {
    id: 'ACC009',
    name: 'John Mitchell',
    type: 'Individual',
    status: 'Active',
    province: 'ON',
    totalPremium: 8500,
    policyCount: 2,
    lastUpdated: new Date('2026-02-06'),
    riskScore: 45,
  },
  {
    id: 'ACC010',
    name: 'Sarah Chen',
    type: 'Individual',
    status: 'Active',
    province: 'BC',
    totalPremium: 12000,
    policyCount: 3,
    lastUpdated: new Date('2026-02-09'),
    riskScore: 52,
  },
  {
    id: 'ACC011',
    name: 'Atlantic Shipping Lines',
    type: 'Corporate',
    status: 'Active',
    province: 'NB',
    totalPremium: 425000,
    policyCount: 5,
    lastUpdated: new Date('2026-02-08'),
    riskScore: 79,
  },
  {
    id: 'ACC012',
    name: 'Toronto Tech Hub',
    type: 'Corporate',
    status: 'Inactive',
    province: 'ON',
    totalPremium: 0,
    policyCount: 0,
    lastUpdated: new Date('2026-01-15'),
    riskScore: 0,
  },
];

// Generate mock policies
export const policies: Policy[] = [
  {
    id: 'POL001',
    accountId: 'ACC001',
    accountName: 'Maple Industries Ltd.',
    type: 'Property',
    status: 'Active',
    premium: 125000,
    effectiveDate: new Date('2025-06-01'),
    expiryDate: new Date('2026-06-01'),
    province: 'ON',
  },
  {
    id: 'POL002',
    accountId: 'ACC001',
    accountName: 'Maple Industries Ltd.',
    type: 'Liability',
    status: 'Active',
    premium: 85000,
    effectiveDate: new Date('2025-06-01'),
    expiryDate: new Date('2026-06-01'),
    province: 'ON',
  },
  {
    id: 'POL003',
    accountId: 'ACC002',
    accountName: 'Pacific Transport Inc.',
    type: 'Auto',
    status: 'Active',
    premium: 456000,
    effectiveDate: new Date('2025-09-01'),
    expiryDate: new Date('2026-09-01'),
    province: 'BC',
  },
  {
    id: 'POL004',
    accountId: 'ACC002',
    accountName: 'Pacific Transport Inc.',
    type: 'Liability',
    status: 'Active',
    premium: 278000,
    effectiveDate: new Date('2025-09-01'),
    expiryDate: new Date('2026-09-01'),
    province: 'BC',
  },
  {
    id: 'POL005',
    accountId: 'ACC003',
    accountName: 'Alberta Energy Solutions',
    type: 'Specialty',
    status: 'Active',
    premium: 950000,
    effectiveDate: new Date('2025-12-01'),
    expiryDate: new Date('2026-12-01'),
    province: 'AB',
  },
  {
    id: 'POL006',
    accountId: 'ACC003',
    accountName: 'Alberta Energy Solutions',
    type: 'Property',
    status: 'Active',
    premium: 300000,
    effectiveDate: new Date('2025-12-01'),
    expiryDate: new Date('2026-12-01'),
    province: 'AB',
  },
  {
    id: 'POL007',
    accountId: 'ACC004',
    accountName: 'Maritime Fisheries Co-op',
    type: 'Marine',
    status: 'Pending Renewal',
    premium: 95000,
    effectiveDate: new Date('2025-03-01'),
    expiryDate: new Date('2026-03-01'),
    province: 'NS',
  },
  {
    id: 'POL008',
    accountId: 'ACC004',
    accountName: 'Maritime Fisheries Co-op',
    type: 'Property',
    status: 'Active',
    premium: 61000,
    effectiveDate: new Date('2025-03-01'),
    expiryDate: new Date('2026-03-01'),
    province: 'NS',
  },
  {
    id: 'POL009',
    accountId: 'ACC006',
    accountName: 'Quebec Manufacturing Corp.',
    type: 'Property',
    status: 'Active',
    premium: 425000,
    effectiveDate: new Date('2025-07-15'),
    expiryDate: new Date('2026-07-15'),
    province: 'QC',
  },
  {
    id: 'POL010',
    accountId: 'ACC006',
    accountName: 'Quebec Manufacturing Corp.',
    type: 'Liability',
    status: 'Active',
    premium: 253000,
    effectiveDate: new Date('2025-07-15'),
    expiryDate: new Date('2026-07-15'),
    province: 'QC',
  },
  {
    id: 'POL011',
    accountId: 'ACC007',
    accountName: 'Northern Mining Operations',
    type: 'Specialty',
    status: 'Active',
    premium: 1450000,
    effectiveDate: new Date('2025-10-01'),
    expiryDate: new Date('2026-10-01'),
    province: 'NT',
  },
  {
    id: 'POL012',
    accountId: 'ACC007',
    accountName: 'Northern Mining Operations',
    type: 'Liability',
    status: 'Active',
    premium: 400000,
    effectiveDate: new Date('2025-10-01'),
    expiryDate: new Date('2026-10-01'),
    province: 'NT',
  },
  {
    id: 'POL013',
    accountId: 'ACC008',
    accountName: 'City of Winnipeg',
    type: 'Property',
    status: 'Active',
    premium: 312000,
    effectiveDate: new Date('2025-01-01'),
    expiryDate: new Date('2026-01-01'),
    province: 'MB',
  },
  {
    id: 'POL014',
    accountId: 'ACC008',
    accountName: 'City of Winnipeg',
    type: 'Liability',
    status: 'Active',
    premium: 230000,
    effectiveDate: new Date('2025-01-01'),
    expiryDate: new Date('2026-01-01'),
    province: 'MB',
  },
  {
    id: 'POL015',
    accountId: 'ACC009',
    accountName: 'John Mitchell',
    type: 'Auto',
    status: 'Active',
    premium: 4200,
    effectiveDate: new Date('2025-08-01'),
    expiryDate: new Date('2026-08-01'),
    province: 'ON',
  },
  {
    id: 'POL016',
    accountId: 'ACC009',
    accountName: 'John Mitchell',
    type: 'Property',
    status: 'Active',
    premium: 4300,
    effectiveDate: new Date('2025-08-01'),
    expiryDate: new Date('2026-08-01'),
    province: 'ON',
  },
  {
    id: 'POL017',
    accountId: 'ACC010',
    accountName: 'Sarah Chen',
    type: 'Auto',
    status: 'Pending Renewal',
    premium: 5500,
    effectiveDate: new Date('2025-02-15'),
    expiryDate: new Date('2026-02-15'),
    province: 'BC',
  },
  {
    id: 'POL018',
    accountId: 'ACC010',
    accountName: 'Sarah Chen',
    type: 'Property',
    status: 'Active',
    premium: 6500,
    effectiveDate: new Date('2025-02-15'),
    expiryDate: new Date('2026-02-15'),
    province: 'BC',
  },
  {
    id: 'POL019',
    accountId: 'ACC011',
    accountName: 'Atlantic Shipping Lines',
    type: 'Marine',
    status: 'Active',
    premium: 285000,
    effectiveDate: new Date('2025-11-01'),
    expiryDate: new Date('2026-11-01'),
    province: 'NB',
  },
  {
    id: 'POL020',
    accountId: 'ACC011',
    accountName: 'Atlantic Shipping Lines',
    type: 'Liability',
    status: 'Active',
    premium: 140000,
    effectiveDate: new Date('2025-11-01'),
    expiryDate: new Date('2026-11-01'),
    province: 'NB',
  },
];

// Generate mock claims
export const claims: Claim[] = [
  {
    id: 'CLM001',
    policyId: 'POL001',
    accountName: 'Maple Industries Ltd.',
    policyType: 'Property',
    severity: 'Moderate',
    status: 'In Review',
    amount: 45000,
    dateReported: new Date('2026-01-15'),
    province: 'ON',
    description: 'Water damage to warehouse facility',
  },
  {
    id: 'CLM002',
    policyId: 'POL003',
    accountName: 'Pacific Transport Inc.',
    policyType: 'Auto',
    severity: 'Major',
    status: 'Open',
    amount: 125000,
    dateReported: new Date('2026-02-03'),
    province: 'BC',
    description: 'Multi-vehicle collision involving fleet truck',
  },
  {
    id: 'CLM003',
    policyId: 'POL005',
    accountName: 'Alberta Energy Solutions',
    policyType: 'Specialty',
    severity: 'Critical',
    status: 'Open',
    amount: 850000,
    dateReported: new Date('2026-02-08'),
    province: 'AB',
    description: 'Equipment failure causing production loss',
  },
  {
    id: 'CLM004',
    policyId: 'POL007',
    accountName: 'Maritime Fisheries Co-op',
    policyType: 'Marine',
    severity: 'Major',
    status: 'Approved',
    amount: 78000,
    dateReported: new Date('2026-01-20'),
    province: 'NS',
    description: 'Vessel damage during storm',
  },
  {
    id: 'CLM005',
    policyId: 'POL009',
    accountName: 'Quebec Manufacturing Corp.',
    policyType: 'Property',
    severity: 'Minor',
    status: 'Closed',
    amount: 12000,
    dateReported: new Date('2025-12-10'),
    province: 'QC',
    description: 'Minor fire in storage area',
  },
  {
    id: 'CLM006',
    policyId: 'POL011',
    accountName: 'Northern Mining Operations',
    policyType: 'Specialty',
    severity: 'Major',
    status: 'In Review',
    amount: 420000,
    dateReported: new Date('2026-02-01'),
    province: 'NT',
    description: 'Mining equipment breakdown',
  },
  {
    id: 'CLM007',
    policyId: 'POL013',
    accountName: 'City of Winnipeg',
    policyType: 'Property',
    severity: 'Moderate',
    status: 'Approved',
    amount: 65000,
    dateReported: new Date('2026-01-28'),
    province: 'MB',
    description: 'Roof damage to municipal building',
  },
  {
    id: 'CLM008',
    policyId: 'POL015',
    accountName: 'John Mitchell',
    policyType: 'Auto',
    severity: 'Minor',
    status: 'Closed',
    amount: 3500,
    dateReported: new Date('2026-01-10'),
    province: 'ON',
    description: 'Parking lot incident',
  },
  {
    id: 'CLM009',
    policyId: 'POL019',
    accountName: 'Atlantic Shipping Lines',
    policyType: 'Marine',
    severity: 'Moderate',
    status: 'Open',
    amount: 95000,
    dateReported: new Date('2026-02-09'),
    province: 'NB',
    description: 'Cargo damage during transport',
  },
  {
    id: 'CLM010',
    policyId: 'POL004',
    accountName: 'Pacific Transport Inc.',
    policyType: 'Liability',
    severity: 'Major',
    status: 'In Review',
    amount: 235000,
    dateReported: new Date('2026-02-05'),
    province: 'BC',
    description: 'Third-party property damage claim',
  },
  {
    id: 'CLM011',
    policyId: 'POL002',
    accountName: 'Maple Industries Ltd.',
    policyType: 'Liability',
    severity: 'Minor',
    status: 'Denied',
    amount: 8000,
    dateReported: new Date('2026-01-05'),
    province: 'ON',
    description: 'Customer injury claim - outside coverage',
  },
  {
    id: 'CLM012',
    policyId: 'POL010',
    accountName: 'Quebec Manufacturing Corp.',
    policyType: 'Liability',
    severity: 'Moderate',
    status: 'Open',
    amount: 52000,
    dateReported: new Date('2026-02-07'),
    province: 'QC',
    description: 'Worker compensation claim',
  },
];

// Helper functions
export const getLastUpdatedTime = (): string => {
  const now = new Date();
  const diffMinutes = Math.floor(Math.random() * 10) + 1;
  return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getStatusColor = (
  status: string
): 'default' | 'success' | 'warning' | 'error' => {
  const statusLower = status.toLowerCase();
  if (
    statusLower.includes('active') ||
    statusLower.includes('approved') ||
    statusLower.includes('closed')
  ) {
    return 'success';
  }
  if (
    statusLower.includes('pending') ||
    statusLower.includes('review') ||
    statusLower.includes('moderate')
  ) {
    return 'warning';
  }
  if (
    statusLower.includes('denied') ||
    statusLower.includes('critical') ||
    statusLower.includes('major') ||
    statusLower.includes('inactive')
  ) {
    return 'error';
  }
  return 'default';
};

export const getSeverityColor = (
  severity: string
): 'default' | 'success' | 'warning' | 'error' => {
  switch (severity.toLowerCase()) {
    case 'minor':
      return 'success';
    case 'moderate':
      return 'warning';
    case 'major':
    case 'critical':
      return 'error';
    default:
      return 'default';
  }
};
