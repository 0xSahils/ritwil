
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  name: 'name',
  color: 'color',
  yearlyTarget: 'yearlyTarget',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  name: 'name',
  vbid: 'vbid',
  role: 'role',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  mfaSecret: 'mfaSecret',
  mfaEnabled: 'mfaEnabled',
  managerId: 'managerId'
};

exports.Prisma.EmployeeProfileScalarFieldEnum = {
  id: 'id',
  teamId: 'teamId',
  managerId: 'managerId',
  level: 'level',
  vbid: 'vbid',
  yearlyTarget: 'yearlyTarget',
  yearlyRevenueTarget: 'yearlyRevenueTarget',
  yearlyPlacementTarget: 'yearlyPlacementTarget',
  slabQualified: 'slabQualified',
  placementsDone: 'placementsDone',
  targetAchievementStatus: 'targetAchievementStatus',
  totalRevenue: 'totalRevenue',
  revenueAch: 'revenueAch',
  revenueTargetAchievedPercent: 'revenueTargetAchievedPercent',
  totalIncentiveAmount: 'totalIncentiveAmount',
  totalIncentivePaid: 'totalIncentivePaid',
  individualSynopsis: 'individualSynopsis',
  targetType: 'targetType',
  isActive: 'isActive',
  deletedAt: 'deletedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DailyEntryScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  date: 'date',
  clientName: 'clientName',
  placementType: 'placementType',
  revenue: 'revenue',
  marginPercent: 'marginPercent',
  billingStatus: 'billingStatus',
  doi: 'doi',
  doj: 'doj',
  remarks: 'remarks',
  createdAt: 'createdAt'
};

exports.Prisma.PlacementScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  candidateName: 'candidateName',
  candidateId: 'candidateId',
  placementYear: 'placementYear',
  doi: 'doi',
  doj: 'doj',
  doq: 'doq',
  clientName: 'clientName',
  plcId: 'plcId',
  placementType: 'placementType',
  billingStatus: 'billingStatus',
  collectionStatus: 'collectionStatus',
  billedHours: 'billedHours',
  revenue: 'revenue',
  incentiveAmountInr: 'incentiveAmountInr',
  incentivePaidInr: 'incentivePaidInr',
  incentivePayoutEta: 'incentivePayoutEta',
  sourcer: 'sourcer',
  accountManager: 'accountManager',
  teamLead: 'teamLead',
  placementSharing: 'placementSharing',
  placementCredit: 'placementCredit',
  totalRevenue: 'totalRevenue',
  revenueAsLead: 'revenueAsLead',
  createdAt: 'createdAt'
};

exports.Prisma.MonthlyBillingScalarFieldEnum = {
  id: 'id',
  placementId: 'placementId',
  month: 'month',
  hours: 'hours',
  status: 'status'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  isRevoked: 'isRevoked',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  module: 'module',
  entityType: 'entityType',
  entityId: 'entityId',
  changes: 'changes',
  status: 'status',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  geoLocation: 'geoLocation',
  createdAt: 'createdAt',
  isTampered: 'isTampered',
  hash: 'hash'
};

exports.Prisma.PlacementImportBatchScalarFieldEnum = {
  id: 'id',
  type: 'type',
  uploaderId: 'uploaderId',
  createdAt: 'createdAt'
};

exports.Prisma.PersonalPlacementScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  batchId: 'batchId',
  level: 'level',
  candidateName: 'candidateName',
  placementYear: 'placementYear',
  doj: 'doj',
  doq: 'doq',
  client: 'client',
  plcId: 'plcId',
  placementType: 'placementType',
  billingStatus: 'billingStatus',
  collectionStatus: 'collectionStatus',
  totalBilledHours: 'totalBilledHours',
  revenueUsd: 'revenueUsd',
  incentiveInr: 'incentiveInr',
  incentivePaidInr: 'incentivePaidInr',
  vbCode: 'vbCode',
  recruiterName: 'recruiterName',
  teamLeadName: 'teamLeadName',
  yearlyPlacementTarget: 'yearlyPlacementTarget',
  placementDone: 'placementDone',
  targetAchievedPercent: 'targetAchievedPercent',
  totalRevenueGenerated: 'totalRevenueGenerated',
  slabQualified: 'slabQualified',
  totalIncentiveInr: 'totalIncentiveInr',
  totalIncentivePaidInr: 'totalIncentivePaidInr',
  createdAt: 'createdAt'
};

exports.Prisma.TeamPlacementScalarFieldEnum = {
  id: 'id',
  leadId: 'leadId',
  batchId: 'batchId',
  level: 'level',
  candidateName: 'candidateName',
  recruiterName: 'recruiterName',
  leadName: 'leadName',
  splitWith: 'splitWith',
  placementYear: 'placementYear',
  doj: 'doj',
  doq: 'doq',
  client: 'client',
  plcId: 'plcId',
  placementType: 'placementType',
  billingStatus: 'billingStatus',
  collectionStatus: 'collectionStatus',
  totalBilledHours: 'totalBilledHours',
  revenueLeadUsd: 'revenueLeadUsd',
  incentiveInr: 'incentiveInr',
  incentivePaidInr: 'incentivePaidInr',
  vbCode: 'vbCode',
  yearlyPlacementTarget: 'yearlyPlacementTarget',
  placementDone: 'placementDone',
  placementAchPercent: 'placementAchPercent',
  yearlyRevenueTarget: 'yearlyRevenueTarget',
  revenueAch: 'revenueAch',
  revenueTargetAchievedPercent: 'revenueTargetAchievedPercent',
  totalRevenueGenerated: 'totalRevenueGenerated',
  slabQualified: 'slabQualified',
  totalIncentiveInr: 'totalIncentiveInr',
  totalIncentivePaidInr: 'totalIncentivePaidInr',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  S1_ADMIN: 'S1_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  TEAM_LEAD: 'TEAM_LEAD',
  LIMITED_ACCESS: 'LIMITED_ACCESS',
  EMPLOYEE: 'EMPLOYEE'
};

exports.TargetType = exports.$Enums.TargetType = {
  REVENUE: 'REVENUE',
  PLACEMENTS: 'PLACEMENTS'
};

exports.PlacementType = exports.$Enums.PlacementType = {
  PERMANENT: 'PERMANENT',
  CONTRACT: 'CONTRACT'
};

exports.BillingStatus = exports.$Enums.BillingStatus = {
  PENDING: 'PENDING',
  BILLED: 'BILLED',
  CANCELLED: 'CANCELLED',
  HOLD: 'HOLD'
};

exports.PlacementImportType = exports.$Enums.PlacementImportType = {
  PERSONAL: 'PERSONAL',
  TEAM: 'TEAM'
};

exports.Prisma.ModelName = {
  Team: 'Team',
  User: 'User',
  EmployeeProfile: 'EmployeeProfile',
  DailyEntry: 'DailyEntry',
  Placement: 'Placement',
  MonthlyBilling: 'MonthlyBilling',
  RefreshToken: 'RefreshToken',
  AuditLog: 'AuditLog',
  PlacementImportBatch: 'PlacementImportBatch',
  PersonalPlacement: 'PersonalPlacement',
  TeamPlacement: 'TeamPlacement'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
