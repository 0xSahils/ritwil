
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Team
 * 
 */
export type Team = $Result.DefaultSelection<Prisma.$TeamPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model PasswordResetToken
 * One-time tokens for forgot-password flow. Token is stored hashed; expiry typically 1 hour.
 */
export type PasswordResetToken = $Result.DefaultSelection<Prisma.$PasswordResetTokenPayload>
/**
 * Model EmployeeProfile
 * 
 */
export type EmployeeProfile = $Result.DefaultSelection<Prisma.$EmployeeProfilePayload>
/**
 * Model RefreshToken
 * 
 */
export type RefreshToken = $Result.DefaultSelection<Prisma.$RefreshTokenPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model PlacementImportBatch
 * Represents a single uploaded placement sheet (personal or team)
 */
export type PlacementImportBatch = $Result.DefaultSelection<Prisma.$PlacementImportBatchPayload>
/**
 * Model PersonalPlacement
 * Row-level data for Members Placement Import (personal placements)
 */
export type PersonalPlacement = $Result.DefaultSelection<Prisma.$PersonalPlacementPayload>
/**
 * Model TeamPlacement
 * Row-level data for Team Lead Placement Import (team placements)
 */
export type TeamPlacement = $Result.DefaultSelection<Prisma.$TeamPlacementPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  S1_ADMIN: 'S1_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  TEAM_LEAD: 'TEAM_LEAD',
  LIMITED_ACCESS: 'LIMITED_ACCESS',
  EMPLOYEE: 'EMPLOYEE'
};

export type Role = (typeof Role)[keyof typeof Role]


export const TargetType: {
  REVENUE: 'REVENUE',
  PLACEMENTS: 'PLACEMENTS'
};

export type TargetType = (typeof TargetType)[keyof typeof TargetType]


export const PlacementImportType: {
  PERSONAL: 'PERSONAL',
  TEAM: 'TEAM'
};

export type PlacementImportType = (typeof PlacementImportType)[keyof typeof PlacementImportType]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type TargetType = $Enums.TargetType

export const TargetType: typeof $Enums.TargetType

export type PlacementImportType = $Enums.PlacementImportType

export const PlacementImportType: typeof $Enums.PlacementImportType

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Teams
 * const teams = await prisma.team.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Teams
   * const teams = await prisma.team.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.team`: Exposes CRUD operations for the **Team** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Teams
    * const teams = await prisma.team.findMany()
    * ```
    */
  get team(): Prisma.TeamDelegate<ExtArgs>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.passwordResetToken`: Exposes CRUD operations for the **PasswordResetToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PasswordResetTokens
    * const passwordResetTokens = await prisma.passwordResetToken.findMany()
    * ```
    */
  get passwordResetToken(): Prisma.PasswordResetTokenDelegate<ExtArgs>;

  /**
   * `prisma.employeeProfile`: Exposes CRUD operations for the **EmployeeProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmployeeProfiles
    * const employeeProfiles = await prisma.employeeProfile.findMany()
    * ```
    */
  get employeeProfile(): Prisma.EmployeeProfileDelegate<ExtArgs>;

  /**
   * `prisma.refreshToken`: Exposes CRUD operations for the **RefreshToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RefreshTokens
    * const refreshTokens = await prisma.refreshToken.findMany()
    * ```
    */
  get refreshToken(): Prisma.RefreshTokenDelegate<ExtArgs>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs>;

  /**
   * `prisma.placementImportBatch`: Exposes CRUD operations for the **PlacementImportBatch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PlacementImportBatches
    * const placementImportBatches = await prisma.placementImportBatch.findMany()
    * ```
    */
  get placementImportBatch(): Prisma.PlacementImportBatchDelegate<ExtArgs>;

  /**
   * `prisma.personalPlacement`: Exposes CRUD operations for the **PersonalPlacement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PersonalPlacements
    * const personalPlacements = await prisma.personalPlacement.findMany()
    * ```
    */
  get personalPlacement(): Prisma.PersonalPlacementDelegate<ExtArgs>;

  /**
   * `prisma.teamPlacement`: Exposes CRUD operations for the **TeamPlacement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TeamPlacements
    * const teamPlacements = await prisma.teamPlacement.findMany()
    * ```
    */
  get teamPlacement(): Prisma.TeamPlacementDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Team: 'Team',
    User: 'User',
    PasswordResetToken: 'PasswordResetToken',
    EmployeeProfile: 'EmployeeProfile',
    RefreshToken: 'RefreshToken',
    AuditLog: 'AuditLog',
    PlacementImportBatch: 'PlacementImportBatch',
    PersonalPlacement: 'PersonalPlacement',
    TeamPlacement: 'TeamPlacement'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "team" | "user" | "passwordResetToken" | "employeeProfile" | "refreshToken" | "auditLog" | "placementImportBatch" | "personalPlacement" | "teamPlacement"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Team: {
        payload: Prisma.$TeamPayload<ExtArgs>
        fields: Prisma.TeamFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TeamFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TeamFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          findFirst: {
            args: Prisma.TeamFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TeamFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          findMany: {
            args: Prisma.TeamFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>[]
          }
          create: {
            args: Prisma.TeamCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          createMany: {
            args: Prisma.TeamCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TeamCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>[]
          }
          delete: {
            args: Prisma.TeamDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          update: {
            args: Prisma.TeamUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          deleteMany: {
            args: Prisma.TeamDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TeamUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TeamUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          aggregate: {
            args: Prisma.TeamAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeam>
          }
          groupBy: {
            args: Prisma.TeamGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeamGroupByOutputType>[]
          }
          count: {
            args: Prisma.TeamCountArgs<ExtArgs>
            result: $Utils.Optional<TeamCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      PasswordResetToken: {
        payload: Prisma.$PasswordResetTokenPayload<ExtArgs>
        fields: Prisma.PasswordResetTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PasswordResetTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PasswordResetTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          findFirst: {
            args: Prisma.PasswordResetTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PasswordResetTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          findMany: {
            args: Prisma.PasswordResetTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>[]
          }
          create: {
            args: Prisma.PasswordResetTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          createMany: {
            args: Prisma.PasswordResetTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PasswordResetTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>[]
          }
          delete: {
            args: Prisma.PasswordResetTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          update: {
            args: Prisma.PasswordResetTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          deleteMany: {
            args: Prisma.PasswordResetTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PasswordResetTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PasswordResetTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PasswordResetTokenPayload>
          }
          aggregate: {
            args: Prisma.PasswordResetTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePasswordResetToken>
          }
          groupBy: {
            args: Prisma.PasswordResetTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.PasswordResetTokenCountArgs<ExtArgs>
            result: $Utils.Optional<PasswordResetTokenCountAggregateOutputType> | number
          }
        }
      }
      EmployeeProfile: {
        payload: Prisma.$EmployeeProfilePayload<ExtArgs>
        fields: Prisma.EmployeeProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmployeeProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmployeeProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>
          }
          findFirst: {
            args: Prisma.EmployeeProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmployeeProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>
          }
          findMany: {
            args: Prisma.EmployeeProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>[]
          }
          create: {
            args: Prisma.EmployeeProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>
          }
          createMany: {
            args: Prisma.EmployeeProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmployeeProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>[]
          }
          delete: {
            args: Prisma.EmployeeProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>
          }
          update: {
            args: Prisma.EmployeeProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>
          }
          deleteMany: {
            args: Prisma.EmployeeProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmployeeProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmployeeProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmployeeProfilePayload>
          }
          aggregate: {
            args: Prisma.EmployeeProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmployeeProfile>
          }
          groupBy: {
            args: Prisma.EmployeeProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmployeeProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmployeeProfileCountArgs<ExtArgs>
            result: $Utils.Optional<EmployeeProfileCountAggregateOutputType> | number
          }
        }
      }
      RefreshToken: {
        payload: Prisma.$RefreshTokenPayload<ExtArgs>
        fields: Prisma.RefreshTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RefreshTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RefreshTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          findFirst: {
            args: Prisma.RefreshTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RefreshTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          findMany: {
            args: Prisma.RefreshTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[]
          }
          create: {
            args: Prisma.RefreshTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          createMany: {
            args: Prisma.RefreshTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RefreshTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>[]
          }
          delete: {
            args: Prisma.RefreshTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          update: {
            args: Prisma.RefreshTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          deleteMany: {
            args: Prisma.RefreshTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RefreshTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RefreshTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RefreshTokenPayload>
          }
          aggregate: {
            args: Prisma.RefreshTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRefreshToken>
          }
          groupBy: {
            args: Prisma.RefreshTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<RefreshTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.RefreshTokenCountArgs<ExtArgs>
            result: $Utils.Optional<RefreshTokenCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      PlacementImportBatch: {
        payload: Prisma.$PlacementImportBatchPayload<ExtArgs>
        fields: Prisma.PlacementImportBatchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PlacementImportBatchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PlacementImportBatchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>
          }
          findFirst: {
            args: Prisma.PlacementImportBatchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PlacementImportBatchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>
          }
          findMany: {
            args: Prisma.PlacementImportBatchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>[]
          }
          create: {
            args: Prisma.PlacementImportBatchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>
          }
          createMany: {
            args: Prisma.PlacementImportBatchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PlacementImportBatchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>[]
          }
          delete: {
            args: Prisma.PlacementImportBatchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>
          }
          update: {
            args: Prisma.PlacementImportBatchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>
          }
          deleteMany: {
            args: Prisma.PlacementImportBatchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PlacementImportBatchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PlacementImportBatchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PlacementImportBatchPayload>
          }
          aggregate: {
            args: Prisma.PlacementImportBatchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePlacementImportBatch>
          }
          groupBy: {
            args: Prisma.PlacementImportBatchGroupByArgs<ExtArgs>
            result: $Utils.Optional<PlacementImportBatchGroupByOutputType>[]
          }
          count: {
            args: Prisma.PlacementImportBatchCountArgs<ExtArgs>
            result: $Utils.Optional<PlacementImportBatchCountAggregateOutputType> | number
          }
        }
      }
      PersonalPlacement: {
        payload: Prisma.$PersonalPlacementPayload<ExtArgs>
        fields: Prisma.PersonalPlacementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PersonalPlacementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PersonalPlacementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>
          }
          findFirst: {
            args: Prisma.PersonalPlacementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PersonalPlacementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>
          }
          findMany: {
            args: Prisma.PersonalPlacementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>[]
          }
          create: {
            args: Prisma.PersonalPlacementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>
          }
          createMany: {
            args: Prisma.PersonalPlacementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PersonalPlacementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>[]
          }
          delete: {
            args: Prisma.PersonalPlacementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>
          }
          update: {
            args: Prisma.PersonalPlacementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>
          }
          deleteMany: {
            args: Prisma.PersonalPlacementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PersonalPlacementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PersonalPlacementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PersonalPlacementPayload>
          }
          aggregate: {
            args: Prisma.PersonalPlacementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePersonalPlacement>
          }
          groupBy: {
            args: Prisma.PersonalPlacementGroupByArgs<ExtArgs>
            result: $Utils.Optional<PersonalPlacementGroupByOutputType>[]
          }
          count: {
            args: Prisma.PersonalPlacementCountArgs<ExtArgs>
            result: $Utils.Optional<PersonalPlacementCountAggregateOutputType> | number
          }
        }
      }
      TeamPlacement: {
        payload: Prisma.$TeamPlacementPayload<ExtArgs>
        fields: Prisma.TeamPlacementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TeamPlacementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TeamPlacementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>
          }
          findFirst: {
            args: Prisma.TeamPlacementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TeamPlacementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>
          }
          findMany: {
            args: Prisma.TeamPlacementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>[]
          }
          create: {
            args: Prisma.TeamPlacementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>
          }
          createMany: {
            args: Prisma.TeamPlacementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TeamPlacementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>[]
          }
          delete: {
            args: Prisma.TeamPlacementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>
          }
          update: {
            args: Prisma.TeamPlacementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>
          }
          deleteMany: {
            args: Prisma.TeamPlacementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TeamPlacementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TeamPlacementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPlacementPayload>
          }
          aggregate: {
            args: Prisma.TeamPlacementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeamPlacement>
          }
          groupBy: {
            args: Prisma.TeamPlacementGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeamPlacementGroupByOutputType>[]
          }
          count: {
            args: Prisma.TeamPlacementCountArgs<ExtArgs>
            result: $Utils.Optional<TeamPlacementCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TeamCountOutputType
   */

  export type TeamCountOutputType = {
    employees: number
  }

  export type TeamCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employees?: boolean | TeamCountOutputTypeCountEmployeesArgs
  }

  // Custom InputTypes
  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamCountOutputType
     */
    select?: TeamCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountEmployeesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeProfileWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    refreshTokens: number
    leadEmployees: number
    subordinates: number
    auditLogs: number
    placementImportBatches: number
    personalPlacements: number
    teamPlacements: number
    passwordResetTokens: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    refreshTokens?: boolean | UserCountOutputTypeCountRefreshTokensArgs
    leadEmployees?: boolean | UserCountOutputTypeCountLeadEmployeesArgs
    subordinates?: boolean | UserCountOutputTypeCountSubordinatesArgs
    auditLogs?: boolean | UserCountOutputTypeCountAuditLogsArgs
    placementImportBatches?: boolean | UserCountOutputTypeCountPlacementImportBatchesArgs
    personalPlacements?: boolean | UserCountOutputTypeCountPersonalPlacementsArgs
    teamPlacements?: boolean | UserCountOutputTypeCountTeamPlacementsArgs
    passwordResetTokens?: boolean | UserCountOutputTypeCountPasswordResetTokensArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRefreshTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefreshTokenWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountLeadEmployeesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeProfileWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountSubordinatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPlacementImportBatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlacementImportBatchWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPersonalPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PersonalPlacementWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountTeamPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamPlacementWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountPasswordResetTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasswordResetTokenWhereInput
  }


  /**
   * Count Type PlacementImportBatchCountOutputType
   */

  export type PlacementImportBatchCountOutputType = {
    personalPlacements: number
    teamPlacements: number
  }

  export type PlacementImportBatchCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    personalPlacements?: boolean | PlacementImportBatchCountOutputTypeCountPersonalPlacementsArgs
    teamPlacements?: boolean | PlacementImportBatchCountOutputTypeCountTeamPlacementsArgs
  }

  // Custom InputTypes
  /**
   * PlacementImportBatchCountOutputType without action
   */
  export type PlacementImportBatchCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatchCountOutputType
     */
    select?: PlacementImportBatchCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PlacementImportBatchCountOutputType without action
   */
  export type PlacementImportBatchCountOutputTypeCountPersonalPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PersonalPlacementWhereInput
  }

  /**
   * PlacementImportBatchCountOutputType without action
   */
  export type PlacementImportBatchCountOutputTypeCountTeamPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamPlacementWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Team
   */

  export type AggregateTeam = {
    _count: TeamCountAggregateOutputType | null
    _avg: TeamAvgAggregateOutputType | null
    _sum: TeamSumAggregateOutputType | null
    _min: TeamMinAggregateOutputType | null
    _max: TeamMaxAggregateOutputType | null
  }

  export type TeamAvgAggregateOutputType = {
    yearlyTarget: Decimal | null
  }

  export type TeamSumAggregateOutputType = {
    yearlyTarget: Decimal | null
  }

  export type TeamMinAggregateOutputType = {
    id: string | null
    name: string | null
    color: string | null
    yearlyTarget: Decimal | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TeamMaxAggregateOutputType = {
    id: string | null
    name: string | null
    color: string | null
    yearlyTarget: Decimal | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TeamCountAggregateOutputType = {
    id: number
    name: number
    color: number
    yearlyTarget: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TeamAvgAggregateInputType = {
    yearlyTarget?: true
  }

  export type TeamSumAggregateInputType = {
    yearlyTarget?: true
  }

  export type TeamMinAggregateInputType = {
    id?: true
    name?: true
    color?: true
    yearlyTarget?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TeamMaxAggregateInputType = {
    id?: true
    name?: true
    color?: true
    yearlyTarget?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TeamCountAggregateInputType = {
    id?: true
    name?: true
    color?: true
    yearlyTarget?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TeamAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Team to aggregate.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Teams
    **/
    _count?: true | TeamCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TeamAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TeamSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeamMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeamMaxAggregateInputType
  }

  export type GetTeamAggregateType<T extends TeamAggregateArgs> = {
        [P in keyof T & keyof AggregateTeam]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeam[P]>
      : GetScalarType<T[P], AggregateTeam[P]>
  }




  export type TeamGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamWhereInput
    orderBy?: TeamOrderByWithAggregationInput | TeamOrderByWithAggregationInput[]
    by: TeamScalarFieldEnum[] | TeamScalarFieldEnum
    having?: TeamScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeamCountAggregateInputType | true
    _avg?: TeamAvgAggregateInputType
    _sum?: TeamSumAggregateInputType
    _min?: TeamMinAggregateInputType
    _max?: TeamMaxAggregateInputType
  }

  export type TeamGroupByOutputType = {
    id: string
    name: string
    color: string | null
    yearlyTarget: Decimal
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: TeamCountAggregateOutputType | null
    _avg: TeamAvgAggregateOutputType | null
    _sum: TeamSumAggregateOutputType | null
    _min: TeamMinAggregateOutputType | null
    _max: TeamMaxAggregateOutputType | null
  }

  type GetTeamGroupByPayload<T extends TeamGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeamGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeamGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeamGroupByOutputType[P]>
            : GetScalarType<T[P], TeamGroupByOutputType[P]>
        }
      >
    >


  export type TeamSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    color?: boolean
    yearlyTarget?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    employees?: boolean | Team$employeesArgs<ExtArgs>
    _count?: boolean | TeamCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["team"]>

  export type TeamSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    color?: boolean
    yearlyTarget?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["team"]>

  export type TeamSelectScalar = {
    id?: boolean
    name?: boolean
    color?: boolean
    yearlyTarget?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TeamInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employees?: boolean | Team$employeesArgs<ExtArgs>
    _count?: boolean | TeamCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TeamIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TeamPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Team"
    objects: {
      employees: Prisma.$EmployeeProfilePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      color: string | null
      yearlyTarget: Prisma.Decimal
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["team"]>
    composites: {}
  }

  type TeamGetPayload<S extends boolean | null | undefined | TeamDefaultArgs> = $Result.GetResult<Prisma.$TeamPayload, S>

  type TeamCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TeamFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TeamCountAggregateInputType | true
    }

  export interface TeamDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Team'], meta: { name: 'Team' } }
    /**
     * Find zero or one Team that matches the filter.
     * @param {TeamFindUniqueArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TeamFindUniqueArgs>(args: SelectSubset<T, TeamFindUniqueArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Team that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TeamFindUniqueOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TeamFindUniqueOrThrowArgs>(args: SelectSubset<T, TeamFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Team that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TeamFindFirstArgs>(args?: SelectSubset<T, TeamFindFirstArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Team that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TeamFindFirstOrThrowArgs>(args?: SelectSubset<T, TeamFindFirstOrThrowArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Teams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Teams
     * const teams = await prisma.team.findMany()
     * 
     * // Get first 10 Teams
     * const teams = await prisma.team.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const teamWithIdOnly = await prisma.team.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TeamFindManyArgs>(args?: SelectSubset<T, TeamFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Team.
     * @param {TeamCreateArgs} args - Arguments to create a Team.
     * @example
     * // Create one Team
     * const Team = await prisma.team.create({
     *   data: {
     *     // ... data to create a Team
     *   }
     * })
     * 
     */
    create<T extends TeamCreateArgs>(args: SelectSubset<T, TeamCreateArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Teams.
     * @param {TeamCreateManyArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TeamCreateManyArgs>(args?: SelectSubset<T, TeamCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Teams and returns the data saved in the database.
     * @param {TeamCreateManyAndReturnArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Teams and only return the `id`
     * const teamWithIdOnly = await prisma.team.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TeamCreateManyAndReturnArgs>(args?: SelectSubset<T, TeamCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Team.
     * @param {TeamDeleteArgs} args - Arguments to delete one Team.
     * @example
     * // Delete one Team
     * const Team = await prisma.team.delete({
     *   where: {
     *     // ... filter to delete one Team
     *   }
     * })
     * 
     */
    delete<T extends TeamDeleteArgs>(args: SelectSubset<T, TeamDeleteArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Team.
     * @param {TeamUpdateArgs} args - Arguments to update one Team.
     * @example
     * // Update one Team
     * const team = await prisma.team.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TeamUpdateArgs>(args: SelectSubset<T, TeamUpdateArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Teams.
     * @param {TeamDeleteManyArgs} args - Arguments to filter Teams to delete.
     * @example
     * // Delete a few Teams
     * const { count } = await prisma.team.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TeamDeleteManyArgs>(args?: SelectSubset<T, TeamDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Teams
     * const team = await prisma.team.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TeamUpdateManyArgs>(args: SelectSubset<T, TeamUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Team.
     * @param {TeamUpsertArgs} args - Arguments to update or create a Team.
     * @example
     * // Update or create a Team
     * const team = await prisma.team.upsert({
     *   create: {
     *     // ... data to create a Team
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Team we want to update
     *   }
     * })
     */
    upsert<T extends TeamUpsertArgs>(args: SelectSubset<T, TeamUpsertArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamCountArgs} args - Arguments to filter Teams to count.
     * @example
     * // Count the number of Teams
     * const count = await prisma.team.count({
     *   where: {
     *     // ... the filter for the Teams we want to count
     *   }
     * })
    **/
    count<T extends TeamCountArgs>(
      args?: Subset<T, TeamCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeamCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TeamAggregateArgs>(args: Subset<T, TeamAggregateArgs>): Prisma.PrismaPromise<GetTeamAggregateType<T>>

    /**
     * Group by Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TeamGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TeamGroupByArgs['orderBy'] }
        : { orderBy?: TeamGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TeamGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Team model
   */
  readonly fields: TeamFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Team.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TeamClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employees<T extends Team$employeesArgs<ExtArgs> = {}>(args?: Subset<T, Team$employeesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Team model
   */ 
  interface TeamFieldRefs {
    readonly id: FieldRef<"Team", 'String'>
    readonly name: FieldRef<"Team", 'String'>
    readonly color: FieldRef<"Team", 'String'>
    readonly yearlyTarget: FieldRef<"Team", 'Decimal'>
    readonly isActive: FieldRef<"Team", 'Boolean'>
    readonly createdAt: FieldRef<"Team", 'DateTime'>
    readonly updatedAt: FieldRef<"Team", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Team findUnique
   */
  export type TeamFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team findUniqueOrThrow
   */
  export type TeamFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team findFirst
   */
  export type TeamFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Teams.
     */
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team findFirstOrThrow
   */
  export type TeamFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Teams.
     */
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team findMany
   */
  export type TeamFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Teams to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team create
   */
  export type TeamCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The data needed to create a Team.
     */
    data: XOR<TeamCreateInput, TeamUncheckedCreateInput>
  }

  /**
   * Team createMany
   */
  export type TeamCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Teams.
     */
    data: TeamCreateManyInput | TeamCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Team createManyAndReturn
   */
  export type TeamCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Teams.
     */
    data: TeamCreateManyInput | TeamCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Team update
   */
  export type TeamUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The data needed to update a Team.
     */
    data: XOR<TeamUpdateInput, TeamUncheckedUpdateInput>
    /**
     * Choose, which Team to update.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team updateMany
   */
  export type TeamUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Teams.
     */
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyInput>
    /**
     * Filter which Teams to update
     */
    where?: TeamWhereInput
  }

  /**
   * Team upsert
   */
  export type TeamUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The filter to search for the Team to update in case it exists.
     */
    where: TeamWhereUniqueInput
    /**
     * In case the Team found by the `where` argument doesn't exist, create a new Team with this data.
     */
    create: XOR<TeamCreateInput, TeamUncheckedCreateInput>
    /**
     * In case the Team was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TeamUpdateInput, TeamUncheckedUpdateInput>
  }

  /**
   * Team delete
   */
  export type TeamDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter which Team to delete.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team deleteMany
   */
  export type TeamDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Teams to delete
     */
    where?: TeamWhereInput
  }

  /**
   * Team.employees
   */
  export type Team$employeesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    where?: EmployeeProfileWhereInput
    orderBy?: EmployeeProfileOrderByWithRelationInput | EmployeeProfileOrderByWithRelationInput[]
    cursor?: EmployeeProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmployeeProfileScalarFieldEnum | EmployeeProfileScalarFieldEnum[]
  }

  /**
   * Team without action
   */
  export type TeamDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    name: string | null
    vbid: string | null
    role: $Enums.Role | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    mfaSecret: string | null
    mfaEnabled: boolean | null
    managerId: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    passwordHash: string | null
    name: string | null
    vbid: string | null
    role: $Enums.Role | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    mfaSecret: string | null
    mfaEnabled: boolean | null
    managerId: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    passwordHash: number
    name: number
    vbid: number
    role: number
    isActive: number
    createdAt: number
    updatedAt: number
    mfaSecret: number
    mfaEnabled: number
    managerId: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    name?: true
    vbid?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    mfaSecret?: true
    mfaEnabled?: true
    managerId?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    name?: true
    vbid?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    mfaSecret?: true
    mfaEnabled?: true
    managerId?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    passwordHash?: true
    name?: true
    vbid?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    mfaSecret?: true
    mfaEnabled?: true
    managerId?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    passwordHash: string
    name: string
    vbid: string | null
    role: $Enums.Role
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    mfaSecret: string | null
    mfaEnabled: boolean
    managerId: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    name?: boolean
    vbid?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    mfaSecret?: boolean
    mfaEnabled?: boolean
    managerId?: boolean
    employeeProfile?: boolean | User$employeeProfileArgs<ExtArgs>
    refreshTokens?: boolean | User$refreshTokensArgs<ExtArgs>
    leadEmployees?: boolean | User$leadEmployeesArgs<ExtArgs>
    manager?: boolean | User$managerArgs<ExtArgs>
    subordinates?: boolean | User$subordinatesArgs<ExtArgs>
    auditLogs?: boolean | User$auditLogsArgs<ExtArgs>
    placementImportBatches?: boolean | User$placementImportBatchesArgs<ExtArgs>
    personalPlacements?: boolean | User$personalPlacementsArgs<ExtArgs>
    teamPlacements?: boolean | User$teamPlacementsArgs<ExtArgs>
    passwordResetTokens?: boolean | User$passwordResetTokensArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    name?: boolean
    vbid?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    mfaSecret?: boolean
    mfaEnabled?: boolean
    managerId?: boolean
    manager?: boolean | User$managerArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    passwordHash?: boolean
    name?: boolean
    vbid?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    mfaSecret?: boolean
    mfaEnabled?: boolean
    managerId?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employeeProfile?: boolean | User$employeeProfileArgs<ExtArgs>
    refreshTokens?: boolean | User$refreshTokensArgs<ExtArgs>
    leadEmployees?: boolean | User$leadEmployeesArgs<ExtArgs>
    manager?: boolean | User$managerArgs<ExtArgs>
    subordinates?: boolean | User$subordinatesArgs<ExtArgs>
    auditLogs?: boolean | User$auditLogsArgs<ExtArgs>
    placementImportBatches?: boolean | User$placementImportBatchesArgs<ExtArgs>
    personalPlacements?: boolean | User$personalPlacementsArgs<ExtArgs>
    teamPlacements?: boolean | User$teamPlacementsArgs<ExtArgs>
    passwordResetTokens?: boolean | User$passwordResetTokensArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    manager?: boolean | User$managerArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      employeeProfile: Prisma.$EmployeeProfilePayload<ExtArgs> | null
      refreshTokens: Prisma.$RefreshTokenPayload<ExtArgs>[]
      leadEmployees: Prisma.$EmployeeProfilePayload<ExtArgs>[]
      manager: Prisma.$UserPayload<ExtArgs> | null
      subordinates: Prisma.$UserPayload<ExtArgs>[]
      auditLogs: Prisma.$AuditLogPayload<ExtArgs>[]
      placementImportBatches: Prisma.$PlacementImportBatchPayload<ExtArgs>[]
      personalPlacements: Prisma.$PersonalPlacementPayload<ExtArgs>[]
      teamPlacements: Prisma.$TeamPlacementPayload<ExtArgs>[]
      passwordResetTokens: Prisma.$PasswordResetTokenPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      passwordHash: string
      name: string
      /**
       * Denormalized from EmployeeProfile; canonical unique VBID is on EmployeeProfile.
       */
      vbid: string | null
      role: $Enums.Role
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      mfaSecret: string | null
      mfaEnabled: boolean
      managerId: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employeeProfile<T extends User$employeeProfileArgs<ExtArgs> = {}>(args?: Subset<T, User$employeeProfileArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    refreshTokens<T extends User$refreshTokensArgs<ExtArgs> = {}>(args?: Subset<T, User$refreshTokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findMany"> | Null>
    leadEmployees<T extends User$leadEmployeesArgs<ExtArgs> = {}>(args?: Subset<T, User$leadEmployeesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findMany"> | Null>
    manager<T extends User$managerArgs<ExtArgs> = {}>(args?: Subset<T, User$managerArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    subordinates<T extends User$subordinatesArgs<ExtArgs> = {}>(args?: Subset<T, User$subordinatesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany"> | Null>
    auditLogs<T extends User$auditLogsArgs<ExtArgs> = {}>(args?: Subset<T, User$auditLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany"> | Null>
    placementImportBatches<T extends User$placementImportBatchesArgs<ExtArgs> = {}>(args?: Subset<T, User$placementImportBatchesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findMany"> | Null>
    personalPlacements<T extends User$personalPlacementsArgs<ExtArgs> = {}>(args?: Subset<T, User$personalPlacementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "findMany"> | Null>
    teamPlacements<T extends User$teamPlacementsArgs<ExtArgs> = {}>(args?: Subset<T, User$teamPlacementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "findMany"> | Null>
    passwordResetTokens<T extends User$passwordResetTokensArgs<ExtArgs> = {}>(args?: Subset<T, User$passwordResetTokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly vbid: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly mfaSecret: FieldRef<"User", 'String'>
    readonly mfaEnabled: FieldRef<"User", 'Boolean'>
    readonly managerId: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.employeeProfile
   */
  export type User$employeeProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    where?: EmployeeProfileWhereInput
  }

  /**
   * User.refreshTokens
   */
  export type User$refreshTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    where?: RefreshTokenWhereInput
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    cursor?: RefreshTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * User.leadEmployees
   */
  export type User$leadEmployeesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    where?: EmployeeProfileWhereInput
    orderBy?: EmployeeProfileOrderByWithRelationInput | EmployeeProfileOrderByWithRelationInput[]
    cursor?: EmployeeProfileWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmployeeProfileScalarFieldEnum | EmployeeProfileScalarFieldEnum[]
  }

  /**
   * User.manager
   */
  export type User$managerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * User.subordinates
   */
  export type User$subordinatesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User.auditLogs
   */
  export type User$auditLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * User.placementImportBatches
   */
  export type User$placementImportBatchesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    where?: PlacementImportBatchWhereInput
    orderBy?: PlacementImportBatchOrderByWithRelationInput | PlacementImportBatchOrderByWithRelationInput[]
    cursor?: PlacementImportBatchWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PlacementImportBatchScalarFieldEnum | PlacementImportBatchScalarFieldEnum[]
  }

  /**
   * User.personalPlacements
   */
  export type User$personalPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    where?: PersonalPlacementWhereInput
    orderBy?: PersonalPlacementOrderByWithRelationInput | PersonalPlacementOrderByWithRelationInput[]
    cursor?: PersonalPlacementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PersonalPlacementScalarFieldEnum | PersonalPlacementScalarFieldEnum[]
  }

  /**
   * User.teamPlacements
   */
  export type User$teamPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    where?: TeamPlacementWhereInput
    orderBy?: TeamPlacementOrderByWithRelationInput | TeamPlacementOrderByWithRelationInput[]
    cursor?: TeamPlacementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamPlacementScalarFieldEnum | TeamPlacementScalarFieldEnum[]
  }

  /**
   * User.passwordResetTokens
   */
  export type User$passwordResetTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    where?: PasswordResetTokenWhereInput
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    cursor?: PasswordResetTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model PasswordResetToken
   */

  export type AggregatePasswordResetToken = {
    _count: PasswordResetTokenCountAggregateOutputType | null
    _min: PasswordResetTokenMinAggregateOutputType | null
    _max: PasswordResetTokenMaxAggregateOutputType | null
  }

  export type PasswordResetTokenMinAggregateOutputType = {
    id: string | null
    userId: string | null
    tokenHash: string | null
    expiresAt: Date | null
    usedAt: Date | null
    createdAt: Date | null
  }

  export type PasswordResetTokenMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    tokenHash: string | null
    expiresAt: Date | null
    usedAt: Date | null
    createdAt: Date | null
  }

  export type PasswordResetTokenCountAggregateOutputType = {
    id: number
    userId: number
    tokenHash: number
    expiresAt: number
    usedAt: number
    createdAt: number
    _all: number
  }


  export type PasswordResetTokenMinAggregateInputType = {
    id?: true
    userId?: true
    tokenHash?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
  }

  export type PasswordResetTokenMaxAggregateInputType = {
    id?: true
    userId?: true
    tokenHash?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
  }

  export type PasswordResetTokenCountAggregateInputType = {
    id?: true
    userId?: true
    tokenHash?: true
    expiresAt?: true
    usedAt?: true
    createdAt?: true
    _all?: true
  }

  export type PasswordResetTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordResetToken to aggregate.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PasswordResetTokens
    **/
    _count?: true | PasswordResetTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PasswordResetTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PasswordResetTokenMaxAggregateInputType
  }

  export type GetPasswordResetTokenAggregateType<T extends PasswordResetTokenAggregateArgs> = {
        [P in keyof T & keyof AggregatePasswordResetToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePasswordResetToken[P]>
      : GetScalarType<T[P], AggregatePasswordResetToken[P]>
  }




  export type PasswordResetTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PasswordResetTokenWhereInput
    orderBy?: PasswordResetTokenOrderByWithAggregationInput | PasswordResetTokenOrderByWithAggregationInput[]
    by: PasswordResetTokenScalarFieldEnum[] | PasswordResetTokenScalarFieldEnum
    having?: PasswordResetTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PasswordResetTokenCountAggregateInputType | true
    _min?: PasswordResetTokenMinAggregateInputType
    _max?: PasswordResetTokenMaxAggregateInputType
  }

  export type PasswordResetTokenGroupByOutputType = {
    id: string
    userId: string
    tokenHash: string
    expiresAt: Date
    usedAt: Date | null
    createdAt: Date
    _count: PasswordResetTokenCountAggregateOutputType | null
    _min: PasswordResetTokenMinAggregateOutputType | null
    _max: PasswordResetTokenMaxAggregateOutputType | null
  }

  type GetPasswordResetTokenGroupByPayload<T extends PasswordResetTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PasswordResetTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PasswordResetTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PasswordResetTokenGroupByOutputType[P]>
            : GetScalarType<T[P], PasswordResetTokenGroupByOutputType[P]>
        }
      >
    >


  export type PasswordResetTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordResetToken"]>

  export type PasswordResetTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passwordResetToken"]>

  export type PasswordResetTokenSelectScalar = {
    id?: boolean
    userId?: boolean
    tokenHash?: boolean
    expiresAt?: boolean
    usedAt?: boolean
    createdAt?: boolean
  }

  export type PasswordResetTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type PasswordResetTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PasswordResetTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PasswordResetToken"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      tokenHash: string
      expiresAt: Date
      usedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["passwordResetToken"]>
    composites: {}
  }

  type PasswordResetTokenGetPayload<S extends boolean | null | undefined | PasswordResetTokenDefaultArgs> = $Result.GetResult<Prisma.$PasswordResetTokenPayload, S>

  type PasswordResetTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PasswordResetTokenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PasswordResetTokenCountAggregateInputType | true
    }

  export interface PasswordResetTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PasswordResetToken'], meta: { name: 'PasswordResetToken' } }
    /**
     * Find zero or one PasswordResetToken that matches the filter.
     * @param {PasswordResetTokenFindUniqueArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PasswordResetTokenFindUniqueArgs>(args: SelectSubset<T, PasswordResetTokenFindUniqueArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PasswordResetToken that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PasswordResetTokenFindUniqueOrThrowArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PasswordResetTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, PasswordResetTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PasswordResetToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenFindFirstArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PasswordResetTokenFindFirstArgs>(args?: SelectSubset<T, PasswordResetTokenFindFirstArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PasswordResetToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenFindFirstOrThrowArgs} args - Arguments to find a PasswordResetToken
     * @example
     * // Get one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PasswordResetTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, PasswordResetTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PasswordResetTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PasswordResetTokens
     * const passwordResetTokens = await prisma.passwordResetToken.findMany()
     * 
     * // Get first 10 PasswordResetTokens
     * const passwordResetTokens = await prisma.passwordResetToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const passwordResetTokenWithIdOnly = await prisma.passwordResetToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PasswordResetTokenFindManyArgs>(args?: SelectSubset<T, PasswordResetTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PasswordResetToken.
     * @param {PasswordResetTokenCreateArgs} args - Arguments to create a PasswordResetToken.
     * @example
     * // Create one PasswordResetToken
     * const PasswordResetToken = await prisma.passwordResetToken.create({
     *   data: {
     *     // ... data to create a PasswordResetToken
     *   }
     * })
     * 
     */
    create<T extends PasswordResetTokenCreateArgs>(args: SelectSubset<T, PasswordResetTokenCreateArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PasswordResetTokens.
     * @param {PasswordResetTokenCreateManyArgs} args - Arguments to create many PasswordResetTokens.
     * @example
     * // Create many PasswordResetTokens
     * const passwordResetToken = await prisma.passwordResetToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PasswordResetTokenCreateManyArgs>(args?: SelectSubset<T, PasswordResetTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PasswordResetTokens and returns the data saved in the database.
     * @param {PasswordResetTokenCreateManyAndReturnArgs} args - Arguments to create many PasswordResetTokens.
     * @example
     * // Create many PasswordResetTokens
     * const passwordResetToken = await prisma.passwordResetToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PasswordResetTokens and only return the `id`
     * const passwordResetTokenWithIdOnly = await prisma.passwordResetToken.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PasswordResetTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, PasswordResetTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PasswordResetToken.
     * @param {PasswordResetTokenDeleteArgs} args - Arguments to delete one PasswordResetToken.
     * @example
     * // Delete one PasswordResetToken
     * const PasswordResetToken = await prisma.passwordResetToken.delete({
     *   where: {
     *     // ... filter to delete one PasswordResetToken
     *   }
     * })
     * 
     */
    delete<T extends PasswordResetTokenDeleteArgs>(args: SelectSubset<T, PasswordResetTokenDeleteArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PasswordResetToken.
     * @param {PasswordResetTokenUpdateArgs} args - Arguments to update one PasswordResetToken.
     * @example
     * // Update one PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PasswordResetTokenUpdateArgs>(args: SelectSubset<T, PasswordResetTokenUpdateArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PasswordResetTokens.
     * @param {PasswordResetTokenDeleteManyArgs} args - Arguments to filter PasswordResetTokens to delete.
     * @example
     * // Delete a few PasswordResetTokens
     * const { count } = await prisma.passwordResetToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PasswordResetTokenDeleteManyArgs>(args?: SelectSubset<T, PasswordResetTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PasswordResetTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PasswordResetTokens
     * const passwordResetToken = await prisma.passwordResetToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PasswordResetTokenUpdateManyArgs>(args: SelectSubset<T, PasswordResetTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PasswordResetToken.
     * @param {PasswordResetTokenUpsertArgs} args - Arguments to update or create a PasswordResetToken.
     * @example
     * // Update or create a PasswordResetToken
     * const passwordResetToken = await prisma.passwordResetToken.upsert({
     *   create: {
     *     // ... data to create a PasswordResetToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PasswordResetToken we want to update
     *   }
     * })
     */
    upsert<T extends PasswordResetTokenUpsertArgs>(args: SelectSubset<T, PasswordResetTokenUpsertArgs<ExtArgs>>): Prisma__PasswordResetTokenClient<$Result.GetResult<Prisma.$PasswordResetTokenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PasswordResetTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenCountArgs} args - Arguments to filter PasswordResetTokens to count.
     * @example
     * // Count the number of PasswordResetTokens
     * const count = await prisma.passwordResetToken.count({
     *   where: {
     *     // ... the filter for the PasswordResetTokens we want to count
     *   }
     * })
    **/
    count<T extends PasswordResetTokenCountArgs>(
      args?: Subset<T, PasswordResetTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PasswordResetTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PasswordResetToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PasswordResetTokenAggregateArgs>(args: Subset<T, PasswordResetTokenAggregateArgs>): Prisma.PrismaPromise<GetPasswordResetTokenAggregateType<T>>

    /**
     * Group by PasswordResetToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PasswordResetTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PasswordResetTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PasswordResetTokenGroupByArgs['orderBy'] }
        : { orderBy?: PasswordResetTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PasswordResetTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPasswordResetTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PasswordResetToken model
   */
  readonly fields: PasswordResetTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PasswordResetToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PasswordResetTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PasswordResetToken model
   */ 
  interface PasswordResetTokenFieldRefs {
    readonly id: FieldRef<"PasswordResetToken", 'String'>
    readonly userId: FieldRef<"PasswordResetToken", 'String'>
    readonly tokenHash: FieldRef<"PasswordResetToken", 'String'>
    readonly expiresAt: FieldRef<"PasswordResetToken", 'DateTime'>
    readonly usedAt: FieldRef<"PasswordResetToken", 'DateTime'>
    readonly createdAt: FieldRef<"PasswordResetToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PasswordResetToken findUnique
   */
  export type PasswordResetTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken findUniqueOrThrow
   */
  export type PasswordResetTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken findFirst
   */
  export type PasswordResetTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResetTokens.
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResetTokens.
     */
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * PasswordResetToken findFirstOrThrow
   */
  export type PasswordResetTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetToken to fetch.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PasswordResetTokens.
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PasswordResetTokens.
     */
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * PasswordResetToken findMany
   */
  export type PasswordResetTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter, which PasswordResetTokens to fetch.
     */
    where?: PasswordResetTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PasswordResetTokens to fetch.
     */
    orderBy?: PasswordResetTokenOrderByWithRelationInput | PasswordResetTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PasswordResetTokens.
     */
    cursor?: PasswordResetTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PasswordResetTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PasswordResetTokens.
     */
    skip?: number
    distinct?: PasswordResetTokenScalarFieldEnum | PasswordResetTokenScalarFieldEnum[]
  }

  /**
   * PasswordResetToken create
   */
  export type PasswordResetTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a PasswordResetToken.
     */
    data: XOR<PasswordResetTokenCreateInput, PasswordResetTokenUncheckedCreateInput>
  }

  /**
   * PasswordResetToken createMany
   */
  export type PasswordResetTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PasswordResetTokens.
     */
    data: PasswordResetTokenCreateManyInput | PasswordResetTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PasswordResetToken createManyAndReturn
   */
  export type PasswordResetTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PasswordResetTokens.
     */
    data: PasswordResetTokenCreateManyInput | PasswordResetTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PasswordResetToken update
   */
  export type PasswordResetTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a PasswordResetToken.
     */
    data: XOR<PasswordResetTokenUpdateInput, PasswordResetTokenUncheckedUpdateInput>
    /**
     * Choose, which PasswordResetToken to update.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken updateMany
   */
  export type PasswordResetTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PasswordResetTokens.
     */
    data: XOR<PasswordResetTokenUpdateManyMutationInput, PasswordResetTokenUncheckedUpdateManyInput>
    /**
     * Filter which PasswordResetTokens to update
     */
    where?: PasswordResetTokenWhereInput
  }

  /**
   * PasswordResetToken upsert
   */
  export type PasswordResetTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the PasswordResetToken to update in case it exists.
     */
    where: PasswordResetTokenWhereUniqueInput
    /**
     * In case the PasswordResetToken found by the `where` argument doesn't exist, create a new PasswordResetToken with this data.
     */
    create: XOR<PasswordResetTokenCreateInput, PasswordResetTokenUncheckedCreateInput>
    /**
     * In case the PasswordResetToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PasswordResetTokenUpdateInput, PasswordResetTokenUncheckedUpdateInput>
  }

  /**
   * PasswordResetToken delete
   */
  export type PasswordResetTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
    /**
     * Filter which PasswordResetToken to delete.
     */
    where: PasswordResetTokenWhereUniqueInput
  }

  /**
   * PasswordResetToken deleteMany
   */
  export type PasswordResetTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PasswordResetTokens to delete
     */
    where?: PasswordResetTokenWhereInput
  }

  /**
   * PasswordResetToken without action
   */
  export type PasswordResetTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PasswordResetToken
     */
    select?: PasswordResetTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PasswordResetTokenInclude<ExtArgs> | null
  }


  /**
   * Model EmployeeProfile
   */

  export type AggregateEmployeeProfile = {
    _count: EmployeeProfileCountAggregateOutputType | null
    _min: EmployeeProfileMinAggregateOutputType | null
    _max: EmployeeProfileMaxAggregateOutputType | null
  }

  export type EmployeeProfileMinAggregateOutputType = {
    id: string | null
    teamId: string | null
    managerId: string | null
    level: string | null
    vbid: string | null
    comment: string | null
    targetType: $Enums.TargetType | null
    isActive: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmployeeProfileMaxAggregateOutputType = {
    id: string | null
    teamId: string | null
    managerId: string | null
    level: string | null
    vbid: string | null
    comment: string | null
    targetType: $Enums.TargetType | null
    isActive: boolean | null
    deletedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type EmployeeProfileCountAggregateOutputType = {
    id: number
    teamId: number
    managerId: number
    level: number
    vbid: number
    comment: number
    targetType: number
    isActive: number
    deletedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type EmployeeProfileMinAggregateInputType = {
    id?: true
    teamId?: true
    managerId?: true
    level?: true
    vbid?: true
    comment?: true
    targetType?: true
    isActive?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmployeeProfileMaxAggregateInputType = {
    id?: true
    teamId?: true
    managerId?: true
    level?: true
    vbid?: true
    comment?: true
    targetType?: true
    isActive?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type EmployeeProfileCountAggregateInputType = {
    id?: true
    teamId?: true
    managerId?: true
    level?: true
    vbid?: true
    comment?: true
    targetType?: true
    isActive?: true
    deletedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type EmployeeProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmployeeProfile to aggregate.
     */
    where?: EmployeeProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmployeeProfiles to fetch.
     */
    orderBy?: EmployeeProfileOrderByWithRelationInput | EmployeeProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmployeeProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmployeeProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmployeeProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmployeeProfiles
    **/
    _count?: true | EmployeeProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmployeeProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmployeeProfileMaxAggregateInputType
  }

  export type GetEmployeeProfileAggregateType<T extends EmployeeProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateEmployeeProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmployeeProfile[P]>
      : GetScalarType<T[P], AggregateEmployeeProfile[P]>
  }




  export type EmployeeProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmployeeProfileWhereInput
    orderBy?: EmployeeProfileOrderByWithAggregationInput | EmployeeProfileOrderByWithAggregationInput[]
    by: EmployeeProfileScalarFieldEnum[] | EmployeeProfileScalarFieldEnum
    having?: EmployeeProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmployeeProfileCountAggregateInputType | true
    _min?: EmployeeProfileMinAggregateInputType
    _max?: EmployeeProfileMaxAggregateInputType
  }

  export type EmployeeProfileGroupByOutputType = {
    id: string
    teamId: string | null
    managerId: string | null
    level: string | null
    vbid: string | null
    comment: string | null
    targetType: $Enums.TargetType
    isActive: boolean
    deletedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: EmployeeProfileCountAggregateOutputType | null
    _min: EmployeeProfileMinAggregateOutputType | null
    _max: EmployeeProfileMaxAggregateOutputType | null
  }

  type GetEmployeeProfileGroupByPayload<T extends EmployeeProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmployeeProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmployeeProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmployeeProfileGroupByOutputType[P]>
            : GetScalarType<T[P], EmployeeProfileGroupByOutputType[P]>
        }
      >
    >


  export type EmployeeProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    managerId?: boolean
    level?: boolean
    vbid?: boolean
    comment?: boolean
    targetType?: boolean
    isActive?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    team?: boolean | EmployeeProfile$teamArgs<ExtArgs>
    manager?: boolean | EmployeeProfile$managerArgs<ExtArgs>
  }, ExtArgs["result"]["employeeProfile"]>

  export type EmployeeProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    managerId?: boolean
    level?: boolean
    vbid?: boolean
    comment?: boolean
    targetType?: boolean
    isActive?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    team?: boolean | EmployeeProfile$teamArgs<ExtArgs>
    manager?: boolean | EmployeeProfile$managerArgs<ExtArgs>
  }, ExtArgs["result"]["employeeProfile"]>

  export type EmployeeProfileSelectScalar = {
    id?: boolean
    teamId?: boolean
    managerId?: boolean
    level?: boolean
    vbid?: boolean
    comment?: boolean
    targetType?: boolean
    isActive?: boolean
    deletedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type EmployeeProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    team?: boolean | EmployeeProfile$teamArgs<ExtArgs>
    manager?: boolean | EmployeeProfile$managerArgs<ExtArgs>
  }
  export type EmployeeProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    team?: boolean | EmployeeProfile$teamArgs<ExtArgs>
    manager?: boolean | EmployeeProfile$managerArgs<ExtArgs>
  }

  export type $EmployeeProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmployeeProfile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      team: Prisma.$TeamPayload<ExtArgs> | null
      manager: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      teamId: string | null
      managerId: string | null
      level: string | null
      /**
       * VBID is unique per profile (null allowed; non-null values must be unique across all users).
       */
      vbid: string | null
      /**
       * Admin-written comment shown in L4 dashboard slab box
       */
      comment: string | null
      targetType: $Enums.TargetType
      isActive: boolean
      deletedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["employeeProfile"]>
    composites: {}
  }

  type EmployeeProfileGetPayload<S extends boolean | null | undefined | EmployeeProfileDefaultArgs> = $Result.GetResult<Prisma.$EmployeeProfilePayload, S>

  type EmployeeProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmployeeProfileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EmployeeProfileCountAggregateInputType | true
    }

  export interface EmployeeProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmployeeProfile'], meta: { name: 'EmployeeProfile' } }
    /**
     * Find zero or one EmployeeProfile that matches the filter.
     * @param {EmployeeProfileFindUniqueArgs} args - Arguments to find a EmployeeProfile
     * @example
     * // Get one EmployeeProfile
     * const employeeProfile = await prisma.employeeProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmployeeProfileFindUniqueArgs>(args: SelectSubset<T, EmployeeProfileFindUniqueArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one EmployeeProfile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EmployeeProfileFindUniqueOrThrowArgs} args - Arguments to find a EmployeeProfile
     * @example
     * // Get one EmployeeProfile
     * const employeeProfile = await prisma.employeeProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmployeeProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, EmployeeProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first EmployeeProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeProfileFindFirstArgs} args - Arguments to find a EmployeeProfile
     * @example
     * // Get one EmployeeProfile
     * const employeeProfile = await prisma.employeeProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmployeeProfileFindFirstArgs>(args?: SelectSubset<T, EmployeeProfileFindFirstArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first EmployeeProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeProfileFindFirstOrThrowArgs} args - Arguments to find a EmployeeProfile
     * @example
     * // Get one EmployeeProfile
     * const employeeProfile = await prisma.employeeProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmployeeProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, EmployeeProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more EmployeeProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmployeeProfiles
     * const employeeProfiles = await prisma.employeeProfile.findMany()
     * 
     * // Get first 10 EmployeeProfiles
     * const employeeProfiles = await prisma.employeeProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const employeeProfileWithIdOnly = await prisma.employeeProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmployeeProfileFindManyArgs>(args?: SelectSubset<T, EmployeeProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a EmployeeProfile.
     * @param {EmployeeProfileCreateArgs} args - Arguments to create a EmployeeProfile.
     * @example
     * // Create one EmployeeProfile
     * const EmployeeProfile = await prisma.employeeProfile.create({
     *   data: {
     *     // ... data to create a EmployeeProfile
     *   }
     * })
     * 
     */
    create<T extends EmployeeProfileCreateArgs>(args: SelectSubset<T, EmployeeProfileCreateArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many EmployeeProfiles.
     * @param {EmployeeProfileCreateManyArgs} args - Arguments to create many EmployeeProfiles.
     * @example
     * // Create many EmployeeProfiles
     * const employeeProfile = await prisma.employeeProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmployeeProfileCreateManyArgs>(args?: SelectSubset<T, EmployeeProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmployeeProfiles and returns the data saved in the database.
     * @param {EmployeeProfileCreateManyAndReturnArgs} args - Arguments to create many EmployeeProfiles.
     * @example
     * // Create many EmployeeProfiles
     * const employeeProfile = await prisma.employeeProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmployeeProfiles and only return the `id`
     * const employeeProfileWithIdOnly = await prisma.employeeProfile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmployeeProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, EmployeeProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a EmployeeProfile.
     * @param {EmployeeProfileDeleteArgs} args - Arguments to delete one EmployeeProfile.
     * @example
     * // Delete one EmployeeProfile
     * const EmployeeProfile = await prisma.employeeProfile.delete({
     *   where: {
     *     // ... filter to delete one EmployeeProfile
     *   }
     * })
     * 
     */
    delete<T extends EmployeeProfileDeleteArgs>(args: SelectSubset<T, EmployeeProfileDeleteArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one EmployeeProfile.
     * @param {EmployeeProfileUpdateArgs} args - Arguments to update one EmployeeProfile.
     * @example
     * // Update one EmployeeProfile
     * const employeeProfile = await prisma.employeeProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmployeeProfileUpdateArgs>(args: SelectSubset<T, EmployeeProfileUpdateArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more EmployeeProfiles.
     * @param {EmployeeProfileDeleteManyArgs} args - Arguments to filter EmployeeProfiles to delete.
     * @example
     * // Delete a few EmployeeProfiles
     * const { count } = await prisma.employeeProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmployeeProfileDeleteManyArgs>(args?: SelectSubset<T, EmployeeProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmployeeProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmployeeProfiles
     * const employeeProfile = await prisma.employeeProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmployeeProfileUpdateManyArgs>(args: SelectSubset<T, EmployeeProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one EmployeeProfile.
     * @param {EmployeeProfileUpsertArgs} args - Arguments to update or create a EmployeeProfile.
     * @example
     * // Update or create a EmployeeProfile
     * const employeeProfile = await prisma.employeeProfile.upsert({
     *   create: {
     *     // ... data to create a EmployeeProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmployeeProfile we want to update
     *   }
     * })
     */
    upsert<T extends EmployeeProfileUpsertArgs>(args: SelectSubset<T, EmployeeProfileUpsertArgs<ExtArgs>>): Prisma__EmployeeProfileClient<$Result.GetResult<Prisma.$EmployeeProfilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of EmployeeProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeProfileCountArgs} args - Arguments to filter EmployeeProfiles to count.
     * @example
     * // Count the number of EmployeeProfiles
     * const count = await prisma.employeeProfile.count({
     *   where: {
     *     // ... the filter for the EmployeeProfiles we want to count
     *   }
     * })
    **/
    count<T extends EmployeeProfileCountArgs>(
      args?: Subset<T, EmployeeProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmployeeProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmployeeProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmployeeProfileAggregateArgs>(args: Subset<T, EmployeeProfileAggregateArgs>): Prisma.PrismaPromise<GetEmployeeProfileAggregateType<T>>

    /**
     * Group by EmployeeProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmployeeProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmployeeProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmployeeProfileGroupByArgs['orderBy'] }
        : { orderBy?: EmployeeProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmployeeProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmployeeProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmployeeProfile model
   */
  readonly fields: EmployeeProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmployeeProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmployeeProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    team<T extends EmployeeProfile$teamArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeProfile$teamArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    manager<T extends EmployeeProfile$managerArgs<ExtArgs> = {}>(args?: Subset<T, EmployeeProfile$managerArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmployeeProfile model
   */ 
  interface EmployeeProfileFieldRefs {
    readonly id: FieldRef<"EmployeeProfile", 'String'>
    readonly teamId: FieldRef<"EmployeeProfile", 'String'>
    readonly managerId: FieldRef<"EmployeeProfile", 'String'>
    readonly level: FieldRef<"EmployeeProfile", 'String'>
    readonly vbid: FieldRef<"EmployeeProfile", 'String'>
    readonly comment: FieldRef<"EmployeeProfile", 'String'>
    readonly targetType: FieldRef<"EmployeeProfile", 'TargetType'>
    readonly isActive: FieldRef<"EmployeeProfile", 'Boolean'>
    readonly deletedAt: FieldRef<"EmployeeProfile", 'DateTime'>
    readonly createdAt: FieldRef<"EmployeeProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"EmployeeProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmployeeProfile findUnique
   */
  export type EmployeeProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * Filter, which EmployeeProfile to fetch.
     */
    where: EmployeeProfileWhereUniqueInput
  }

  /**
   * EmployeeProfile findUniqueOrThrow
   */
  export type EmployeeProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * Filter, which EmployeeProfile to fetch.
     */
    where: EmployeeProfileWhereUniqueInput
  }

  /**
   * EmployeeProfile findFirst
   */
  export type EmployeeProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * Filter, which EmployeeProfile to fetch.
     */
    where?: EmployeeProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmployeeProfiles to fetch.
     */
    orderBy?: EmployeeProfileOrderByWithRelationInput | EmployeeProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmployeeProfiles.
     */
    cursor?: EmployeeProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmployeeProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmployeeProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmployeeProfiles.
     */
    distinct?: EmployeeProfileScalarFieldEnum | EmployeeProfileScalarFieldEnum[]
  }

  /**
   * EmployeeProfile findFirstOrThrow
   */
  export type EmployeeProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * Filter, which EmployeeProfile to fetch.
     */
    where?: EmployeeProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmployeeProfiles to fetch.
     */
    orderBy?: EmployeeProfileOrderByWithRelationInput | EmployeeProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmployeeProfiles.
     */
    cursor?: EmployeeProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmployeeProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmployeeProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmployeeProfiles.
     */
    distinct?: EmployeeProfileScalarFieldEnum | EmployeeProfileScalarFieldEnum[]
  }

  /**
   * EmployeeProfile findMany
   */
  export type EmployeeProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * Filter, which EmployeeProfiles to fetch.
     */
    where?: EmployeeProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmployeeProfiles to fetch.
     */
    orderBy?: EmployeeProfileOrderByWithRelationInput | EmployeeProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmployeeProfiles.
     */
    cursor?: EmployeeProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmployeeProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmployeeProfiles.
     */
    skip?: number
    distinct?: EmployeeProfileScalarFieldEnum | EmployeeProfileScalarFieldEnum[]
  }

  /**
   * EmployeeProfile create
   */
  export type EmployeeProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a EmployeeProfile.
     */
    data: XOR<EmployeeProfileCreateInput, EmployeeProfileUncheckedCreateInput>
  }

  /**
   * EmployeeProfile createMany
   */
  export type EmployeeProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmployeeProfiles.
     */
    data: EmployeeProfileCreateManyInput | EmployeeProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmployeeProfile createManyAndReturn
   */
  export type EmployeeProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many EmployeeProfiles.
     */
    data: EmployeeProfileCreateManyInput | EmployeeProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmployeeProfile update
   */
  export type EmployeeProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a EmployeeProfile.
     */
    data: XOR<EmployeeProfileUpdateInput, EmployeeProfileUncheckedUpdateInput>
    /**
     * Choose, which EmployeeProfile to update.
     */
    where: EmployeeProfileWhereUniqueInput
  }

  /**
   * EmployeeProfile updateMany
   */
  export type EmployeeProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmployeeProfiles.
     */
    data: XOR<EmployeeProfileUpdateManyMutationInput, EmployeeProfileUncheckedUpdateManyInput>
    /**
     * Filter which EmployeeProfiles to update
     */
    where?: EmployeeProfileWhereInput
  }

  /**
   * EmployeeProfile upsert
   */
  export type EmployeeProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the EmployeeProfile to update in case it exists.
     */
    where: EmployeeProfileWhereUniqueInput
    /**
     * In case the EmployeeProfile found by the `where` argument doesn't exist, create a new EmployeeProfile with this data.
     */
    create: XOR<EmployeeProfileCreateInput, EmployeeProfileUncheckedCreateInput>
    /**
     * In case the EmployeeProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmployeeProfileUpdateInput, EmployeeProfileUncheckedUpdateInput>
  }

  /**
   * EmployeeProfile delete
   */
  export type EmployeeProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
    /**
     * Filter which EmployeeProfile to delete.
     */
    where: EmployeeProfileWhereUniqueInput
  }

  /**
   * EmployeeProfile deleteMany
   */
  export type EmployeeProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmployeeProfiles to delete
     */
    where?: EmployeeProfileWhereInput
  }

  /**
   * EmployeeProfile.team
   */
  export type EmployeeProfile$teamArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    where?: TeamWhereInput
  }

  /**
   * EmployeeProfile.manager
   */
  export type EmployeeProfile$managerArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * EmployeeProfile without action
   */
  export type EmployeeProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmployeeProfile
     */
    select?: EmployeeProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmployeeProfileInclude<ExtArgs> | null
  }


  /**
   * Model RefreshToken
   */

  export type AggregateRefreshToken = {
    _count: RefreshTokenCountAggregateOutputType | null
    _min: RefreshTokenMinAggregateOutputType | null
    _max: RefreshTokenMaxAggregateOutputType | null
  }

  export type RefreshTokenMinAggregateOutputType = {
    id: string | null
    token: string | null
    userId: string | null
    isRevoked: boolean | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type RefreshTokenMaxAggregateOutputType = {
    id: string | null
    token: string | null
    userId: string | null
    isRevoked: boolean | null
    expiresAt: Date | null
    createdAt: Date | null
  }

  export type RefreshTokenCountAggregateOutputType = {
    id: number
    token: number
    userId: number
    isRevoked: number
    expiresAt: number
    createdAt: number
    _all: number
  }


  export type RefreshTokenMinAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    isRevoked?: true
    expiresAt?: true
    createdAt?: true
  }

  export type RefreshTokenMaxAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    isRevoked?: true
    expiresAt?: true
    createdAt?: true
  }

  export type RefreshTokenCountAggregateInputType = {
    id?: true
    token?: true
    userId?: true
    isRevoked?: true
    expiresAt?: true
    createdAt?: true
    _all?: true
  }

  export type RefreshTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefreshToken to aggregate.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RefreshTokens
    **/
    _count?: true | RefreshTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RefreshTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RefreshTokenMaxAggregateInputType
  }

  export type GetRefreshTokenAggregateType<T extends RefreshTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateRefreshToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRefreshToken[P]>
      : GetScalarType<T[P], AggregateRefreshToken[P]>
  }




  export type RefreshTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RefreshTokenWhereInput
    orderBy?: RefreshTokenOrderByWithAggregationInput | RefreshTokenOrderByWithAggregationInput[]
    by: RefreshTokenScalarFieldEnum[] | RefreshTokenScalarFieldEnum
    having?: RefreshTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RefreshTokenCountAggregateInputType | true
    _min?: RefreshTokenMinAggregateInputType
    _max?: RefreshTokenMaxAggregateInputType
  }

  export type RefreshTokenGroupByOutputType = {
    id: string
    token: string
    userId: string
    isRevoked: boolean
    expiresAt: Date
    createdAt: Date
    _count: RefreshTokenCountAggregateOutputType | null
    _min: RefreshTokenMinAggregateOutputType | null
    _max: RefreshTokenMaxAggregateOutputType | null
  }

  type GetRefreshTokenGroupByPayload<T extends RefreshTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RefreshTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RefreshTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RefreshTokenGroupByOutputType[P]>
            : GetScalarType<T[P], RefreshTokenGroupByOutputType[P]>
        }
      >
    >


  export type RefreshTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    isRevoked?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refreshToken"]>

  export type RefreshTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    token?: boolean
    userId?: boolean
    isRevoked?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["refreshToken"]>

  export type RefreshTokenSelectScalar = {
    id?: boolean
    token?: boolean
    userId?: boolean
    isRevoked?: boolean
    expiresAt?: boolean
    createdAt?: boolean
  }

  export type RefreshTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RefreshTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RefreshTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RefreshToken"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      token: string
      userId: string
      isRevoked: boolean
      expiresAt: Date
      createdAt: Date
    }, ExtArgs["result"]["refreshToken"]>
    composites: {}
  }

  type RefreshTokenGetPayload<S extends boolean | null | undefined | RefreshTokenDefaultArgs> = $Result.GetResult<Prisma.$RefreshTokenPayload, S>

  type RefreshTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RefreshTokenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RefreshTokenCountAggregateInputType | true
    }

  export interface RefreshTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RefreshToken'], meta: { name: 'RefreshToken' } }
    /**
     * Find zero or one RefreshToken that matches the filter.
     * @param {RefreshTokenFindUniqueArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RefreshTokenFindUniqueArgs>(args: SelectSubset<T, RefreshTokenFindUniqueArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RefreshToken that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RefreshTokenFindUniqueOrThrowArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RefreshTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, RefreshTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RefreshToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindFirstArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RefreshTokenFindFirstArgs>(args?: SelectSubset<T, RefreshTokenFindFirstArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RefreshToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindFirstOrThrowArgs} args - Arguments to find a RefreshToken
     * @example
     * // Get one RefreshToken
     * const refreshToken = await prisma.refreshToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RefreshTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, RefreshTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RefreshTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RefreshTokens
     * const refreshTokens = await prisma.refreshToken.findMany()
     * 
     * // Get first 10 RefreshTokens
     * const refreshTokens = await prisma.refreshToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const refreshTokenWithIdOnly = await prisma.refreshToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RefreshTokenFindManyArgs>(args?: SelectSubset<T, RefreshTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RefreshToken.
     * @param {RefreshTokenCreateArgs} args - Arguments to create a RefreshToken.
     * @example
     * // Create one RefreshToken
     * const RefreshToken = await prisma.refreshToken.create({
     *   data: {
     *     // ... data to create a RefreshToken
     *   }
     * })
     * 
     */
    create<T extends RefreshTokenCreateArgs>(args: SelectSubset<T, RefreshTokenCreateArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RefreshTokens.
     * @param {RefreshTokenCreateManyArgs} args - Arguments to create many RefreshTokens.
     * @example
     * // Create many RefreshTokens
     * const refreshToken = await prisma.refreshToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RefreshTokenCreateManyArgs>(args?: SelectSubset<T, RefreshTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RefreshTokens and returns the data saved in the database.
     * @param {RefreshTokenCreateManyAndReturnArgs} args - Arguments to create many RefreshTokens.
     * @example
     * // Create many RefreshTokens
     * const refreshToken = await prisma.refreshToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RefreshTokens and only return the `id`
     * const refreshTokenWithIdOnly = await prisma.refreshToken.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RefreshTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, RefreshTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RefreshToken.
     * @param {RefreshTokenDeleteArgs} args - Arguments to delete one RefreshToken.
     * @example
     * // Delete one RefreshToken
     * const RefreshToken = await prisma.refreshToken.delete({
     *   where: {
     *     // ... filter to delete one RefreshToken
     *   }
     * })
     * 
     */
    delete<T extends RefreshTokenDeleteArgs>(args: SelectSubset<T, RefreshTokenDeleteArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RefreshToken.
     * @param {RefreshTokenUpdateArgs} args - Arguments to update one RefreshToken.
     * @example
     * // Update one RefreshToken
     * const refreshToken = await prisma.refreshToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RefreshTokenUpdateArgs>(args: SelectSubset<T, RefreshTokenUpdateArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RefreshTokens.
     * @param {RefreshTokenDeleteManyArgs} args - Arguments to filter RefreshTokens to delete.
     * @example
     * // Delete a few RefreshTokens
     * const { count } = await prisma.refreshToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RefreshTokenDeleteManyArgs>(args?: SelectSubset<T, RefreshTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RefreshTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RefreshTokens
     * const refreshToken = await prisma.refreshToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RefreshTokenUpdateManyArgs>(args: SelectSubset<T, RefreshTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RefreshToken.
     * @param {RefreshTokenUpsertArgs} args - Arguments to update or create a RefreshToken.
     * @example
     * // Update or create a RefreshToken
     * const refreshToken = await prisma.refreshToken.upsert({
     *   create: {
     *     // ... data to create a RefreshToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RefreshToken we want to update
     *   }
     * })
     */
    upsert<T extends RefreshTokenUpsertArgs>(args: SelectSubset<T, RefreshTokenUpsertArgs<ExtArgs>>): Prisma__RefreshTokenClient<$Result.GetResult<Prisma.$RefreshTokenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RefreshTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenCountArgs} args - Arguments to filter RefreshTokens to count.
     * @example
     * // Count the number of RefreshTokens
     * const count = await prisma.refreshToken.count({
     *   where: {
     *     // ... the filter for the RefreshTokens we want to count
     *   }
     * })
    **/
    count<T extends RefreshTokenCountArgs>(
      args?: Subset<T, RefreshTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RefreshTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RefreshToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RefreshTokenAggregateArgs>(args: Subset<T, RefreshTokenAggregateArgs>): Prisma.PrismaPromise<GetRefreshTokenAggregateType<T>>

    /**
     * Group by RefreshToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RefreshTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RefreshTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RefreshTokenGroupByArgs['orderBy'] }
        : { orderBy?: RefreshTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RefreshTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRefreshTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RefreshToken model
   */
  readonly fields: RefreshTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RefreshToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RefreshTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RefreshToken model
   */ 
  interface RefreshTokenFieldRefs {
    readonly id: FieldRef<"RefreshToken", 'String'>
    readonly token: FieldRef<"RefreshToken", 'String'>
    readonly userId: FieldRef<"RefreshToken", 'String'>
    readonly isRevoked: FieldRef<"RefreshToken", 'Boolean'>
    readonly expiresAt: FieldRef<"RefreshToken", 'DateTime'>
    readonly createdAt: FieldRef<"RefreshToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RefreshToken findUnique
   */
  export type RefreshTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken findUniqueOrThrow
   */
  export type RefreshTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken findFirst
   */
  export type RefreshTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefreshTokens.
     */
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken findFirstOrThrow
   */
  export type RefreshTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshToken to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RefreshTokens.
     */
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken findMany
   */
  export type RefreshTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter, which RefreshTokens to fetch.
     */
    where?: RefreshTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RefreshTokens to fetch.
     */
    orderBy?: RefreshTokenOrderByWithRelationInput | RefreshTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RefreshTokens.
     */
    cursor?: RefreshTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RefreshTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RefreshTokens.
     */
    skip?: number
    distinct?: RefreshTokenScalarFieldEnum | RefreshTokenScalarFieldEnum[]
  }

  /**
   * RefreshToken create
   */
  export type RefreshTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a RefreshToken.
     */
    data: XOR<RefreshTokenCreateInput, RefreshTokenUncheckedCreateInput>
  }

  /**
   * RefreshToken createMany
   */
  export type RefreshTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RefreshTokens.
     */
    data: RefreshTokenCreateManyInput | RefreshTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RefreshToken createManyAndReturn
   */
  export type RefreshTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RefreshTokens.
     */
    data: RefreshTokenCreateManyInput | RefreshTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RefreshToken update
   */
  export type RefreshTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a RefreshToken.
     */
    data: XOR<RefreshTokenUpdateInput, RefreshTokenUncheckedUpdateInput>
    /**
     * Choose, which RefreshToken to update.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken updateMany
   */
  export type RefreshTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RefreshTokens.
     */
    data: XOR<RefreshTokenUpdateManyMutationInput, RefreshTokenUncheckedUpdateManyInput>
    /**
     * Filter which RefreshTokens to update
     */
    where?: RefreshTokenWhereInput
  }

  /**
   * RefreshToken upsert
   */
  export type RefreshTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the RefreshToken to update in case it exists.
     */
    where: RefreshTokenWhereUniqueInput
    /**
     * In case the RefreshToken found by the `where` argument doesn't exist, create a new RefreshToken with this data.
     */
    create: XOR<RefreshTokenCreateInput, RefreshTokenUncheckedCreateInput>
    /**
     * In case the RefreshToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RefreshTokenUpdateInput, RefreshTokenUncheckedUpdateInput>
  }

  /**
   * RefreshToken delete
   */
  export type RefreshTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
    /**
     * Filter which RefreshToken to delete.
     */
    where: RefreshTokenWhereUniqueInput
  }

  /**
   * RefreshToken deleteMany
   */
  export type RefreshTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RefreshTokens to delete
     */
    where?: RefreshTokenWhereInput
  }

  /**
   * RefreshToken without action
   */
  export type RefreshTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RefreshToken
     */
    select?: RefreshTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RefreshTokenInclude<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    actorId: string | null
    action: string | null
    module: string | null
    entityType: string | null
    entityId: string | null
    status: string | null
    ipAddress: string | null
    userAgent: string | null
    geoLocation: string | null
    createdAt: Date | null
    isTampered: boolean | null
    hash: string | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    actorId: string | null
    action: string | null
    module: string | null
    entityType: string | null
    entityId: string | null
    status: string | null
    ipAddress: string | null
    userAgent: string | null
    geoLocation: string | null
    createdAt: Date | null
    isTampered: boolean | null
    hash: string | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    actorId: number
    action: number
    module: number
    entityType: number
    entityId: number
    changes: number
    status: number
    ipAddress: number
    userAgent: number
    geoLocation: number
    createdAt: number
    isTampered: number
    hash: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    actorId?: true
    action?: true
    module?: true
    entityType?: true
    entityId?: true
    status?: true
    ipAddress?: true
    userAgent?: true
    geoLocation?: true
    createdAt?: true
    isTampered?: true
    hash?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    actorId?: true
    action?: true
    module?: true
    entityType?: true
    entityId?: true
    status?: true
    ipAddress?: true
    userAgent?: true
    geoLocation?: true
    createdAt?: true
    isTampered?: true
    hash?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    actorId?: true
    action?: true
    module?: true
    entityType?: true
    entityId?: true
    changes?: true
    status?: true
    ipAddress?: true
    userAgent?: true
    geoLocation?: true
    createdAt?: true
    isTampered?: true
    hash?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    actorId: string | null
    action: string
    module: string | null
    entityType: string | null
    entityId: string | null
    changes: JsonValue | null
    status: string
    ipAddress: string | null
    userAgent: string | null
    geoLocation: string | null
    createdAt: Date
    isTampered: boolean
    hash: string | null
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    actorId?: boolean
    action?: boolean
    module?: boolean
    entityType?: boolean
    entityId?: boolean
    changes?: boolean
    status?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    geoLocation?: boolean
    createdAt?: boolean
    isTampered?: boolean
    hash?: boolean
    actor?: boolean | AuditLog$actorArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    actorId?: boolean
    action?: boolean
    module?: boolean
    entityType?: boolean
    entityId?: boolean
    changes?: boolean
    status?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    geoLocation?: boolean
    createdAt?: boolean
    isTampered?: boolean
    hash?: boolean
    actor?: boolean | AuditLog$actorArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    actorId?: boolean
    action?: boolean
    module?: boolean
    entityType?: boolean
    entityId?: boolean
    changes?: boolean
    status?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    geoLocation?: boolean
    createdAt?: boolean
    isTampered?: boolean
    hash?: boolean
  }

  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    actor?: boolean | AuditLog$actorArgs<ExtArgs>
  }
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    actor?: boolean | AuditLog$actorArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      actor: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      actorId: string | null
      action: string
      module: string | null
      entityType: string | null
      entityId: string | null
      changes: Prisma.JsonValue | null
      status: string
      ipAddress: string | null
      userAgent: string | null
      geoLocation: string | null
      createdAt: Date
      isTampered: boolean
      hash: string | null
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    actor<T extends AuditLog$actorArgs<ExtArgs> = {}>(args?: Subset<T, AuditLog$actorArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */ 
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly actorId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly module: FieldRef<"AuditLog", 'String'>
    readonly entityType: FieldRef<"AuditLog", 'String'>
    readonly entityId: FieldRef<"AuditLog", 'String'>
    readonly changes: FieldRef<"AuditLog", 'Json'>
    readonly status: FieldRef<"AuditLog", 'String'>
    readonly ipAddress: FieldRef<"AuditLog", 'String'>
    readonly userAgent: FieldRef<"AuditLog", 'String'>
    readonly geoLocation: FieldRef<"AuditLog", 'String'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
    readonly isTampered: FieldRef<"AuditLog", 'Boolean'>
    readonly hash: FieldRef<"AuditLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
  }

  /**
   * AuditLog.actor
   */
  export type AuditLog$actorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Model PlacementImportBatch
   */

  export type AggregatePlacementImportBatch = {
    _count: PlacementImportBatchCountAggregateOutputType | null
    _min: PlacementImportBatchMinAggregateOutputType | null
    _max: PlacementImportBatchMaxAggregateOutputType | null
  }

  export type PlacementImportBatchMinAggregateOutputType = {
    id: string | null
    type: $Enums.PlacementImportType | null
    uploaderId: string | null
    createdAt: Date | null
  }

  export type PlacementImportBatchMaxAggregateOutputType = {
    id: string | null
    type: $Enums.PlacementImportType | null
    uploaderId: string | null
    createdAt: Date | null
  }

  export type PlacementImportBatchCountAggregateOutputType = {
    id: number
    type: number
    uploaderId: number
    createdAt: number
    errors: number
    _all: number
  }


  export type PlacementImportBatchMinAggregateInputType = {
    id?: true
    type?: true
    uploaderId?: true
    createdAt?: true
  }

  export type PlacementImportBatchMaxAggregateInputType = {
    id?: true
    type?: true
    uploaderId?: true
    createdAt?: true
  }

  export type PlacementImportBatchCountAggregateInputType = {
    id?: true
    type?: true
    uploaderId?: true
    createdAt?: true
    errors?: true
    _all?: true
  }

  export type PlacementImportBatchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlacementImportBatch to aggregate.
     */
    where?: PlacementImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacementImportBatches to fetch.
     */
    orderBy?: PlacementImportBatchOrderByWithRelationInput | PlacementImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PlacementImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacementImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacementImportBatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PlacementImportBatches
    **/
    _count?: true | PlacementImportBatchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlacementImportBatchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlacementImportBatchMaxAggregateInputType
  }

  export type GetPlacementImportBatchAggregateType<T extends PlacementImportBatchAggregateArgs> = {
        [P in keyof T & keyof AggregatePlacementImportBatch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlacementImportBatch[P]>
      : GetScalarType<T[P], AggregatePlacementImportBatch[P]>
  }




  export type PlacementImportBatchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PlacementImportBatchWhereInput
    orderBy?: PlacementImportBatchOrderByWithAggregationInput | PlacementImportBatchOrderByWithAggregationInput[]
    by: PlacementImportBatchScalarFieldEnum[] | PlacementImportBatchScalarFieldEnum
    having?: PlacementImportBatchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlacementImportBatchCountAggregateInputType | true
    _min?: PlacementImportBatchMinAggregateInputType
    _max?: PlacementImportBatchMaxAggregateInputType
  }

  export type PlacementImportBatchGroupByOutputType = {
    id: string
    type: $Enums.PlacementImportType
    uploaderId: string
    createdAt: Date
    errors: JsonValue | null
    _count: PlacementImportBatchCountAggregateOutputType | null
    _min: PlacementImportBatchMinAggregateOutputType | null
    _max: PlacementImportBatchMaxAggregateOutputType | null
  }

  type GetPlacementImportBatchGroupByPayload<T extends PlacementImportBatchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PlacementImportBatchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlacementImportBatchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlacementImportBatchGroupByOutputType[P]>
            : GetScalarType<T[P], PlacementImportBatchGroupByOutputType[P]>
        }
      >
    >


  export type PlacementImportBatchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    uploaderId?: boolean
    createdAt?: boolean
    errors?: boolean
    uploader?: boolean | UserDefaultArgs<ExtArgs>
    personalPlacements?: boolean | PlacementImportBatch$personalPlacementsArgs<ExtArgs>
    teamPlacements?: boolean | PlacementImportBatch$teamPlacementsArgs<ExtArgs>
    _count?: boolean | PlacementImportBatchCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["placementImportBatch"]>

  export type PlacementImportBatchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    uploaderId?: boolean
    createdAt?: boolean
    errors?: boolean
    uploader?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["placementImportBatch"]>

  export type PlacementImportBatchSelectScalar = {
    id?: boolean
    type?: boolean
    uploaderId?: boolean
    createdAt?: boolean
    errors?: boolean
  }

  export type PlacementImportBatchInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    uploader?: boolean | UserDefaultArgs<ExtArgs>
    personalPlacements?: boolean | PlacementImportBatch$personalPlacementsArgs<ExtArgs>
    teamPlacements?: boolean | PlacementImportBatch$teamPlacementsArgs<ExtArgs>
    _count?: boolean | PlacementImportBatchCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PlacementImportBatchIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    uploader?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $PlacementImportBatchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PlacementImportBatch"
    objects: {
      uploader: Prisma.$UserPayload<ExtArgs>
      personalPlacements: Prisma.$PersonalPlacementPayload<ExtArgs>[]
      teamPlacements: Prisma.$TeamPlacementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: $Enums.PlacementImportType
      uploaderId: string
      createdAt: Date
      /**
       * Row-level validation errors: [{ rowIndex, message, field? }]
       */
      errors: Prisma.JsonValue | null
    }, ExtArgs["result"]["placementImportBatch"]>
    composites: {}
  }

  type PlacementImportBatchGetPayload<S extends boolean | null | undefined | PlacementImportBatchDefaultArgs> = $Result.GetResult<Prisma.$PlacementImportBatchPayload, S>

  type PlacementImportBatchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PlacementImportBatchFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PlacementImportBatchCountAggregateInputType | true
    }

  export interface PlacementImportBatchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PlacementImportBatch'], meta: { name: 'PlacementImportBatch' } }
    /**
     * Find zero or one PlacementImportBatch that matches the filter.
     * @param {PlacementImportBatchFindUniqueArgs} args - Arguments to find a PlacementImportBatch
     * @example
     * // Get one PlacementImportBatch
     * const placementImportBatch = await prisma.placementImportBatch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PlacementImportBatchFindUniqueArgs>(args: SelectSubset<T, PlacementImportBatchFindUniqueArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PlacementImportBatch that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PlacementImportBatchFindUniqueOrThrowArgs} args - Arguments to find a PlacementImportBatch
     * @example
     * // Get one PlacementImportBatch
     * const placementImportBatch = await prisma.placementImportBatch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PlacementImportBatchFindUniqueOrThrowArgs>(args: SelectSubset<T, PlacementImportBatchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PlacementImportBatch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacementImportBatchFindFirstArgs} args - Arguments to find a PlacementImportBatch
     * @example
     * // Get one PlacementImportBatch
     * const placementImportBatch = await prisma.placementImportBatch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PlacementImportBatchFindFirstArgs>(args?: SelectSubset<T, PlacementImportBatchFindFirstArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PlacementImportBatch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacementImportBatchFindFirstOrThrowArgs} args - Arguments to find a PlacementImportBatch
     * @example
     * // Get one PlacementImportBatch
     * const placementImportBatch = await prisma.placementImportBatch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PlacementImportBatchFindFirstOrThrowArgs>(args?: SelectSubset<T, PlacementImportBatchFindFirstOrThrowArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PlacementImportBatches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacementImportBatchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PlacementImportBatches
     * const placementImportBatches = await prisma.placementImportBatch.findMany()
     * 
     * // Get first 10 PlacementImportBatches
     * const placementImportBatches = await prisma.placementImportBatch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const placementImportBatchWithIdOnly = await prisma.placementImportBatch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PlacementImportBatchFindManyArgs>(args?: SelectSubset<T, PlacementImportBatchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PlacementImportBatch.
     * @param {PlacementImportBatchCreateArgs} args - Arguments to create a PlacementImportBatch.
     * @example
     * // Create one PlacementImportBatch
     * const PlacementImportBatch = await prisma.placementImportBatch.create({
     *   data: {
     *     // ... data to create a PlacementImportBatch
     *   }
     * })
     * 
     */
    create<T extends PlacementImportBatchCreateArgs>(args: SelectSubset<T, PlacementImportBatchCreateArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PlacementImportBatches.
     * @param {PlacementImportBatchCreateManyArgs} args - Arguments to create many PlacementImportBatches.
     * @example
     * // Create many PlacementImportBatches
     * const placementImportBatch = await prisma.placementImportBatch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PlacementImportBatchCreateManyArgs>(args?: SelectSubset<T, PlacementImportBatchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PlacementImportBatches and returns the data saved in the database.
     * @param {PlacementImportBatchCreateManyAndReturnArgs} args - Arguments to create many PlacementImportBatches.
     * @example
     * // Create many PlacementImportBatches
     * const placementImportBatch = await prisma.placementImportBatch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PlacementImportBatches and only return the `id`
     * const placementImportBatchWithIdOnly = await prisma.placementImportBatch.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PlacementImportBatchCreateManyAndReturnArgs>(args?: SelectSubset<T, PlacementImportBatchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PlacementImportBatch.
     * @param {PlacementImportBatchDeleteArgs} args - Arguments to delete one PlacementImportBatch.
     * @example
     * // Delete one PlacementImportBatch
     * const PlacementImportBatch = await prisma.placementImportBatch.delete({
     *   where: {
     *     // ... filter to delete one PlacementImportBatch
     *   }
     * })
     * 
     */
    delete<T extends PlacementImportBatchDeleteArgs>(args: SelectSubset<T, PlacementImportBatchDeleteArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PlacementImportBatch.
     * @param {PlacementImportBatchUpdateArgs} args - Arguments to update one PlacementImportBatch.
     * @example
     * // Update one PlacementImportBatch
     * const placementImportBatch = await prisma.placementImportBatch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PlacementImportBatchUpdateArgs>(args: SelectSubset<T, PlacementImportBatchUpdateArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PlacementImportBatches.
     * @param {PlacementImportBatchDeleteManyArgs} args - Arguments to filter PlacementImportBatches to delete.
     * @example
     * // Delete a few PlacementImportBatches
     * const { count } = await prisma.placementImportBatch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PlacementImportBatchDeleteManyArgs>(args?: SelectSubset<T, PlacementImportBatchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PlacementImportBatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacementImportBatchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PlacementImportBatches
     * const placementImportBatch = await prisma.placementImportBatch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PlacementImportBatchUpdateManyArgs>(args: SelectSubset<T, PlacementImportBatchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PlacementImportBatch.
     * @param {PlacementImportBatchUpsertArgs} args - Arguments to update or create a PlacementImportBatch.
     * @example
     * // Update or create a PlacementImportBatch
     * const placementImportBatch = await prisma.placementImportBatch.upsert({
     *   create: {
     *     // ... data to create a PlacementImportBatch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PlacementImportBatch we want to update
     *   }
     * })
     */
    upsert<T extends PlacementImportBatchUpsertArgs>(args: SelectSubset<T, PlacementImportBatchUpsertArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PlacementImportBatches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacementImportBatchCountArgs} args - Arguments to filter PlacementImportBatches to count.
     * @example
     * // Count the number of PlacementImportBatches
     * const count = await prisma.placementImportBatch.count({
     *   where: {
     *     // ... the filter for the PlacementImportBatches we want to count
     *   }
     * })
    **/
    count<T extends PlacementImportBatchCountArgs>(
      args?: Subset<T, PlacementImportBatchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlacementImportBatchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PlacementImportBatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacementImportBatchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlacementImportBatchAggregateArgs>(args: Subset<T, PlacementImportBatchAggregateArgs>): Prisma.PrismaPromise<GetPlacementImportBatchAggregateType<T>>

    /**
     * Group by PlacementImportBatch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlacementImportBatchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlacementImportBatchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlacementImportBatchGroupByArgs['orderBy'] }
        : { orderBy?: PlacementImportBatchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlacementImportBatchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlacementImportBatchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PlacementImportBatch model
   */
  readonly fields: PlacementImportBatchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PlacementImportBatch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PlacementImportBatchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    uploader<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    personalPlacements<T extends PlacementImportBatch$personalPlacementsArgs<ExtArgs> = {}>(args?: Subset<T, PlacementImportBatch$personalPlacementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "findMany"> | Null>
    teamPlacements<T extends PlacementImportBatch$teamPlacementsArgs<ExtArgs> = {}>(args?: Subset<T, PlacementImportBatch$teamPlacementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PlacementImportBatch model
   */ 
  interface PlacementImportBatchFieldRefs {
    readonly id: FieldRef<"PlacementImportBatch", 'String'>
    readonly type: FieldRef<"PlacementImportBatch", 'PlacementImportType'>
    readonly uploaderId: FieldRef<"PlacementImportBatch", 'String'>
    readonly createdAt: FieldRef<"PlacementImportBatch", 'DateTime'>
    readonly errors: FieldRef<"PlacementImportBatch", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * PlacementImportBatch findUnique
   */
  export type PlacementImportBatchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which PlacementImportBatch to fetch.
     */
    where: PlacementImportBatchWhereUniqueInput
  }

  /**
   * PlacementImportBatch findUniqueOrThrow
   */
  export type PlacementImportBatchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which PlacementImportBatch to fetch.
     */
    where: PlacementImportBatchWhereUniqueInput
  }

  /**
   * PlacementImportBatch findFirst
   */
  export type PlacementImportBatchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which PlacementImportBatch to fetch.
     */
    where?: PlacementImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacementImportBatches to fetch.
     */
    orderBy?: PlacementImportBatchOrderByWithRelationInput | PlacementImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlacementImportBatches.
     */
    cursor?: PlacementImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacementImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacementImportBatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlacementImportBatches.
     */
    distinct?: PlacementImportBatchScalarFieldEnum | PlacementImportBatchScalarFieldEnum[]
  }

  /**
   * PlacementImportBatch findFirstOrThrow
   */
  export type PlacementImportBatchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which PlacementImportBatch to fetch.
     */
    where?: PlacementImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacementImportBatches to fetch.
     */
    orderBy?: PlacementImportBatchOrderByWithRelationInput | PlacementImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PlacementImportBatches.
     */
    cursor?: PlacementImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacementImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacementImportBatches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PlacementImportBatches.
     */
    distinct?: PlacementImportBatchScalarFieldEnum | PlacementImportBatchScalarFieldEnum[]
  }

  /**
   * PlacementImportBatch findMany
   */
  export type PlacementImportBatchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * Filter, which PlacementImportBatches to fetch.
     */
    where?: PlacementImportBatchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PlacementImportBatches to fetch.
     */
    orderBy?: PlacementImportBatchOrderByWithRelationInput | PlacementImportBatchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PlacementImportBatches.
     */
    cursor?: PlacementImportBatchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PlacementImportBatches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PlacementImportBatches.
     */
    skip?: number
    distinct?: PlacementImportBatchScalarFieldEnum | PlacementImportBatchScalarFieldEnum[]
  }

  /**
   * PlacementImportBatch create
   */
  export type PlacementImportBatchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * The data needed to create a PlacementImportBatch.
     */
    data: XOR<PlacementImportBatchCreateInput, PlacementImportBatchUncheckedCreateInput>
  }

  /**
   * PlacementImportBatch createMany
   */
  export type PlacementImportBatchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PlacementImportBatches.
     */
    data: PlacementImportBatchCreateManyInput | PlacementImportBatchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PlacementImportBatch createManyAndReturn
   */
  export type PlacementImportBatchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PlacementImportBatches.
     */
    data: PlacementImportBatchCreateManyInput | PlacementImportBatchCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PlacementImportBatch update
   */
  export type PlacementImportBatchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * The data needed to update a PlacementImportBatch.
     */
    data: XOR<PlacementImportBatchUpdateInput, PlacementImportBatchUncheckedUpdateInput>
    /**
     * Choose, which PlacementImportBatch to update.
     */
    where: PlacementImportBatchWhereUniqueInput
  }

  /**
   * PlacementImportBatch updateMany
   */
  export type PlacementImportBatchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PlacementImportBatches.
     */
    data: XOR<PlacementImportBatchUpdateManyMutationInput, PlacementImportBatchUncheckedUpdateManyInput>
    /**
     * Filter which PlacementImportBatches to update
     */
    where?: PlacementImportBatchWhereInput
  }

  /**
   * PlacementImportBatch upsert
   */
  export type PlacementImportBatchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * The filter to search for the PlacementImportBatch to update in case it exists.
     */
    where: PlacementImportBatchWhereUniqueInput
    /**
     * In case the PlacementImportBatch found by the `where` argument doesn't exist, create a new PlacementImportBatch with this data.
     */
    create: XOR<PlacementImportBatchCreateInput, PlacementImportBatchUncheckedCreateInput>
    /**
     * In case the PlacementImportBatch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PlacementImportBatchUpdateInput, PlacementImportBatchUncheckedUpdateInput>
  }

  /**
   * PlacementImportBatch delete
   */
  export type PlacementImportBatchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    /**
     * Filter which PlacementImportBatch to delete.
     */
    where: PlacementImportBatchWhereUniqueInput
  }

  /**
   * PlacementImportBatch deleteMany
   */
  export type PlacementImportBatchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PlacementImportBatches to delete
     */
    where?: PlacementImportBatchWhereInput
  }

  /**
   * PlacementImportBatch.personalPlacements
   */
  export type PlacementImportBatch$personalPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    where?: PersonalPlacementWhereInput
    orderBy?: PersonalPlacementOrderByWithRelationInput | PersonalPlacementOrderByWithRelationInput[]
    cursor?: PersonalPlacementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PersonalPlacementScalarFieldEnum | PersonalPlacementScalarFieldEnum[]
  }

  /**
   * PlacementImportBatch.teamPlacements
   */
  export type PlacementImportBatch$teamPlacementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    where?: TeamPlacementWhereInput
    orderBy?: TeamPlacementOrderByWithRelationInput | TeamPlacementOrderByWithRelationInput[]
    cursor?: TeamPlacementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamPlacementScalarFieldEnum | TeamPlacementScalarFieldEnum[]
  }

  /**
   * PlacementImportBatch without action
   */
  export type PlacementImportBatchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
  }


  /**
   * Model PersonalPlacement
   */

  export type AggregatePersonalPlacement = {
    _count: PersonalPlacementCountAggregateOutputType | null
    _avg: PersonalPlacementAvgAggregateOutputType | null
    _sum: PersonalPlacementSumAggregateOutputType | null
    _min: PersonalPlacementMinAggregateOutputType | null
    _max: PersonalPlacementMaxAggregateOutputType | null
  }

  export type PersonalPlacementAvgAggregateOutputType = {
    placementYear: number | null
    totalBilledHours: number | null
    revenueUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    targetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
  }

  export type PersonalPlacementSumAggregateOutputType = {
    placementYear: number | null
    totalBilledHours: number | null
    revenueUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    targetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
  }

  export type PersonalPlacementMinAggregateOutputType = {
    id: string | null
    employeeId: string | null
    batchId: string | null
    level: string | null
    candidateName: string | null
    placementYear: number | null
    doj: Date | null
    doq: Date | null
    client: string | null
    plcId: string | null
    placementType: string | null
    billingStatus: string | null
    collectionStatus: string | null
    totalBilledHours: number | null
    revenueUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    vbCode: string | null
    recruiterName: string | null
    teamLeadName: string | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    targetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    slabQualified: string | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
    createdAt: Date | null
  }

  export type PersonalPlacementMaxAggregateOutputType = {
    id: string | null
    employeeId: string | null
    batchId: string | null
    level: string | null
    candidateName: string | null
    placementYear: number | null
    doj: Date | null
    doq: Date | null
    client: string | null
    plcId: string | null
    placementType: string | null
    billingStatus: string | null
    collectionStatus: string | null
    totalBilledHours: number | null
    revenueUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    vbCode: string | null
    recruiterName: string | null
    teamLeadName: string | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    targetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    slabQualified: string | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
    createdAt: Date | null
  }

  export type PersonalPlacementCountAggregateOutputType = {
    id: number
    employeeId: number
    batchId: number
    level: number
    candidateName: number
    placementYear: number
    doj: number
    doq: number
    client: number
    plcId: number
    placementType: number
    billingStatus: number
    collectionStatus: number
    totalBilledHours: number
    revenueUsd: number
    incentiveInr: number
    incentivePaidInr: number
    vbCode: number
    recruiterName: number
    teamLeadName: number
    yearlyPlacementTarget: number
    placementDone: number
    targetAchievedPercent: number
    totalRevenueGenerated: number
    slabQualified: number
    totalIncentiveInr: number
    totalIncentivePaidInr: number
    createdAt: number
    _all: number
  }


  export type PersonalPlacementAvgAggregateInputType = {
    placementYear?: true
    totalBilledHours?: true
    revenueUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    targetAchievedPercent?: true
    totalRevenueGenerated?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
  }

  export type PersonalPlacementSumAggregateInputType = {
    placementYear?: true
    totalBilledHours?: true
    revenueUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    targetAchievedPercent?: true
    totalRevenueGenerated?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
  }

  export type PersonalPlacementMinAggregateInputType = {
    id?: true
    employeeId?: true
    batchId?: true
    level?: true
    candidateName?: true
    placementYear?: true
    doj?: true
    doq?: true
    client?: true
    plcId?: true
    placementType?: true
    billingStatus?: true
    collectionStatus?: true
    totalBilledHours?: true
    revenueUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    vbCode?: true
    recruiterName?: true
    teamLeadName?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    targetAchievedPercent?: true
    totalRevenueGenerated?: true
    slabQualified?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
    createdAt?: true
  }

  export type PersonalPlacementMaxAggregateInputType = {
    id?: true
    employeeId?: true
    batchId?: true
    level?: true
    candidateName?: true
    placementYear?: true
    doj?: true
    doq?: true
    client?: true
    plcId?: true
    placementType?: true
    billingStatus?: true
    collectionStatus?: true
    totalBilledHours?: true
    revenueUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    vbCode?: true
    recruiterName?: true
    teamLeadName?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    targetAchievedPercent?: true
    totalRevenueGenerated?: true
    slabQualified?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
    createdAt?: true
  }

  export type PersonalPlacementCountAggregateInputType = {
    id?: true
    employeeId?: true
    batchId?: true
    level?: true
    candidateName?: true
    placementYear?: true
    doj?: true
    doq?: true
    client?: true
    plcId?: true
    placementType?: true
    billingStatus?: true
    collectionStatus?: true
    totalBilledHours?: true
    revenueUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    vbCode?: true
    recruiterName?: true
    teamLeadName?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    targetAchievedPercent?: true
    totalRevenueGenerated?: true
    slabQualified?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
    createdAt?: true
    _all?: true
  }

  export type PersonalPlacementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PersonalPlacement to aggregate.
     */
    where?: PersonalPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalPlacements to fetch.
     */
    orderBy?: PersonalPlacementOrderByWithRelationInput | PersonalPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PersonalPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalPlacements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PersonalPlacements
    **/
    _count?: true | PersonalPlacementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PersonalPlacementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PersonalPlacementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PersonalPlacementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PersonalPlacementMaxAggregateInputType
  }

  export type GetPersonalPlacementAggregateType<T extends PersonalPlacementAggregateArgs> = {
        [P in keyof T & keyof AggregatePersonalPlacement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePersonalPlacement[P]>
      : GetScalarType<T[P], AggregatePersonalPlacement[P]>
  }




  export type PersonalPlacementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PersonalPlacementWhereInput
    orderBy?: PersonalPlacementOrderByWithAggregationInput | PersonalPlacementOrderByWithAggregationInput[]
    by: PersonalPlacementScalarFieldEnum[] | PersonalPlacementScalarFieldEnum
    having?: PersonalPlacementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PersonalPlacementCountAggregateInputType | true
    _avg?: PersonalPlacementAvgAggregateInputType
    _sum?: PersonalPlacementSumAggregateInputType
    _min?: PersonalPlacementMinAggregateInputType
    _max?: PersonalPlacementMaxAggregateInputType
  }

  export type PersonalPlacementGroupByOutputType = {
    id: string
    employeeId: string
    batchId: string | null
    level: string | null
    candidateName: string
    placementYear: number | null
    doj: Date
    doq: Date | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus: string | null
    totalBilledHours: number | null
    revenueUsd: Decimal
    incentiveInr: Decimal
    incentivePaidInr: Decimal | null
    vbCode: string | null
    recruiterName: string | null
    teamLeadName: string | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    targetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    slabQualified: string | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
    createdAt: Date
    _count: PersonalPlacementCountAggregateOutputType | null
    _avg: PersonalPlacementAvgAggregateOutputType | null
    _sum: PersonalPlacementSumAggregateOutputType | null
    _min: PersonalPlacementMinAggregateOutputType | null
    _max: PersonalPlacementMaxAggregateOutputType | null
  }

  type GetPersonalPlacementGroupByPayload<T extends PersonalPlacementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PersonalPlacementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PersonalPlacementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PersonalPlacementGroupByOutputType[P]>
            : GetScalarType<T[P], PersonalPlacementGroupByOutputType[P]>
        }
      >
    >


  export type PersonalPlacementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeId?: boolean
    batchId?: boolean
    level?: boolean
    candidateName?: boolean
    placementYear?: boolean
    doj?: boolean
    doq?: boolean
    client?: boolean
    plcId?: boolean
    placementType?: boolean
    billingStatus?: boolean
    collectionStatus?: boolean
    totalBilledHours?: boolean
    revenueUsd?: boolean
    incentiveInr?: boolean
    incentivePaidInr?: boolean
    vbCode?: boolean
    recruiterName?: boolean
    teamLeadName?: boolean
    yearlyPlacementTarget?: boolean
    placementDone?: boolean
    targetAchievedPercent?: boolean
    totalRevenueGenerated?: boolean
    slabQualified?: boolean
    totalIncentiveInr?: boolean
    totalIncentivePaidInr?: boolean
    createdAt?: boolean
    employee?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | PersonalPlacement$batchArgs<ExtArgs>
  }, ExtArgs["result"]["personalPlacement"]>

  export type PersonalPlacementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    employeeId?: boolean
    batchId?: boolean
    level?: boolean
    candidateName?: boolean
    placementYear?: boolean
    doj?: boolean
    doq?: boolean
    client?: boolean
    plcId?: boolean
    placementType?: boolean
    billingStatus?: boolean
    collectionStatus?: boolean
    totalBilledHours?: boolean
    revenueUsd?: boolean
    incentiveInr?: boolean
    incentivePaidInr?: boolean
    vbCode?: boolean
    recruiterName?: boolean
    teamLeadName?: boolean
    yearlyPlacementTarget?: boolean
    placementDone?: boolean
    targetAchievedPercent?: boolean
    totalRevenueGenerated?: boolean
    slabQualified?: boolean
    totalIncentiveInr?: boolean
    totalIncentivePaidInr?: boolean
    createdAt?: boolean
    employee?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | PersonalPlacement$batchArgs<ExtArgs>
  }, ExtArgs["result"]["personalPlacement"]>

  export type PersonalPlacementSelectScalar = {
    id?: boolean
    employeeId?: boolean
    batchId?: boolean
    level?: boolean
    candidateName?: boolean
    placementYear?: boolean
    doj?: boolean
    doq?: boolean
    client?: boolean
    plcId?: boolean
    placementType?: boolean
    billingStatus?: boolean
    collectionStatus?: boolean
    totalBilledHours?: boolean
    revenueUsd?: boolean
    incentiveInr?: boolean
    incentivePaidInr?: boolean
    vbCode?: boolean
    recruiterName?: boolean
    teamLeadName?: boolean
    yearlyPlacementTarget?: boolean
    placementDone?: boolean
    targetAchievedPercent?: boolean
    totalRevenueGenerated?: boolean
    slabQualified?: boolean
    totalIncentiveInr?: boolean
    totalIncentivePaidInr?: boolean
    createdAt?: boolean
  }

  export type PersonalPlacementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | PersonalPlacement$batchArgs<ExtArgs>
  }
  export type PersonalPlacementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    employee?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | PersonalPlacement$batchArgs<ExtArgs>
  }

  export type $PersonalPlacementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PersonalPlacement"
    objects: {
      employee: Prisma.$UserPayload<ExtArgs>
      batch: Prisma.$PlacementImportBatchPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      employeeId: string
      batchId: string | null
      level: string | null
      candidateName: string
      placementYear: number | null
      doj: Date
      doq: Date | null
      client: string
      plcId: string
      placementType: string
      billingStatus: string
      collectionStatus: string | null
      totalBilledHours: number | null
      revenueUsd: Prisma.Decimal
      incentiveInr: Prisma.Decimal
      incentivePaidInr: Prisma.Decimal | null
      vbCode: string | null
      recruiterName: string | null
      teamLeadName: string | null
      yearlyPlacementTarget: Prisma.Decimal | null
      placementDone: Prisma.Decimal | null
      targetAchievedPercent: Prisma.Decimal | null
      totalRevenueGenerated: Prisma.Decimal | null
      slabQualified: string | null
      totalIncentiveInr: Prisma.Decimal | null
      totalIncentivePaidInr: Prisma.Decimal | null
      createdAt: Date
    }, ExtArgs["result"]["personalPlacement"]>
    composites: {}
  }

  type PersonalPlacementGetPayload<S extends boolean | null | undefined | PersonalPlacementDefaultArgs> = $Result.GetResult<Prisma.$PersonalPlacementPayload, S>

  type PersonalPlacementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PersonalPlacementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PersonalPlacementCountAggregateInputType | true
    }

  export interface PersonalPlacementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PersonalPlacement'], meta: { name: 'PersonalPlacement' } }
    /**
     * Find zero or one PersonalPlacement that matches the filter.
     * @param {PersonalPlacementFindUniqueArgs} args - Arguments to find a PersonalPlacement
     * @example
     * // Get one PersonalPlacement
     * const personalPlacement = await prisma.personalPlacement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PersonalPlacementFindUniqueArgs>(args: SelectSubset<T, PersonalPlacementFindUniqueArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PersonalPlacement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PersonalPlacementFindUniqueOrThrowArgs} args - Arguments to find a PersonalPlacement
     * @example
     * // Get one PersonalPlacement
     * const personalPlacement = await prisma.personalPlacement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PersonalPlacementFindUniqueOrThrowArgs>(args: SelectSubset<T, PersonalPlacementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PersonalPlacement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalPlacementFindFirstArgs} args - Arguments to find a PersonalPlacement
     * @example
     * // Get one PersonalPlacement
     * const personalPlacement = await prisma.personalPlacement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PersonalPlacementFindFirstArgs>(args?: SelectSubset<T, PersonalPlacementFindFirstArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PersonalPlacement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalPlacementFindFirstOrThrowArgs} args - Arguments to find a PersonalPlacement
     * @example
     * // Get one PersonalPlacement
     * const personalPlacement = await prisma.personalPlacement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PersonalPlacementFindFirstOrThrowArgs>(args?: SelectSubset<T, PersonalPlacementFindFirstOrThrowArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PersonalPlacements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalPlacementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PersonalPlacements
     * const personalPlacements = await prisma.personalPlacement.findMany()
     * 
     * // Get first 10 PersonalPlacements
     * const personalPlacements = await prisma.personalPlacement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const personalPlacementWithIdOnly = await prisma.personalPlacement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PersonalPlacementFindManyArgs>(args?: SelectSubset<T, PersonalPlacementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PersonalPlacement.
     * @param {PersonalPlacementCreateArgs} args - Arguments to create a PersonalPlacement.
     * @example
     * // Create one PersonalPlacement
     * const PersonalPlacement = await prisma.personalPlacement.create({
     *   data: {
     *     // ... data to create a PersonalPlacement
     *   }
     * })
     * 
     */
    create<T extends PersonalPlacementCreateArgs>(args: SelectSubset<T, PersonalPlacementCreateArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PersonalPlacements.
     * @param {PersonalPlacementCreateManyArgs} args - Arguments to create many PersonalPlacements.
     * @example
     * // Create many PersonalPlacements
     * const personalPlacement = await prisma.personalPlacement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PersonalPlacementCreateManyArgs>(args?: SelectSubset<T, PersonalPlacementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PersonalPlacements and returns the data saved in the database.
     * @param {PersonalPlacementCreateManyAndReturnArgs} args - Arguments to create many PersonalPlacements.
     * @example
     * // Create many PersonalPlacements
     * const personalPlacement = await prisma.personalPlacement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PersonalPlacements and only return the `id`
     * const personalPlacementWithIdOnly = await prisma.personalPlacement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PersonalPlacementCreateManyAndReturnArgs>(args?: SelectSubset<T, PersonalPlacementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PersonalPlacement.
     * @param {PersonalPlacementDeleteArgs} args - Arguments to delete one PersonalPlacement.
     * @example
     * // Delete one PersonalPlacement
     * const PersonalPlacement = await prisma.personalPlacement.delete({
     *   where: {
     *     // ... filter to delete one PersonalPlacement
     *   }
     * })
     * 
     */
    delete<T extends PersonalPlacementDeleteArgs>(args: SelectSubset<T, PersonalPlacementDeleteArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PersonalPlacement.
     * @param {PersonalPlacementUpdateArgs} args - Arguments to update one PersonalPlacement.
     * @example
     * // Update one PersonalPlacement
     * const personalPlacement = await prisma.personalPlacement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PersonalPlacementUpdateArgs>(args: SelectSubset<T, PersonalPlacementUpdateArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PersonalPlacements.
     * @param {PersonalPlacementDeleteManyArgs} args - Arguments to filter PersonalPlacements to delete.
     * @example
     * // Delete a few PersonalPlacements
     * const { count } = await prisma.personalPlacement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PersonalPlacementDeleteManyArgs>(args?: SelectSubset<T, PersonalPlacementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PersonalPlacements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalPlacementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PersonalPlacements
     * const personalPlacement = await prisma.personalPlacement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PersonalPlacementUpdateManyArgs>(args: SelectSubset<T, PersonalPlacementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PersonalPlacement.
     * @param {PersonalPlacementUpsertArgs} args - Arguments to update or create a PersonalPlacement.
     * @example
     * // Update or create a PersonalPlacement
     * const personalPlacement = await prisma.personalPlacement.upsert({
     *   create: {
     *     // ... data to create a PersonalPlacement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PersonalPlacement we want to update
     *   }
     * })
     */
    upsert<T extends PersonalPlacementUpsertArgs>(args: SelectSubset<T, PersonalPlacementUpsertArgs<ExtArgs>>): Prisma__PersonalPlacementClient<$Result.GetResult<Prisma.$PersonalPlacementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PersonalPlacements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalPlacementCountArgs} args - Arguments to filter PersonalPlacements to count.
     * @example
     * // Count the number of PersonalPlacements
     * const count = await prisma.personalPlacement.count({
     *   where: {
     *     // ... the filter for the PersonalPlacements we want to count
     *   }
     * })
    **/
    count<T extends PersonalPlacementCountArgs>(
      args?: Subset<T, PersonalPlacementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PersonalPlacementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PersonalPlacement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalPlacementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PersonalPlacementAggregateArgs>(args: Subset<T, PersonalPlacementAggregateArgs>): Prisma.PrismaPromise<GetPersonalPlacementAggregateType<T>>

    /**
     * Group by PersonalPlacement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PersonalPlacementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PersonalPlacementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PersonalPlacementGroupByArgs['orderBy'] }
        : { orderBy?: PersonalPlacementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PersonalPlacementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPersonalPlacementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PersonalPlacement model
   */
  readonly fields: PersonalPlacementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PersonalPlacement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PersonalPlacementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    employee<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    batch<T extends PersonalPlacement$batchArgs<ExtArgs> = {}>(args?: Subset<T, PersonalPlacement$batchArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PersonalPlacement model
   */ 
  interface PersonalPlacementFieldRefs {
    readonly id: FieldRef<"PersonalPlacement", 'String'>
    readonly employeeId: FieldRef<"PersonalPlacement", 'String'>
    readonly batchId: FieldRef<"PersonalPlacement", 'String'>
    readonly level: FieldRef<"PersonalPlacement", 'String'>
    readonly candidateName: FieldRef<"PersonalPlacement", 'String'>
    readonly placementYear: FieldRef<"PersonalPlacement", 'Int'>
    readonly doj: FieldRef<"PersonalPlacement", 'DateTime'>
    readonly doq: FieldRef<"PersonalPlacement", 'DateTime'>
    readonly client: FieldRef<"PersonalPlacement", 'String'>
    readonly plcId: FieldRef<"PersonalPlacement", 'String'>
    readonly placementType: FieldRef<"PersonalPlacement", 'String'>
    readonly billingStatus: FieldRef<"PersonalPlacement", 'String'>
    readonly collectionStatus: FieldRef<"PersonalPlacement", 'String'>
    readonly totalBilledHours: FieldRef<"PersonalPlacement", 'Int'>
    readonly revenueUsd: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly incentiveInr: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly incentivePaidInr: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly vbCode: FieldRef<"PersonalPlacement", 'String'>
    readonly recruiterName: FieldRef<"PersonalPlacement", 'String'>
    readonly teamLeadName: FieldRef<"PersonalPlacement", 'String'>
    readonly yearlyPlacementTarget: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly placementDone: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly targetAchievedPercent: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly totalRevenueGenerated: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly slabQualified: FieldRef<"PersonalPlacement", 'String'>
    readonly totalIncentiveInr: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly totalIncentivePaidInr: FieldRef<"PersonalPlacement", 'Decimal'>
    readonly createdAt: FieldRef<"PersonalPlacement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PersonalPlacement findUnique
   */
  export type PersonalPlacementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * Filter, which PersonalPlacement to fetch.
     */
    where: PersonalPlacementWhereUniqueInput
  }

  /**
   * PersonalPlacement findUniqueOrThrow
   */
  export type PersonalPlacementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * Filter, which PersonalPlacement to fetch.
     */
    where: PersonalPlacementWhereUniqueInput
  }

  /**
   * PersonalPlacement findFirst
   */
  export type PersonalPlacementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * Filter, which PersonalPlacement to fetch.
     */
    where?: PersonalPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalPlacements to fetch.
     */
    orderBy?: PersonalPlacementOrderByWithRelationInput | PersonalPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PersonalPlacements.
     */
    cursor?: PersonalPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalPlacements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PersonalPlacements.
     */
    distinct?: PersonalPlacementScalarFieldEnum | PersonalPlacementScalarFieldEnum[]
  }

  /**
   * PersonalPlacement findFirstOrThrow
   */
  export type PersonalPlacementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * Filter, which PersonalPlacement to fetch.
     */
    where?: PersonalPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalPlacements to fetch.
     */
    orderBy?: PersonalPlacementOrderByWithRelationInput | PersonalPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PersonalPlacements.
     */
    cursor?: PersonalPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalPlacements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PersonalPlacements.
     */
    distinct?: PersonalPlacementScalarFieldEnum | PersonalPlacementScalarFieldEnum[]
  }

  /**
   * PersonalPlacement findMany
   */
  export type PersonalPlacementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * Filter, which PersonalPlacements to fetch.
     */
    where?: PersonalPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PersonalPlacements to fetch.
     */
    orderBy?: PersonalPlacementOrderByWithRelationInput | PersonalPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PersonalPlacements.
     */
    cursor?: PersonalPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PersonalPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PersonalPlacements.
     */
    skip?: number
    distinct?: PersonalPlacementScalarFieldEnum | PersonalPlacementScalarFieldEnum[]
  }

  /**
   * PersonalPlacement create
   */
  export type PersonalPlacementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * The data needed to create a PersonalPlacement.
     */
    data: XOR<PersonalPlacementCreateInput, PersonalPlacementUncheckedCreateInput>
  }

  /**
   * PersonalPlacement createMany
   */
  export type PersonalPlacementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PersonalPlacements.
     */
    data: PersonalPlacementCreateManyInput | PersonalPlacementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PersonalPlacement createManyAndReturn
   */
  export type PersonalPlacementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PersonalPlacements.
     */
    data: PersonalPlacementCreateManyInput | PersonalPlacementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PersonalPlacement update
   */
  export type PersonalPlacementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * The data needed to update a PersonalPlacement.
     */
    data: XOR<PersonalPlacementUpdateInput, PersonalPlacementUncheckedUpdateInput>
    /**
     * Choose, which PersonalPlacement to update.
     */
    where: PersonalPlacementWhereUniqueInput
  }

  /**
   * PersonalPlacement updateMany
   */
  export type PersonalPlacementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PersonalPlacements.
     */
    data: XOR<PersonalPlacementUpdateManyMutationInput, PersonalPlacementUncheckedUpdateManyInput>
    /**
     * Filter which PersonalPlacements to update
     */
    where?: PersonalPlacementWhereInput
  }

  /**
   * PersonalPlacement upsert
   */
  export type PersonalPlacementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * The filter to search for the PersonalPlacement to update in case it exists.
     */
    where: PersonalPlacementWhereUniqueInput
    /**
     * In case the PersonalPlacement found by the `where` argument doesn't exist, create a new PersonalPlacement with this data.
     */
    create: XOR<PersonalPlacementCreateInput, PersonalPlacementUncheckedCreateInput>
    /**
     * In case the PersonalPlacement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PersonalPlacementUpdateInput, PersonalPlacementUncheckedUpdateInput>
  }

  /**
   * PersonalPlacement delete
   */
  export type PersonalPlacementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
    /**
     * Filter which PersonalPlacement to delete.
     */
    where: PersonalPlacementWhereUniqueInput
  }

  /**
   * PersonalPlacement deleteMany
   */
  export type PersonalPlacementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PersonalPlacements to delete
     */
    where?: PersonalPlacementWhereInput
  }

  /**
   * PersonalPlacement.batch
   */
  export type PersonalPlacement$batchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    where?: PlacementImportBatchWhereInput
  }

  /**
   * PersonalPlacement without action
   */
  export type PersonalPlacementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PersonalPlacement
     */
    select?: PersonalPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PersonalPlacementInclude<ExtArgs> | null
  }


  /**
   * Model TeamPlacement
   */

  export type AggregateTeamPlacement = {
    _count: TeamPlacementCountAggregateOutputType | null
    _avg: TeamPlacementAvgAggregateOutputType | null
    _sum: TeamPlacementSumAggregateOutputType | null
    _min: TeamPlacementMinAggregateOutputType | null
    _max: TeamPlacementMaxAggregateOutputType | null
  }

  export type TeamPlacementAvgAggregateOutputType = {
    placementYear: number | null
    totalBilledHours: number | null
    revenueLeadUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    placementAchPercent: Decimal | null
    yearlyRevenueTarget: Decimal | null
    revenueAch: Decimal | null
    revenueTargetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
  }

  export type TeamPlacementSumAggregateOutputType = {
    placementYear: number | null
    totalBilledHours: number | null
    revenueLeadUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    placementAchPercent: Decimal | null
    yearlyRevenueTarget: Decimal | null
    revenueAch: Decimal | null
    revenueTargetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
  }

  export type TeamPlacementMinAggregateOutputType = {
    id: string | null
    leadId: string | null
    batchId: string | null
    level: string | null
    candidateName: string | null
    recruiterName: string | null
    leadName: string | null
    splitWith: string | null
    placementYear: number | null
    doj: Date | null
    doq: Date | null
    client: string | null
    plcId: string | null
    placementType: string | null
    billingStatus: string | null
    collectionStatus: string | null
    totalBilledHours: number | null
    revenueLeadUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    vbCode: string | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    placementAchPercent: Decimal | null
    yearlyRevenueTarget: Decimal | null
    revenueAch: Decimal | null
    revenueTargetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    slabQualified: string | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
    createdAt: Date | null
  }

  export type TeamPlacementMaxAggregateOutputType = {
    id: string | null
    leadId: string | null
    batchId: string | null
    level: string | null
    candidateName: string | null
    recruiterName: string | null
    leadName: string | null
    splitWith: string | null
    placementYear: number | null
    doj: Date | null
    doq: Date | null
    client: string | null
    plcId: string | null
    placementType: string | null
    billingStatus: string | null
    collectionStatus: string | null
    totalBilledHours: number | null
    revenueLeadUsd: Decimal | null
    incentiveInr: Decimal | null
    incentivePaidInr: Decimal | null
    vbCode: string | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    placementAchPercent: Decimal | null
    yearlyRevenueTarget: Decimal | null
    revenueAch: Decimal | null
    revenueTargetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    slabQualified: string | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
    createdAt: Date | null
  }

  export type TeamPlacementCountAggregateOutputType = {
    id: number
    leadId: number
    batchId: number
    level: number
    candidateName: number
    recruiterName: number
    leadName: number
    splitWith: number
    placementYear: number
    doj: number
    doq: number
    client: number
    plcId: number
    placementType: number
    billingStatus: number
    collectionStatus: number
    totalBilledHours: number
    revenueLeadUsd: number
    incentiveInr: number
    incentivePaidInr: number
    vbCode: number
    yearlyPlacementTarget: number
    placementDone: number
    placementAchPercent: number
    yearlyRevenueTarget: number
    revenueAch: number
    revenueTargetAchievedPercent: number
    totalRevenueGenerated: number
    slabQualified: number
    totalIncentiveInr: number
    totalIncentivePaidInr: number
    createdAt: number
    _all: number
  }


  export type TeamPlacementAvgAggregateInputType = {
    placementYear?: true
    totalBilledHours?: true
    revenueLeadUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    placementAchPercent?: true
    yearlyRevenueTarget?: true
    revenueAch?: true
    revenueTargetAchievedPercent?: true
    totalRevenueGenerated?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
  }

  export type TeamPlacementSumAggregateInputType = {
    placementYear?: true
    totalBilledHours?: true
    revenueLeadUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    placementAchPercent?: true
    yearlyRevenueTarget?: true
    revenueAch?: true
    revenueTargetAchievedPercent?: true
    totalRevenueGenerated?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
  }

  export type TeamPlacementMinAggregateInputType = {
    id?: true
    leadId?: true
    batchId?: true
    level?: true
    candidateName?: true
    recruiterName?: true
    leadName?: true
    splitWith?: true
    placementYear?: true
    doj?: true
    doq?: true
    client?: true
    plcId?: true
    placementType?: true
    billingStatus?: true
    collectionStatus?: true
    totalBilledHours?: true
    revenueLeadUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    vbCode?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    placementAchPercent?: true
    yearlyRevenueTarget?: true
    revenueAch?: true
    revenueTargetAchievedPercent?: true
    totalRevenueGenerated?: true
    slabQualified?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
    createdAt?: true
  }

  export type TeamPlacementMaxAggregateInputType = {
    id?: true
    leadId?: true
    batchId?: true
    level?: true
    candidateName?: true
    recruiterName?: true
    leadName?: true
    splitWith?: true
    placementYear?: true
    doj?: true
    doq?: true
    client?: true
    plcId?: true
    placementType?: true
    billingStatus?: true
    collectionStatus?: true
    totalBilledHours?: true
    revenueLeadUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    vbCode?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    placementAchPercent?: true
    yearlyRevenueTarget?: true
    revenueAch?: true
    revenueTargetAchievedPercent?: true
    totalRevenueGenerated?: true
    slabQualified?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
    createdAt?: true
  }

  export type TeamPlacementCountAggregateInputType = {
    id?: true
    leadId?: true
    batchId?: true
    level?: true
    candidateName?: true
    recruiterName?: true
    leadName?: true
    splitWith?: true
    placementYear?: true
    doj?: true
    doq?: true
    client?: true
    plcId?: true
    placementType?: true
    billingStatus?: true
    collectionStatus?: true
    totalBilledHours?: true
    revenueLeadUsd?: true
    incentiveInr?: true
    incentivePaidInr?: true
    vbCode?: true
    yearlyPlacementTarget?: true
    placementDone?: true
    placementAchPercent?: true
    yearlyRevenueTarget?: true
    revenueAch?: true
    revenueTargetAchievedPercent?: true
    totalRevenueGenerated?: true
    slabQualified?: true
    totalIncentiveInr?: true
    totalIncentivePaidInr?: true
    createdAt?: true
    _all?: true
  }

  export type TeamPlacementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TeamPlacement to aggregate.
     */
    where?: TeamPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamPlacements to fetch.
     */
    orderBy?: TeamPlacementOrderByWithRelationInput | TeamPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TeamPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamPlacements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TeamPlacements
    **/
    _count?: true | TeamPlacementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TeamPlacementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TeamPlacementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeamPlacementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeamPlacementMaxAggregateInputType
  }

  export type GetTeamPlacementAggregateType<T extends TeamPlacementAggregateArgs> = {
        [P in keyof T & keyof AggregateTeamPlacement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeamPlacement[P]>
      : GetScalarType<T[P], AggregateTeamPlacement[P]>
  }




  export type TeamPlacementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamPlacementWhereInput
    orderBy?: TeamPlacementOrderByWithAggregationInput | TeamPlacementOrderByWithAggregationInput[]
    by: TeamPlacementScalarFieldEnum[] | TeamPlacementScalarFieldEnum
    having?: TeamPlacementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeamPlacementCountAggregateInputType | true
    _avg?: TeamPlacementAvgAggregateInputType
    _sum?: TeamPlacementSumAggregateInputType
    _min?: TeamPlacementMinAggregateInputType
    _max?: TeamPlacementMaxAggregateInputType
  }

  export type TeamPlacementGroupByOutputType = {
    id: string
    leadId: string
    batchId: string | null
    level: string | null
    candidateName: string
    recruiterName: string | null
    leadName: string | null
    splitWith: string | null
    placementYear: number | null
    doj: Date
    doq: Date | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus: string | null
    totalBilledHours: number | null
    revenueLeadUsd: Decimal
    incentiveInr: Decimal
    incentivePaidInr: Decimal | null
    vbCode: string | null
    yearlyPlacementTarget: Decimal | null
    placementDone: Decimal | null
    placementAchPercent: Decimal | null
    yearlyRevenueTarget: Decimal | null
    revenueAch: Decimal | null
    revenueTargetAchievedPercent: Decimal | null
    totalRevenueGenerated: Decimal | null
    slabQualified: string | null
    totalIncentiveInr: Decimal | null
    totalIncentivePaidInr: Decimal | null
    createdAt: Date
    _count: TeamPlacementCountAggregateOutputType | null
    _avg: TeamPlacementAvgAggregateOutputType | null
    _sum: TeamPlacementSumAggregateOutputType | null
    _min: TeamPlacementMinAggregateOutputType | null
    _max: TeamPlacementMaxAggregateOutputType | null
  }

  type GetTeamPlacementGroupByPayload<T extends TeamPlacementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeamPlacementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeamPlacementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeamPlacementGroupByOutputType[P]>
            : GetScalarType<T[P], TeamPlacementGroupByOutputType[P]>
        }
      >
    >


  export type TeamPlacementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    batchId?: boolean
    level?: boolean
    candidateName?: boolean
    recruiterName?: boolean
    leadName?: boolean
    splitWith?: boolean
    placementYear?: boolean
    doj?: boolean
    doq?: boolean
    client?: boolean
    plcId?: boolean
    placementType?: boolean
    billingStatus?: boolean
    collectionStatus?: boolean
    totalBilledHours?: boolean
    revenueLeadUsd?: boolean
    incentiveInr?: boolean
    incentivePaidInr?: boolean
    vbCode?: boolean
    yearlyPlacementTarget?: boolean
    placementDone?: boolean
    placementAchPercent?: boolean
    yearlyRevenueTarget?: boolean
    revenueAch?: boolean
    revenueTargetAchievedPercent?: boolean
    totalRevenueGenerated?: boolean
    slabQualified?: boolean
    totalIncentiveInr?: boolean
    totalIncentivePaidInr?: boolean
    createdAt?: boolean
    lead?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | TeamPlacement$batchArgs<ExtArgs>
  }, ExtArgs["result"]["teamPlacement"]>

  export type TeamPlacementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    leadId?: boolean
    batchId?: boolean
    level?: boolean
    candidateName?: boolean
    recruiterName?: boolean
    leadName?: boolean
    splitWith?: boolean
    placementYear?: boolean
    doj?: boolean
    doq?: boolean
    client?: boolean
    plcId?: boolean
    placementType?: boolean
    billingStatus?: boolean
    collectionStatus?: boolean
    totalBilledHours?: boolean
    revenueLeadUsd?: boolean
    incentiveInr?: boolean
    incentivePaidInr?: boolean
    vbCode?: boolean
    yearlyPlacementTarget?: boolean
    placementDone?: boolean
    placementAchPercent?: boolean
    yearlyRevenueTarget?: boolean
    revenueAch?: boolean
    revenueTargetAchievedPercent?: boolean
    totalRevenueGenerated?: boolean
    slabQualified?: boolean
    totalIncentiveInr?: boolean
    totalIncentivePaidInr?: boolean
    createdAt?: boolean
    lead?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | TeamPlacement$batchArgs<ExtArgs>
  }, ExtArgs["result"]["teamPlacement"]>

  export type TeamPlacementSelectScalar = {
    id?: boolean
    leadId?: boolean
    batchId?: boolean
    level?: boolean
    candidateName?: boolean
    recruiterName?: boolean
    leadName?: boolean
    splitWith?: boolean
    placementYear?: boolean
    doj?: boolean
    doq?: boolean
    client?: boolean
    plcId?: boolean
    placementType?: boolean
    billingStatus?: boolean
    collectionStatus?: boolean
    totalBilledHours?: boolean
    revenueLeadUsd?: boolean
    incentiveInr?: boolean
    incentivePaidInr?: boolean
    vbCode?: boolean
    yearlyPlacementTarget?: boolean
    placementDone?: boolean
    placementAchPercent?: boolean
    yearlyRevenueTarget?: boolean
    revenueAch?: boolean
    revenueTargetAchievedPercent?: boolean
    totalRevenueGenerated?: boolean
    slabQualified?: boolean
    totalIncentiveInr?: boolean
    totalIncentivePaidInr?: boolean
    createdAt?: boolean
  }

  export type TeamPlacementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lead?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | TeamPlacement$batchArgs<ExtArgs>
  }
  export type TeamPlacementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    lead?: boolean | UserDefaultArgs<ExtArgs>
    batch?: boolean | TeamPlacement$batchArgs<ExtArgs>
  }

  export type $TeamPlacementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TeamPlacement"
    objects: {
      lead: Prisma.$UserPayload<ExtArgs>
      batch: Prisma.$PlacementImportBatchPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      leadId: string
      batchId: string | null
      level: string | null
      candidateName: string
      recruiterName: string | null
      leadName: string | null
      splitWith: string | null
      placementYear: number | null
      doj: Date
      doq: Date | null
      client: string
      plcId: string
      placementType: string
      billingStatus: string
      collectionStatus: string | null
      totalBilledHours: number | null
      revenueLeadUsd: Prisma.Decimal
      incentiveInr: Prisma.Decimal
      incentivePaidInr: Prisma.Decimal | null
      vbCode: string | null
      yearlyPlacementTarget: Prisma.Decimal | null
      placementDone: Prisma.Decimal | null
      placementAchPercent: Prisma.Decimal | null
      yearlyRevenueTarget: Prisma.Decimal | null
      revenueAch: Prisma.Decimal | null
      revenueTargetAchievedPercent: Prisma.Decimal | null
      totalRevenueGenerated: Prisma.Decimal | null
      slabQualified: string | null
      totalIncentiveInr: Prisma.Decimal | null
      totalIncentivePaidInr: Prisma.Decimal | null
      createdAt: Date
    }, ExtArgs["result"]["teamPlacement"]>
    composites: {}
  }

  type TeamPlacementGetPayload<S extends boolean | null | undefined | TeamPlacementDefaultArgs> = $Result.GetResult<Prisma.$TeamPlacementPayload, S>

  type TeamPlacementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TeamPlacementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TeamPlacementCountAggregateInputType | true
    }

  export interface TeamPlacementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TeamPlacement'], meta: { name: 'TeamPlacement' } }
    /**
     * Find zero or one TeamPlacement that matches the filter.
     * @param {TeamPlacementFindUniqueArgs} args - Arguments to find a TeamPlacement
     * @example
     * // Get one TeamPlacement
     * const teamPlacement = await prisma.teamPlacement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TeamPlacementFindUniqueArgs>(args: SelectSubset<T, TeamPlacementFindUniqueArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TeamPlacement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TeamPlacementFindUniqueOrThrowArgs} args - Arguments to find a TeamPlacement
     * @example
     * // Get one TeamPlacement
     * const teamPlacement = await prisma.teamPlacement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TeamPlacementFindUniqueOrThrowArgs>(args: SelectSubset<T, TeamPlacementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TeamPlacement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamPlacementFindFirstArgs} args - Arguments to find a TeamPlacement
     * @example
     * // Get one TeamPlacement
     * const teamPlacement = await prisma.teamPlacement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TeamPlacementFindFirstArgs>(args?: SelectSubset<T, TeamPlacementFindFirstArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TeamPlacement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamPlacementFindFirstOrThrowArgs} args - Arguments to find a TeamPlacement
     * @example
     * // Get one TeamPlacement
     * const teamPlacement = await prisma.teamPlacement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TeamPlacementFindFirstOrThrowArgs>(args?: SelectSubset<T, TeamPlacementFindFirstOrThrowArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TeamPlacements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamPlacementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TeamPlacements
     * const teamPlacements = await prisma.teamPlacement.findMany()
     * 
     * // Get first 10 TeamPlacements
     * const teamPlacements = await prisma.teamPlacement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const teamPlacementWithIdOnly = await prisma.teamPlacement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TeamPlacementFindManyArgs>(args?: SelectSubset<T, TeamPlacementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TeamPlacement.
     * @param {TeamPlacementCreateArgs} args - Arguments to create a TeamPlacement.
     * @example
     * // Create one TeamPlacement
     * const TeamPlacement = await prisma.teamPlacement.create({
     *   data: {
     *     // ... data to create a TeamPlacement
     *   }
     * })
     * 
     */
    create<T extends TeamPlacementCreateArgs>(args: SelectSubset<T, TeamPlacementCreateArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TeamPlacements.
     * @param {TeamPlacementCreateManyArgs} args - Arguments to create many TeamPlacements.
     * @example
     * // Create many TeamPlacements
     * const teamPlacement = await prisma.teamPlacement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TeamPlacementCreateManyArgs>(args?: SelectSubset<T, TeamPlacementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TeamPlacements and returns the data saved in the database.
     * @param {TeamPlacementCreateManyAndReturnArgs} args - Arguments to create many TeamPlacements.
     * @example
     * // Create many TeamPlacements
     * const teamPlacement = await prisma.teamPlacement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TeamPlacements and only return the `id`
     * const teamPlacementWithIdOnly = await prisma.teamPlacement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TeamPlacementCreateManyAndReturnArgs>(args?: SelectSubset<T, TeamPlacementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TeamPlacement.
     * @param {TeamPlacementDeleteArgs} args - Arguments to delete one TeamPlacement.
     * @example
     * // Delete one TeamPlacement
     * const TeamPlacement = await prisma.teamPlacement.delete({
     *   where: {
     *     // ... filter to delete one TeamPlacement
     *   }
     * })
     * 
     */
    delete<T extends TeamPlacementDeleteArgs>(args: SelectSubset<T, TeamPlacementDeleteArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TeamPlacement.
     * @param {TeamPlacementUpdateArgs} args - Arguments to update one TeamPlacement.
     * @example
     * // Update one TeamPlacement
     * const teamPlacement = await prisma.teamPlacement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TeamPlacementUpdateArgs>(args: SelectSubset<T, TeamPlacementUpdateArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TeamPlacements.
     * @param {TeamPlacementDeleteManyArgs} args - Arguments to filter TeamPlacements to delete.
     * @example
     * // Delete a few TeamPlacements
     * const { count } = await prisma.teamPlacement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TeamPlacementDeleteManyArgs>(args?: SelectSubset<T, TeamPlacementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TeamPlacements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamPlacementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TeamPlacements
     * const teamPlacement = await prisma.teamPlacement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TeamPlacementUpdateManyArgs>(args: SelectSubset<T, TeamPlacementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TeamPlacement.
     * @param {TeamPlacementUpsertArgs} args - Arguments to update or create a TeamPlacement.
     * @example
     * // Update or create a TeamPlacement
     * const teamPlacement = await prisma.teamPlacement.upsert({
     *   create: {
     *     // ... data to create a TeamPlacement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TeamPlacement we want to update
     *   }
     * })
     */
    upsert<T extends TeamPlacementUpsertArgs>(args: SelectSubset<T, TeamPlacementUpsertArgs<ExtArgs>>): Prisma__TeamPlacementClient<$Result.GetResult<Prisma.$TeamPlacementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TeamPlacements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamPlacementCountArgs} args - Arguments to filter TeamPlacements to count.
     * @example
     * // Count the number of TeamPlacements
     * const count = await prisma.teamPlacement.count({
     *   where: {
     *     // ... the filter for the TeamPlacements we want to count
     *   }
     * })
    **/
    count<T extends TeamPlacementCountArgs>(
      args?: Subset<T, TeamPlacementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeamPlacementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TeamPlacement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamPlacementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TeamPlacementAggregateArgs>(args: Subset<T, TeamPlacementAggregateArgs>): Prisma.PrismaPromise<GetTeamPlacementAggregateType<T>>

    /**
     * Group by TeamPlacement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamPlacementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TeamPlacementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TeamPlacementGroupByArgs['orderBy'] }
        : { orderBy?: TeamPlacementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TeamPlacementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamPlacementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TeamPlacement model
   */
  readonly fields: TeamPlacementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TeamPlacement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TeamPlacementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    lead<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    batch<T extends TeamPlacement$batchArgs<ExtArgs> = {}>(args?: Subset<T, TeamPlacement$batchArgs<ExtArgs>>): Prisma__PlacementImportBatchClient<$Result.GetResult<Prisma.$PlacementImportBatchPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TeamPlacement model
   */ 
  interface TeamPlacementFieldRefs {
    readonly id: FieldRef<"TeamPlacement", 'String'>
    readonly leadId: FieldRef<"TeamPlacement", 'String'>
    readonly batchId: FieldRef<"TeamPlacement", 'String'>
    readonly level: FieldRef<"TeamPlacement", 'String'>
    readonly candidateName: FieldRef<"TeamPlacement", 'String'>
    readonly recruiterName: FieldRef<"TeamPlacement", 'String'>
    readonly leadName: FieldRef<"TeamPlacement", 'String'>
    readonly splitWith: FieldRef<"TeamPlacement", 'String'>
    readonly placementYear: FieldRef<"TeamPlacement", 'Int'>
    readonly doj: FieldRef<"TeamPlacement", 'DateTime'>
    readonly doq: FieldRef<"TeamPlacement", 'DateTime'>
    readonly client: FieldRef<"TeamPlacement", 'String'>
    readonly plcId: FieldRef<"TeamPlacement", 'String'>
    readonly placementType: FieldRef<"TeamPlacement", 'String'>
    readonly billingStatus: FieldRef<"TeamPlacement", 'String'>
    readonly collectionStatus: FieldRef<"TeamPlacement", 'String'>
    readonly totalBilledHours: FieldRef<"TeamPlacement", 'Int'>
    readonly revenueLeadUsd: FieldRef<"TeamPlacement", 'Decimal'>
    readonly incentiveInr: FieldRef<"TeamPlacement", 'Decimal'>
    readonly incentivePaidInr: FieldRef<"TeamPlacement", 'Decimal'>
    readonly vbCode: FieldRef<"TeamPlacement", 'String'>
    readonly yearlyPlacementTarget: FieldRef<"TeamPlacement", 'Decimal'>
    readonly placementDone: FieldRef<"TeamPlacement", 'Decimal'>
    readonly placementAchPercent: FieldRef<"TeamPlacement", 'Decimal'>
    readonly yearlyRevenueTarget: FieldRef<"TeamPlacement", 'Decimal'>
    readonly revenueAch: FieldRef<"TeamPlacement", 'Decimal'>
    readonly revenueTargetAchievedPercent: FieldRef<"TeamPlacement", 'Decimal'>
    readonly totalRevenueGenerated: FieldRef<"TeamPlacement", 'Decimal'>
    readonly slabQualified: FieldRef<"TeamPlacement", 'String'>
    readonly totalIncentiveInr: FieldRef<"TeamPlacement", 'Decimal'>
    readonly totalIncentivePaidInr: FieldRef<"TeamPlacement", 'Decimal'>
    readonly createdAt: FieldRef<"TeamPlacement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TeamPlacement findUnique
   */
  export type TeamPlacementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * Filter, which TeamPlacement to fetch.
     */
    where: TeamPlacementWhereUniqueInput
  }

  /**
   * TeamPlacement findUniqueOrThrow
   */
  export type TeamPlacementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * Filter, which TeamPlacement to fetch.
     */
    where: TeamPlacementWhereUniqueInput
  }

  /**
   * TeamPlacement findFirst
   */
  export type TeamPlacementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * Filter, which TeamPlacement to fetch.
     */
    where?: TeamPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamPlacements to fetch.
     */
    orderBy?: TeamPlacementOrderByWithRelationInput | TeamPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TeamPlacements.
     */
    cursor?: TeamPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamPlacements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TeamPlacements.
     */
    distinct?: TeamPlacementScalarFieldEnum | TeamPlacementScalarFieldEnum[]
  }

  /**
   * TeamPlacement findFirstOrThrow
   */
  export type TeamPlacementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * Filter, which TeamPlacement to fetch.
     */
    where?: TeamPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamPlacements to fetch.
     */
    orderBy?: TeamPlacementOrderByWithRelationInput | TeamPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TeamPlacements.
     */
    cursor?: TeamPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamPlacements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TeamPlacements.
     */
    distinct?: TeamPlacementScalarFieldEnum | TeamPlacementScalarFieldEnum[]
  }

  /**
   * TeamPlacement findMany
   */
  export type TeamPlacementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * Filter, which TeamPlacements to fetch.
     */
    where?: TeamPlacementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamPlacements to fetch.
     */
    orderBy?: TeamPlacementOrderByWithRelationInput | TeamPlacementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TeamPlacements.
     */
    cursor?: TeamPlacementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamPlacements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamPlacements.
     */
    skip?: number
    distinct?: TeamPlacementScalarFieldEnum | TeamPlacementScalarFieldEnum[]
  }

  /**
   * TeamPlacement create
   */
  export type TeamPlacementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * The data needed to create a TeamPlacement.
     */
    data: XOR<TeamPlacementCreateInput, TeamPlacementUncheckedCreateInput>
  }

  /**
   * TeamPlacement createMany
   */
  export type TeamPlacementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TeamPlacements.
     */
    data: TeamPlacementCreateManyInput | TeamPlacementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TeamPlacement createManyAndReturn
   */
  export type TeamPlacementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TeamPlacements.
     */
    data: TeamPlacementCreateManyInput | TeamPlacementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TeamPlacement update
   */
  export type TeamPlacementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * The data needed to update a TeamPlacement.
     */
    data: XOR<TeamPlacementUpdateInput, TeamPlacementUncheckedUpdateInput>
    /**
     * Choose, which TeamPlacement to update.
     */
    where: TeamPlacementWhereUniqueInput
  }

  /**
   * TeamPlacement updateMany
   */
  export type TeamPlacementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TeamPlacements.
     */
    data: XOR<TeamPlacementUpdateManyMutationInput, TeamPlacementUncheckedUpdateManyInput>
    /**
     * Filter which TeamPlacements to update
     */
    where?: TeamPlacementWhereInput
  }

  /**
   * TeamPlacement upsert
   */
  export type TeamPlacementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * The filter to search for the TeamPlacement to update in case it exists.
     */
    where: TeamPlacementWhereUniqueInput
    /**
     * In case the TeamPlacement found by the `where` argument doesn't exist, create a new TeamPlacement with this data.
     */
    create: XOR<TeamPlacementCreateInput, TeamPlacementUncheckedCreateInput>
    /**
     * In case the TeamPlacement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TeamPlacementUpdateInput, TeamPlacementUncheckedUpdateInput>
  }

  /**
   * TeamPlacement delete
   */
  export type TeamPlacementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
    /**
     * Filter which TeamPlacement to delete.
     */
    where: TeamPlacementWhereUniqueInput
  }

  /**
   * TeamPlacement deleteMany
   */
  export type TeamPlacementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TeamPlacements to delete
     */
    where?: TeamPlacementWhereInput
  }

  /**
   * TeamPlacement.batch
   */
  export type TeamPlacement$batchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PlacementImportBatch
     */
    select?: PlacementImportBatchSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PlacementImportBatchInclude<ExtArgs> | null
    where?: PlacementImportBatchWhereInput
  }

  /**
   * TeamPlacement without action
   */
  export type TeamPlacementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamPlacement
     */
    select?: TeamPlacementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamPlacementInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TeamScalarFieldEnum: {
    id: 'id',
    name: 'name',
    color: 'color',
    yearlyTarget: 'yearlyTarget',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TeamScalarFieldEnum = (typeof TeamScalarFieldEnum)[keyof typeof TeamScalarFieldEnum]


  export const UserScalarFieldEnum: {
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

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const PasswordResetTokenScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    createdAt: 'createdAt'
  };

  export type PasswordResetTokenScalarFieldEnum = (typeof PasswordResetTokenScalarFieldEnum)[keyof typeof PasswordResetTokenScalarFieldEnum]


  export const EmployeeProfileScalarFieldEnum: {
    id: 'id',
    teamId: 'teamId',
    managerId: 'managerId',
    level: 'level',
    vbid: 'vbid',
    comment: 'comment',
    targetType: 'targetType',
    isActive: 'isActive',
    deletedAt: 'deletedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type EmployeeProfileScalarFieldEnum = (typeof EmployeeProfileScalarFieldEnum)[keyof typeof EmployeeProfileScalarFieldEnum]


  export const RefreshTokenScalarFieldEnum: {
    id: 'id',
    token: 'token',
    userId: 'userId',
    isRevoked: 'isRevoked',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt'
  };

  export type RefreshTokenScalarFieldEnum = (typeof RefreshTokenScalarFieldEnum)[keyof typeof RefreshTokenScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
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

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const PlacementImportBatchScalarFieldEnum: {
    id: 'id',
    type: 'type',
    uploaderId: 'uploaderId',
    createdAt: 'createdAt',
    errors: 'errors'
  };

  export type PlacementImportBatchScalarFieldEnum = (typeof PlacementImportBatchScalarFieldEnum)[keyof typeof PlacementImportBatchScalarFieldEnum]


  export const PersonalPlacementScalarFieldEnum: {
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

  export type PersonalPlacementScalarFieldEnum = (typeof PersonalPlacementScalarFieldEnum)[keyof typeof PersonalPlacementScalarFieldEnum]


  export const TeamPlacementScalarFieldEnum: {
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

  export type TeamPlacementScalarFieldEnum = (typeof TeamPlacementScalarFieldEnum)[keyof typeof TeamPlacementScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'TargetType'
   */
  export type EnumTargetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TargetType'>
    


  /**
   * Reference to a field of type 'TargetType[]'
   */
  export type ListEnumTargetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TargetType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'PlacementImportType'
   */
  export type EnumPlacementImportTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlacementImportType'>
    


  /**
   * Reference to a field of type 'PlacementImportType[]'
   */
  export type ListEnumPlacementImportTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PlacementImportType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type TeamWhereInput = {
    AND?: TeamWhereInput | TeamWhereInput[]
    OR?: TeamWhereInput[]
    NOT?: TeamWhereInput | TeamWhereInput[]
    id?: StringFilter<"Team"> | string
    name?: StringFilter<"Team"> | string
    color?: StringNullableFilter<"Team"> | string | null
    yearlyTarget?: DecimalFilter<"Team"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"Team"> | boolean
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
    employees?: EmployeeProfileListRelationFilter
  }

  export type TeamOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    color?: SortOrderInput | SortOrder
    yearlyTarget?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    employees?: EmployeeProfileOrderByRelationAggregateInput
  }

  export type TeamWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: TeamWhereInput | TeamWhereInput[]
    OR?: TeamWhereInput[]
    NOT?: TeamWhereInput | TeamWhereInput[]
    color?: StringNullableFilter<"Team"> | string | null
    yearlyTarget?: DecimalFilter<"Team"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolFilter<"Team"> | boolean
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
    employees?: EmployeeProfileListRelationFilter
  }, "id" | "name">

  export type TeamOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    color?: SortOrderInput | SortOrder
    yearlyTarget?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TeamCountOrderByAggregateInput
    _avg?: TeamAvgOrderByAggregateInput
    _max?: TeamMaxOrderByAggregateInput
    _min?: TeamMinOrderByAggregateInput
    _sum?: TeamSumOrderByAggregateInput
  }

  export type TeamScalarWhereWithAggregatesInput = {
    AND?: TeamScalarWhereWithAggregatesInput | TeamScalarWhereWithAggregatesInput[]
    OR?: TeamScalarWhereWithAggregatesInput[]
    NOT?: TeamScalarWhereWithAggregatesInput | TeamScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Team"> | string
    name?: StringWithAggregatesFilter<"Team"> | string
    color?: StringNullableWithAggregatesFilter<"Team"> | string | null
    yearlyTarget?: DecimalWithAggregatesFilter<"Team"> | Decimal | DecimalJsLike | number | string
    isActive?: BoolWithAggregatesFilter<"Team"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Team"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Team"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    vbid?: StringNullableFilter<"User"> | string | null
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    mfaSecret?: StringNullableFilter<"User"> | string | null
    mfaEnabled?: BoolFilter<"User"> | boolean
    managerId?: StringNullableFilter<"User"> | string | null
    employeeProfile?: XOR<EmployeeProfileNullableRelationFilter, EmployeeProfileWhereInput> | null
    refreshTokens?: RefreshTokenListRelationFilter
    leadEmployees?: EmployeeProfileListRelationFilter
    manager?: XOR<UserNullableRelationFilter, UserWhereInput> | null
    subordinates?: UserListRelationFilter
    auditLogs?: AuditLogListRelationFilter
    placementImportBatches?: PlacementImportBatchListRelationFilter
    personalPlacements?: PersonalPlacementListRelationFilter
    teamPlacements?: TeamPlacementListRelationFilter
    passwordResetTokens?: PasswordResetTokenListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    vbid?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    mfaSecret?: SortOrderInput | SortOrder
    mfaEnabled?: SortOrder
    managerId?: SortOrderInput | SortOrder
    employeeProfile?: EmployeeProfileOrderByWithRelationInput
    refreshTokens?: RefreshTokenOrderByRelationAggregateInput
    leadEmployees?: EmployeeProfileOrderByRelationAggregateInput
    manager?: UserOrderByWithRelationInput
    subordinates?: UserOrderByRelationAggregateInput
    auditLogs?: AuditLogOrderByRelationAggregateInput
    placementImportBatches?: PlacementImportBatchOrderByRelationAggregateInput
    personalPlacements?: PersonalPlacementOrderByRelationAggregateInput
    teamPlacements?: TeamPlacementOrderByRelationAggregateInput
    passwordResetTokens?: PasswordResetTokenOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    passwordHash?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    vbid?: StringNullableFilter<"User"> | string | null
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    mfaSecret?: StringNullableFilter<"User"> | string | null
    mfaEnabled?: BoolFilter<"User"> | boolean
    managerId?: StringNullableFilter<"User"> | string | null
    employeeProfile?: XOR<EmployeeProfileNullableRelationFilter, EmployeeProfileWhereInput> | null
    refreshTokens?: RefreshTokenListRelationFilter
    leadEmployees?: EmployeeProfileListRelationFilter
    manager?: XOR<UserNullableRelationFilter, UserWhereInput> | null
    subordinates?: UserListRelationFilter
    auditLogs?: AuditLogListRelationFilter
    placementImportBatches?: PlacementImportBatchListRelationFilter
    personalPlacements?: PersonalPlacementListRelationFilter
    teamPlacements?: TeamPlacementListRelationFilter
    passwordResetTokens?: PasswordResetTokenListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    vbid?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    mfaSecret?: SortOrderInput | SortOrder
    mfaEnabled?: SortOrder
    managerId?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    vbid?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    mfaSecret?: StringNullableWithAggregatesFilter<"User"> | string | null
    mfaEnabled?: BoolWithAggregatesFilter<"User"> | boolean
    managerId?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type PasswordResetTokenWhereInput = {
    AND?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    OR?: PasswordResetTokenWhereInput[]
    NOT?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    id?: StringFilter<"PasswordResetToken"> | string
    userId?: StringFilter<"PasswordResetToken"> | string
    tokenHash?: StringFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    usedAt?: DateTimeNullableFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type PasswordResetTokenOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type PasswordResetTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tokenHash?: string
    AND?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    OR?: PasswordResetTokenWhereInput[]
    NOT?: PasswordResetTokenWhereInput | PasswordResetTokenWhereInput[]
    userId?: StringFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    usedAt?: DateTimeNullableFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "tokenHash">

  export type PasswordResetTokenOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PasswordResetTokenCountOrderByAggregateInput
    _max?: PasswordResetTokenMaxOrderByAggregateInput
    _min?: PasswordResetTokenMinOrderByAggregateInput
  }

  export type PasswordResetTokenScalarWhereWithAggregatesInput = {
    AND?: PasswordResetTokenScalarWhereWithAggregatesInput | PasswordResetTokenScalarWhereWithAggregatesInput[]
    OR?: PasswordResetTokenScalarWhereWithAggregatesInput[]
    NOT?: PasswordResetTokenScalarWhereWithAggregatesInput | PasswordResetTokenScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PasswordResetToken"> | string
    userId?: StringWithAggregatesFilter<"PasswordResetToken"> | string
    tokenHash?: StringWithAggregatesFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeWithAggregatesFilter<"PasswordResetToken"> | Date | string
    usedAt?: DateTimeNullableWithAggregatesFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PasswordResetToken"> | Date | string
  }

  export type EmployeeProfileWhereInput = {
    AND?: EmployeeProfileWhereInput | EmployeeProfileWhereInput[]
    OR?: EmployeeProfileWhereInput[]
    NOT?: EmployeeProfileWhereInput | EmployeeProfileWhereInput[]
    id?: StringFilter<"EmployeeProfile"> | string
    teamId?: StringNullableFilter<"EmployeeProfile"> | string | null
    managerId?: StringNullableFilter<"EmployeeProfile"> | string | null
    level?: StringNullableFilter<"EmployeeProfile"> | string | null
    vbid?: StringNullableFilter<"EmployeeProfile"> | string | null
    comment?: StringNullableFilter<"EmployeeProfile"> | string | null
    targetType?: EnumTargetTypeFilter<"EmployeeProfile"> | $Enums.TargetType
    isActive?: BoolFilter<"EmployeeProfile"> | boolean
    deletedAt?: DateTimeNullableFilter<"EmployeeProfile"> | Date | string | null
    createdAt?: DateTimeFilter<"EmployeeProfile"> | Date | string
    updatedAt?: DateTimeFilter<"EmployeeProfile"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    team?: XOR<TeamNullableRelationFilter, TeamWhereInput> | null
    manager?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type EmployeeProfileOrderByWithRelationInput = {
    id?: SortOrder
    teamId?: SortOrderInput | SortOrder
    managerId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    vbid?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    targetType?: SortOrder
    isActive?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    team?: TeamOrderByWithRelationInput
    manager?: UserOrderByWithRelationInput
  }

  export type EmployeeProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    vbid?: string
    AND?: EmployeeProfileWhereInput | EmployeeProfileWhereInput[]
    OR?: EmployeeProfileWhereInput[]
    NOT?: EmployeeProfileWhereInput | EmployeeProfileWhereInput[]
    teamId?: StringNullableFilter<"EmployeeProfile"> | string | null
    managerId?: StringNullableFilter<"EmployeeProfile"> | string | null
    level?: StringNullableFilter<"EmployeeProfile"> | string | null
    comment?: StringNullableFilter<"EmployeeProfile"> | string | null
    targetType?: EnumTargetTypeFilter<"EmployeeProfile"> | $Enums.TargetType
    isActive?: BoolFilter<"EmployeeProfile"> | boolean
    deletedAt?: DateTimeNullableFilter<"EmployeeProfile"> | Date | string | null
    createdAt?: DateTimeFilter<"EmployeeProfile"> | Date | string
    updatedAt?: DateTimeFilter<"EmployeeProfile"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
    team?: XOR<TeamNullableRelationFilter, TeamWhereInput> | null
    manager?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id" | "vbid">

  export type EmployeeProfileOrderByWithAggregationInput = {
    id?: SortOrder
    teamId?: SortOrderInput | SortOrder
    managerId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    vbid?: SortOrderInput | SortOrder
    comment?: SortOrderInput | SortOrder
    targetType?: SortOrder
    isActive?: SortOrder
    deletedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: EmployeeProfileCountOrderByAggregateInput
    _max?: EmployeeProfileMaxOrderByAggregateInput
    _min?: EmployeeProfileMinOrderByAggregateInput
  }

  export type EmployeeProfileScalarWhereWithAggregatesInput = {
    AND?: EmployeeProfileScalarWhereWithAggregatesInput | EmployeeProfileScalarWhereWithAggregatesInput[]
    OR?: EmployeeProfileScalarWhereWithAggregatesInput[]
    NOT?: EmployeeProfileScalarWhereWithAggregatesInput | EmployeeProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"EmployeeProfile"> | string
    teamId?: StringNullableWithAggregatesFilter<"EmployeeProfile"> | string | null
    managerId?: StringNullableWithAggregatesFilter<"EmployeeProfile"> | string | null
    level?: StringNullableWithAggregatesFilter<"EmployeeProfile"> | string | null
    vbid?: StringNullableWithAggregatesFilter<"EmployeeProfile"> | string | null
    comment?: StringNullableWithAggregatesFilter<"EmployeeProfile"> | string | null
    targetType?: EnumTargetTypeWithAggregatesFilter<"EmployeeProfile"> | $Enums.TargetType
    isActive?: BoolWithAggregatesFilter<"EmployeeProfile"> | boolean
    deletedAt?: DateTimeNullableWithAggregatesFilter<"EmployeeProfile"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"EmployeeProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"EmployeeProfile"> | Date | string
  }

  export type RefreshTokenWhereInput = {
    AND?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    OR?: RefreshTokenWhereInput[]
    NOT?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    id?: StringFilter<"RefreshToken"> | string
    token?: StringFilter<"RefreshToken"> | string
    userId?: StringFilter<"RefreshToken"> | string
    isRevoked?: BoolFilter<"RefreshToken"> | boolean
    expiresAt?: DateTimeFilter<"RefreshToken"> | Date | string
    createdAt?: DateTimeFilter<"RefreshToken"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type RefreshTokenOrderByWithRelationInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    isRevoked?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type RefreshTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    token?: string
    AND?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    OR?: RefreshTokenWhereInput[]
    NOT?: RefreshTokenWhereInput | RefreshTokenWhereInput[]
    userId?: StringFilter<"RefreshToken"> | string
    isRevoked?: BoolFilter<"RefreshToken"> | boolean
    expiresAt?: DateTimeFilter<"RefreshToken"> | Date | string
    createdAt?: DateTimeFilter<"RefreshToken"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "token">

  export type RefreshTokenOrderByWithAggregationInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    isRevoked?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    _count?: RefreshTokenCountOrderByAggregateInput
    _max?: RefreshTokenMaxOrderByAggregateInput
    _min?: RefreshTokenMinOrderByAggregateInput
  }

  export type RefreshTokenScalarWhereWithAggregatesInput = {
    AND?: RefreshTokenScalarWhereWithAggregatesInput | RefreshTokenScalarWhereWithAggregatesInput[]
    OR?: RefreshTokenScalarWhereWithAggregatesInput[]
    NOT?: RefreshTokenScalarWhereWithAggregatesInput | RefreshTokenScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RefreshToken"> | string
    token?: StringWithAggregatesFilter<"RefreshToken"> | string
    userId?: StringWithAggregatesFilter<"RefreshToken"> | string
    isRevoked?: BoolWithAggregatesFilter<"RefreshToken"> | boolean
    expiresAt?: DateTimeWithAggregatesFilter<"RefreshToken"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"RefreshToken"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    actorId?: StringNullableFilter<"AuditLog"> | string | null
    action?: StringFilter<"AuditLog"> | string
    module?: StringNullableFilter<"AuditLog"> | string | null
    entityType?: StringNullableFilter<"AuditLog"> | string | null
    entityId?: StringNullableFilter<"AuditLog"> | string | null
    changes?: JsonNullableFilter<"AuditLog">
    status?: StringFilter<"AuditLog"> | string
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    geoLocation?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    isTampered?: BoolFilter<"AuditLog"> | boolean
    hash?: StringNullableFilter<"AuditLog"> | string | null
    actor?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    actorId?: SortOrderInput | SortOrder
    action?: SortOrder
    module?: SortOrderInput | SortOrder
    entityType?: SortOrderInput | SortOrder
    entityId?: SortOrderInput | SortOrder
    changes?: SortOrderInput | SortOrder
    status?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    geoLocation?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    isTampered?: SortOrder
    hash?: SortOrderInput | SortOrder
    actor?: UserOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    actorId?: StringNullableFilter<"AuditLog"> | string | null
    action?: StringFilter<"AuditLog"> | string
    module?: StringNullableFilter<"AuditLog"> | string | null
    entityType?: StringNullableFilter<"AuditLog"> | string | null
    entityId?: StringNullableFilter<"AuditLog"> | string | null
    changes?: JsonNullableFilter<"AuditLog">
    status?: StringFilter<"AuditLog"> | string
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    geoLocation?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    isTampered?: BoolFilter<"AuditLog"> | boolean
    hash?: StringNullableFilter<"AuditLog"> | string | null
    actor?: XOR<UserNullableRelationFilter, UserWhereInput> | null
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    actorId?: SortOrderInput | SortOrder
    action?: SortOrder
    module?: SortOrderInput | SortOrder
    entityType?: SortOrderInput | SortOrder
    entityId?: SortOrderInput | SortOrder
    changes?: SortOrderInput | SortOrder
    status?: SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    geoLocation?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    isTampered?: SortOrder
    hash?: SortOrderInput | SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    actorId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    module?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    entityType?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    entityId?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    changes?: JsonNullableWithAggregatesFilter<"AuditLog">
    status?: StringWithAggregatesFilter<"AuditLog"> | string
    ipAddress?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    geoLocation?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
    isTampered?: BoolWithAggregatesFilter<"AuditLog"> | boolean
    hash?: StringNullableWithAggregatesFilter<"AuditLog"> | string | null
  }

  export type PlacementImportBatchWhereInput = {
    AND?: PlacementImportBatchWhereInput | PlacementImportBatchWhereInput[]
    OR?: PlacementImportBatchWhereInput[]
    NOT?: PlacementImportBatchWhereInput | PlacementImportBatchWhereInput[]
    id?: StringFilter<"PlacementImportBatch"> | string
    type?: EnumPlacementImportTypeFilter<"PlacementImportBatch"> | $Enums.PlacementImportType
    uploaderId?: StringFilter<"PlacementImportBatch"> | string
    createdAt?: DateTimeFilter<"PlacementImportBatch"> | Date | string
    errors?: JsonNullableFilter<"PlacementImportBatch">
    uploader?: XOR<UserRelationFilter, UserWhereInput>
    personalPlacements?: PersonalPlacementListRelationFilter
    teamPlacements?: TeamPlacementListRelationFilter
  }

  export type PlacementImportBatchOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    uploaderId?: SortOrder
    createdAt?: SortOrder
    errors?: SortOrderInput | SortOrder
    uploader?: UserOrderByWithRelationInput
    personalPlacements?: PersonalPlacementOrderByRelationAggregateInput
    teamPlacements?: TeamPlacementOrderByRelationAggregateInput
  }

  export type PlacementImportBatchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PlacementImportBatchWhereInput | PlacementImportBatchWhereInput[]
    OR?: PlacementImportBatchWhereInput[]
    NOT?: PlacementImportBatchWhereInput | PlacementImportBatchWhereInput[]
    type?: EnumPlacementImportTypeFilter<"PlacementImportBatch"> | $Enums.PlacementImportType
    uploaderId?: StringFilter<"PlacementImportBatch"> | string
    createdAt?: DateTimeFilter<"PlacementImportBatch"> | Date | string
    errors?: JsonNullableFilter<"PlacementImportBatch">
    uploader?: XOR<UserRelationFilter, UserWhereInput>
    personalPlacements?: PersonalPlacementListRelationFilter
    teamPlacements?: TeamPlacementListRelationFilter
  }, "id">

  export type PlacementImportBatchOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    uploaderId?: SortOrder
    createdAt?: SortOrder
    errors?: SortOrderInput | SortOrder
    _count?: PlacementImportBatchCountOrderByAggregateInput
    _max?: PlacementImportBatchMaxOrderByAggregateInput
    _min?: PlacementImportBatchMinOrderByAggregateInput
  }

  export type PlacementImportBatchScalarWhereWithAggregatesInput = {
    AND?: PlacementImportBatchScalarWhereWithAggregatesInput | PlacementImportBatchScalarWhereWithAggregatesInput[]
    OR?: PlacementImportBatchScalarWhereWithAggregatesInput[]
    NOT?: PlacementImportBatchScalarWhereWithAggregatesInput | PlacementImportBatchScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PlacementImportBatch"> | string
    type?: EnumPlacementImportTypeWithAggregatesFilter<"PlacementImportBatch"> | $Enums.PlacementImportType
    uploaderId?: StringWithAggregatesFilter<"PlacementImportBatch"> | string
    createdAt?: DateTimeWithAggregatesFilter<"PlacementImportBatch"> | Date | string
    errors?: JsonNullableWithAggregatesFilter<"PlacementImportBatch">
  }

  export type PersonalPlacementWhereInput = {
    AND?: PersonalPlacementWhereInput | PersonalPlacementWhereInput[]
    OR?: PersonalPlacementWhereInput[]
    NOT?: PersonalPlacementWhereInput | PersonalPlacementWhereInput[]
    id?: StringFilter<"PersonalPlacement"> | string
    employeeId?: StringFilter<"PersonalPlacement"> | string
    batchId?: StringNullableFilter<"PersonalPlacement"> | string | null
    level?: StringNullableFilter<"PersonalPlacement"> | string | null
    candidateName?: StringFilter<"PersonalPlacement"> | string
    placementYear?: IntNullableFilter<"PersonalPlacement"> | number | null
    doj?: DateTimeFilter<"PersonalPlacement"> | Date | string
    doq?: DateTimeNullableFilter<"PersonalPlacement"> | Date | string | null
    client?: StringFilter<"PersonalPlacement"> | string
    plcId?: StringFilter<"PersonalPlacement"> | string
    placementType?: StringFilter<"PersonalPlacement"> | string
    billingStatus?: StringFilter<"PersonalPlacement"> | string
    collectionStatus?: StringNullableFilter<"PersonalPlacement"> | string | null
    totalBilledHours?: IntNullableFilter<"PersonalPlacement"> | number | null
    revenueUsd?: DecimalFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableFilter<"PersonalPlacement"> | string | null
    recruiterName?: StringNullableFilter<"PersonalPlacement"> | string | null
    teamLeadName?: StringNullableFilter<"PersonalPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableFilter<"PersonalPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"PersonalPlacement"> | Date | string
    employee?: XOR<UserRelationFilter, UserWhereInput>
    batch?: XOR<PlacementImportBatchNullableRelationFilter, PlacementImportBatchWhereInput> | null
  }

  export type PersonalPlacementOrderByWithRelationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    batchId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    candidateName?: SortOrder
    placementYear?: SortOrderInput | SortOrder
    doj?: SortOrder
    doq?: SortOrderInput | SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrderInput | SortOrder
    totalBilledHours?: SortOrderInput | SortOrder
    revenueUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrderInput | SortOrder
    vbCode?: SortOrderInput | SortOrder
    recruiterName?: SortOrderInput | SortOrder
    teamLeadName?: SortOrderInput | SortOrder
    yearlyPlacementTarget?: SortOrderInput | SortOrder
    placementDone?: SortOrderInput | SortOrder
    targetAchievedPercent?: SortOrderInput | SortOrder
    totalRevenueGenerated?: SortOrderInput | SortOrder
    slabQualified?: SortOrderInput | SortOrder
    totalIncentiveInr?: SortOrderInput | SortOrder
    totalIncentivePaidInr?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    employee?: UserOrderByWithRelationInput
    batch?: PlacementImportBatchOrderByWithRelationInput
  }

  export type PersonalPlacementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PersonalPlacementWhereInput | PersonalPlacementWhereInput[]
    OR?: PersonalPlacementWhereInput[]
    NOT?: PersonalPlacementWhereInput | PersonalPlacementWhereInput[]
    employeeId?: StringFilter<"PersonalPlacement"> | string
    batchId?: StringNullableFilter<"PersonalPlacement"> | string | null
    level?: StringNullableFilter<"PersonalPlacement"> | string | null
    candidateName?: StringFilter<"PersonalPlacement"> | string
    placementYear?: IntNullableFilter<"PersonalPlacement"> | number | null
    doj?: DateTimeFilter<"PersonalPlacement"> | Date | string
    doq?: DateTimeNullableFilter<"PersonalPlacement"> | Date | string | null
    client?: StringFilter<"PersonalPlacement"> | string
    plcId?: StringFilter<"PersonalPlacement"> | string
    placementType?: StringFilter<"PersonalPlacement"> | string
    billingStatus?: StringFilter<"PersonalPlacement"> | string
    collectionStatus?: StringNullableFilter<"PersonalPlacement"> | string | null
    totalBilledHours?: IntNullableFilter<"PersonalPlacement"> | number | null
    revenueUsd?: DecimalFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableFilter<"PersonalPlacement"> | string | null
    recruiterName?: StringNullableFilter<"PersonalPlacement"> | string | null
    teamLeadName?: StringNullableFilter<"PersonalPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableFilter<"PersonalPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"PersonalPlacement"> | Date | string
    employee?: XOR<UserRelationFilter, UserWhereInput>
    batch?: XOR<PlacementImportBatchNullableRelationFilter, PlacementImportBatchWhereInput> | null
  }, "id">

  export type PersonalPlacementOrderByWithAggregationInput = {
    id?: SortOrder
    employeeId?: SortOrder
    batchId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    candidateName?: SortOrder
    placementYear?: SortOrderInput | SortOrder
    doj?: SortOrder
    doq?: SortOrderInput | SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrderInput | SortOrder
    totalBilledHours?: SortOrderInput | SortOrder
    revenueUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrderInput | SortOrder
    vbCode?: SortOrderInput | SortOrder
    recruiterName?: SortOrderInput | SortOrder
    teamLeadName?: SortOrderInput | SortOrder
    yearlyPlacementTarget?: SortOrderInput | SortOrder
    placementDone?: SortOrderInput | SortOrder
    targetAchievedPercent?: SortOrderInput | SortOrder
    totalRevenueGenerated?: SortOrderInput | SortOrder
    slabQualified?: SortOrderInput | SortOrder
    totalIncentiveInr?: SortOrderInput | SortOrder
    totalIncentivePaidInr?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: PersonalPlacementCountOrderByAggregateInput
    _avg?: PersonalPlacementAvgOrderByAggregateInput
    _max?: PersonalPlacementMaxOrderByAggregateInput
    _min?: PersonalPlacementMinOrderByAggregateInput
    _sum?: PersonalPlacementSumOrderByAggregateInput
  }

  export type PersonalPlacementScalarWhereWithAggregatesInput = {
    AND?: PersonalPlacementScalarWhereWithAggregatesInput | PersonalPlacementScalarWhereWithAggregatesInput[]
    OR?: PersonalPlacementScalarWhereWithAggregatesInput[]
    NOT?: PersonalPlacementScalarWhereWithAggregatesInput | PersonalPlacementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PersonalPlacement"> | string
    employeeId?: StringWithAggregatesFilter<"PersonalPlacement"> | string
    batchId?: StringNullableWithAggregatesFilter<"PersonalPlacement"> | string | null
    level?: StringNullableWithAggregatesFilter<"PersonalPlacement"> | string | null
    candidateName?: StringWithAggregatesFilter<"PersonalPlacement"> | string
    placementYear?: IntNullableWithAggregatesFilter<"PersonalPlacement"> | number | null
    doj?: DateTimeWithAggregatesFilter<"PersonalPlacement"> | Date | string
    doq?: DateTimeNullableWithAggregatesFilter<"PersonalPlacement"> | Date | string | null
    client?: StringWithAggregatesFilter<"PersonalPlacement"> | string
    plcId?: StringWithAggregatesFilter<"PersonalPlacement"> | string
    placementType?: StringWithAggregatesFilter<"PersonalPlacement"> | string
    billingStatus?: StringWithAggregatesFilter<"PersonalPlacement"> | string
    collectionStatus?: StringNullableWithAggregatesFilter<"PersonalPlacement"> | string | null
    totalBilledHours?: IntNullableWithAggregatesFilter<"PersonalPlacement"> | number | null
    revenueUsd?: DecimalWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableWithAggregatesFilter<"PersonalPlacement"> | string | null
    recruiterName?: StringNullableWithAggregatesFilter<"PersonalPlacement"> | string | null
    teamLeadName?: StringNullableWithAggregatesFilter<"PersonalPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: DecimalNullableWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableWithAggregatesFilter<"PersonalPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableWithAggregatesFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PersonalPlacement"> | Date | string
  }

  export type TeamPlacementWhereInput = {
    AND?: TeamPlacementWhereInput | TeamPlacementWhereInput[]
    OR?: TeamPlacementWhereInput[]
    NOT?: TeamPlacementWhereInput | TeamPlacementWhereInput[]
    id?: StringFilter<"TeamPlacement"> | string
    leadId?: StringFilter<"TeamPlacement"> | string
    batchId?: StringNullableFilter<"TeamPlacement"> | string | null
    level?: StringNullableFilter<"TeamPlacement"> | string | null
    candidateName?: StringFilter<"TeamPlacement"> | string
    recruiterName?: StringNullableFilter<"TeamPlacement"> | string | null
    leadName?: StringNullableFilter<"TeamPlacement"> | string | null
    splitWith?: StringNullableFilter<"TeamPlacement"> | string | null
    placementYear?: IntNullableFilter<"TeamPlacement"> | number | null
    doj?: DateTimeFilter<"TeamPlacement"> | Date | string
    doq?: DateTimeNullableFilter<"TeamPlacement"> | Date | string | null
    client?: StringFilter<"TeamPlacement"> | string
    plcId?: StringFilter<"TeamPlacement"> | string
    placementType?: StringFilter<"TeamPlacement"> | string
    billingStatus?: StringFilter<"TeamPlacement"> | string
    collectionStatus?: StringNullableFilter<"TeamPlacement"> | string | null
    totalBilledHours?: IntNullableFilter<"TeamPlacement"> | number | null
    revenueLeadUsd?: DecimalFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableFilter<"TeamPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueAch?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableFilter<"TeamPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"TeamPlacement"> | Date | string
    lead?: XOR<UserRelationFilter, UserWhereInput>
    batch?: XOR<PlacementImportBatchNullableRelationFilter, PlacementImportBatchWhereInput> | null
  }

  export type TeamPlacementOrderByWithRelationInput = {
    id?: SortOrder
    leadId?: SortOrder
    batchId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    candidateName?: SortOrder
    recruiterName?: SortOrderInput | SortOrder
    leadName?: SortOrderInput | SortOrder
    splitWith?: SortOrderInput | SortOrder
    placementYear?: SortOrderInput | SortOrder
    doj?: SortOrder
    doq?: SortOrderInput | SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrderInput | SortOrder
    totalBilledHours?: SortOrderInput | SortOrder
    revenueLeadUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrderInput | SortOrder
    vbCode?: SortOrderInput | SortOrder
    yearlyPlacementTarget?: SortOrderInput | SortOrder
    placementDone?: SortOrderInput | SortOrder
    placementAchPercent?: SortOrderInput | SortOrder
    yearlyRevenueTarget?: SortOrderInput | SortOrder
    revenueAch?: SortOrderInput | SortOrder
    revenueTargetAchievedPercent?: SortOrderInput | SortOrder
    totalRevenueGenerated?: SortOrderInput | SortOrder
    slabQualified?: SortOrderInput | SortOrder
    totalIncentiveInr?: SortOrderInput | SortOrder
    totalIncentivePaidInr?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    lead?: UserOrderByWithRelationInput
    batch?: PlacementImportBatchOrderByWithRelationInput
  }

  export type TeamPlacementWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TeamPlacementWhereInput | TeamPlacementWhereInput[]
    OR?: TeamPlacementWhereInput[]
    NOT?: TeamPlacementWhereInput | TeamPlacementWhereInput[]
    leadId?: StringFilter<"TeamPlacement"> | string
    batchId?: StringNullableFilter<"TeamPlacement"> | string | null
    level?: StringNullableFilter<"TeamPlacement"> | string | null
    candidateName?: StringFilter<"TeamPlacement"> | string
    recruiterName?: StringNullableFilter<"TeamPlacement"> | string | null
    leadName?: StringNullableFilter<"TeamPlacement"> | string | null
    splitWith?: StringNullableFilter<"TeamPlacement"> | string | null
    placementYear?: IntNullableFilter<"TeamPlacement"> | number | null
    doj?: DateTimeFilter<"TeamPlacement"> | Date | string
    doq?: DateTimeNullableFilter<"TeamPlacement"> | Date | string | null
    client?: StringFilter<"TeamPlacement"> | string
    plcId?: StringFilter<"TeamPlacement"> | string
    placementType?: StringFilter<"TeamPlacement"> | string
    billingStatus?: StringFilter<"TeamPlacement"> | string
    collectionStatus?: StringNullableFilter<"TeamPlacement"> | string | null
    totalBilledHours?: IntNullableFilter<"TeamPlacement"> | number | null
    revenueLeadUsd?: DecimalFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableFilter<"TeamPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueAch?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableFilter<"TeamPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"TeamPlacement"> | Date | string
    lead?: XOR<UserRelationFilter, UserWhereInput>
    batch?: XOR<PlacementImportBatchNullableRelationFilter, PlacementImportBatchWhereInput> | null
  }, "id">

  export type TeamPlacementOrderByWithAggregationInput = {
    id?: SortOrder
    leadId?: SortOrder
    batchId?: SortOrderInput | SortOrder
    level?: SortOrderInput | SortOrder
    candidateName?: SortOrder
    recruiterName?: SortOrderInput | SortOrder
    leadName?: SortOrderInput | SortOrder
    splitWith?: SortOrderInput | SortOrder
    placementYear?: SortOrderInput | SortOrder
    doj?: SortOrder
    doq?: SortOrderInput | SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrderInput | SortOrder
    totalBilledHours?: SortOrderInput | SortOrder
    revenueLeadUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrderInput | SortOrder
    vbCode?: SortOrderInput | SortOrder
    yearlyPlacementTarget?: SortOrderInput | SortOrder
    placementDone?: SortOrderInput | SortOrder
    placementAchPercent?: SortOrderInput | SortOrder
    yearlyRevenueTarget?: SortOrderInput | SortOrder
    revenueAch?: SortOrderInput | SortOrder
    revenueTargetAchievedPercent?: SortOrderInput | SortOrder
    totalRevenueGenerated?: SortOrderInput | SortOrder
    slabQualified?: SortOrderInput | SortOrder
    totalIncentiveInr?: SortOrderInput | SortOrder
    totalIncentivePaidInr?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: TeamPlacementCountOrderByAggregateInput
    _avg?: TeamPlacementAvgOrderByAggregateInput
    _max?: TeamPlacementMaxOrderByAggregateInput
    _min?: TeamPlacementMinOrderByAggregateInput
    _sum?: TeamPlacementSumOrderByAggregateInput
  }

  export type TeamPlacementScalarWhereWithAggregatesInput = {
    AND?: TeamPlacementScalarWhereWithAggregatesInput | TeamPlacementScalarWhereWithAggregatesInput[]
    OR?: TeamPlacementScalarWhereWithAggregatesInput[]
    NOT?: TeamPlacementScalarWhereWithAggregatesInput | TeamPlacementScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TeamPlacement"> | string
    leadId?: StringWithAggregatesFilter<"TeamPlacement"> | string
    batchId?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    level?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    candidateName?: StringWithAggregatesFilter<"TeamPlacement"> | string
    recruiterName?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    leadName?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    splitWith?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    placementYear?: IntNullableWithAggregatesFilter<"TeamPlacement"> | number | null
    doj?: DateTimeWithAggregatesFilter<"TeamPlacement"> | Date | string
    doq?: DateTimeNullableWithAggregatesFilter<"TeamPlacement"> | Date | string | null
    client?: StringWithAggregatesFilter<"TeamPlacement"> | string
    plcId?: StringWithAggregatesFilter<"TeamPlacement"> | string
    placementType?: StringWithAggregatesFilter<"TeamPlacement"> | string
    billingStatus?: StringWithAggregatesFilter<"TeamPlacement"> | string
    collectionStatus?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    totalBilledHours?: IntNullableWithAggregatesFilter<"TeamPlacement"> | number | null
    revenueLeadUsd?: DecimalWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueAch?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableWithAggregatesFilter<"TeamPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableWithAggregatesFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeWithAggregatesFilter<"TeamPlacement"> | Date | string
  }

  export type TeamCreateInput = {
    id?: string
    name: string
    color?: string | null
    yearlyTarget: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    employees?: EmployeeProfileCreateNestedManyWithoutTeamInput
  }

  export type TeamUncheckedCreateInput = {
    id?: string
    name: string
    color?: string | null
    yearlyTarget: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    employees?: EmployeeProfileUncheckedCreateNestedManyWithoutTeamInput
  }

  export type TeamUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyTarget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employees?: EmployeeProfileUpdateManyWithoutTeamNestedInput
  }

  export type TeamUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyTarget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employees?: EmployeeProfileUncheckedUpdateManyWithoutTeamNestedInput
  }

  export type TeamCreateManyInput = {
    id?: string
    name: string
    color?: string | null
    yearlyTarget: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TeamUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyTarget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyTarget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PasswordResetTokenCreateInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutPasswordResetTokensInput
  }

  export type PasswordResetTokenUncheckedCreateInput = {
    id?: string
    userId: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutPasswordResetTokensNestedInput
  }

  export type PasswordResetTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenCreateManyInput = {
    id?: string
    userId: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmployeeProfileCreateInput = {
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutEmployeeProfileInput
    team?: TeamCreateNestedOneWithoutEmployeesInput
    manager?: UserCreateNestedOneWithoutLeadEmployeesInput
  }

  export type EmployeeProfileUncheckedCreateInput = {
    id: string
    teamId?: string | null
    managerId?: string | null
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmployeeProfileUpdateInput = {
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutEmployeeProfileNestedInput
    team?: TeamUpdateOneWithoutEmployeesNestedInput
    manager?: UserUpdateOneWithoutLeadEmployeesNestedInput
  }

  export type EmployeeProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmployeeProfileCreateManyInput = {
    id: string
    teamId?: string | null
    managerId?: string | null
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmployeeProfileUpdateManyMutationInput = {
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmployeeProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenCreateInput = {
    id?: string
    token: string
    isRevoked?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutRefreshTokensInput
  }

  export type RefreshTokenUncheckedCreateInput = {
    id?: string
    token: string
    userId: string
    isRevoked?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type RefreshTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    isRevoked?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutRefreshTokensNestedInput
  }

  export type RefreshTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    isRevoked?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenCreateManyInput = {
    id?: string
    token: string
    userId: string
    isRevoked?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type RefreshTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    isRevoked?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    isRevoked?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    action: string
    module?: string | null
    entityType?: string | null
    entityId?: string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    ipAddress?: string | null
    userAgent?: string | null
    geoLocation?: string | null
    createdAt?: Date | string
    isTampered?: boolean
    hash?: string | null
    actor?: UserCreateNestedOneWithoutAuditLogsInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    actorId?: string | null
    action: string
    module?: string | null
    entityType?: string | null
    entityId?: string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    ipAddress?: string | null
    userAgent?: string | null
    geoLocation?: string | null
    createdAt?: Date | string
    isTampered?: boolean
    hash?: string | null
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    module?: NullableStringFieldUpdateOperationsInput | string | null
    entityType?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    geoLocation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isTampered?: BoolFieldUpdateOperationsInput | boolean
    hash?: NullableStringFieldUpdateOperationsInput | string | null
    actor?: UserUpdateOneWithoutAuditLogsNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    module?: NullableStringFieldUpdateOperationsInput | string | null
    entityType?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    geoLocation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isTampered?: BoolFieldUpdateOperationsInput | boolean
    hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogCreateManyInput = {
    id?: string
    actorId?: string | null
    action: string
    module?: string | null
    entityType?: string | null
    entityId?: string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    ipAddress?: string | null
    userAgent?: string | null
    geoLocation?: string | null
    createdAt?: Date | string
    isTampered?: boolean
    hash?: string | null
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    module?: NullableStringFieldUpdateOperationsInput | string | null
    entityType?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    geoLocation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isTampered?: BoolFieldUpdateOperationsInput | boolean
    hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    actorId?: NullableStringFieldUpdateOperationsInput | string | null
    action?: StringFieldUpdateOperationsInput | string
    module?: NullableStringFieldUpdateOperationsInput | string | null
    entityType?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    geoLocation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isTampered?: BoolFieldUpdateOperationsInput | boolean
    hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlacementImportBatchCreateInput = {
    id?: string
    type: $Enums.PlacementImportType
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    uploader: UserCreateNestedOneWithoutPlacementImportBatchesInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutBatchInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchUncheckedCreateInput = {
    id?: string
    type: $Enums.PlacementImportType
    uploaderId: string
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutBatchInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    uploader?: UserUpdateOneRequiredWithoutPlacementImportBatchesNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutBatchNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutBatchNestedInput
  }

  export type PlacementImportBatchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    uploaderId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutBatchNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutBatchNestedInput
  }

  export type PlacementImportBatchCreateManyInput = {
    id?: string
    type: $Enums.PlacementImportType
    uploaderId: string
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PlacementImportBatchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PlacementImportBatchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    uploaderId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PersonalPlacementCreateInput = {
    id?: string
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    employee: UserCreateNestedOneWithoutPersonalPlacementsInput
    batch?: PlacementImportBatchCreateNestedOneWithoutPersonalPlacementsInput
  }

  export type PersonalPlacementUncheckedCreateInput = {
    id?: string
    employeeId: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type PersonalPlacementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employee?: UserUpdateOneRequiredWithoutPersonalPlacementsNestedInput
    batch?: PlacementImportBatchUpdateOneWithoutPersonalPlacementsNestedInput
  }

  export type PersonalPlacementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PersonalPlacementCreateManyInput = {
    id?: string
    employeeId: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type PersonalPlacementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PersonalPlacementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamPlacementCreateInput = {
    id?: string
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    lead: UserCreateNestedOneWithoutTeamPlacementsInput
    batch?: PlacementImportBatchCreateNestedOneWithoutTeamPlacementsInput
  }

  export type TeamPlacementUncheckedCreateInput = {
    id?: string
    leadId: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type TeamPlacementUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lead?: UserUpdateOneRequiredWithoutTeamPlacementsNestedInput
    batch?: PlacementImportBatchUpdateOneWithoutTeamPlacementsNestedInput
  }

  export type TeamPlacementUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    leadId?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamPlacementCreateManyInput = {
    id?: string
    leadId: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type TeamPlacementUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamPlacementUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    leadId?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type EmployeeProfileListRelationFilter = {
    every?: EmployeeProfileWhereInput
    some?: EmployeeProfileWhereInput
    none?: EmployeeProfileWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type EmployeeProfileOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TeamCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    color?: SortOrder
    yearlyTarget?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TeamAvgOrderByAggregateInput = {
    yearlyTarget?: SortOrder
  }

  export type TeamMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    color?: SortOrder
    yearlyTarget?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TeamMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    color?: SortOrder
    yearlyTarget?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TeamSumOrderByAggregateInput = {
    yearlyTarget?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type EmployeeProfileNullableRelationFilter = {
    is?: EmployeeProfileWhereInput | null
    isNot?: EmployeeProfileWhereInput | null
  }

  export type RefreshTokenListRelationFilter = {
    every?: RefreshTokenWhereInput
    some?: RefreshTokenWhereInput
    none?: RefreshTokenWhereInput
  }

  export type UserNullableRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type PlacementImportBatchListRelationFilter = {
    every?: PlacementImportBatchWhereInput
    some?: PlacementImportBatchWhereInput
    none?: PlacementImportBatchWhereInput
  }

  export type PersonalPlacementListRelationFilter = {
    every?: PersonalPlacementWhereInput
    some?: PersonalPlacementWhereInput
    none?: PersonalPlacementWhereInput
  }

  export type TeamPlacementListRelationFilter = {
    every?: TeamPlacementWhereInput
    some?: TeamPlacementWhereInput
    none?: TeamPlacementWhereInput
  }

  export type PasswordResetTokenListRelationFilter = {
    every?: PasswordResetTokenWhereInput
    some?: PasswordResetTokenWhereInput
    none?: PasswordResetTokenWhereInput
  }

  export type RefreshTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PlacementImportBatchOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PersonalPlacementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TeamPlacementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PasswordResetTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    vbid?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    mfaSecret?: SortOrder
    mfaEnabled?: SortOrder
    managerId?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    vbid?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    mfaSecret?: SortOrder
    mfaEnabled?: SortOrder
    managerId?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    name?: SortOrder
    vbid?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    mfaSecret?: SortOrder
    mfaEnabled?: SortOrder
    managerId?: SortOrder
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type PasswordResetTokenCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PasswordResetTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type PasswordResetTokenMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenHash?: SortOrder
    expiresAt?: SortOrder
    usedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumTargetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TargetType | EnumTargetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTargetTypeFilter<$PrismaModel> | $Enums.TargetType
  }

  export type TeamNullableRelationFilter = {
    is?: TeamWhereInput | null
    isNot?: TeamWhereInput | null
  }

  export type EmployeeProfileCountOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    managerId?: SortOrder
    level?: SortOrder
    vbid?: SortOrder
    comment?: SortOrder
    targetType?: SortOrder
    isActive?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmployeeProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    managerId?: SortOrder
    level?: SortOrder
    vbid?: SortOrder
    comment?: SortOrder
    targetType?: SortOrder
    isActive?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EmployeeProfileMinOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    managerId?: SortOrder
    level?: SortOrder
    vbid?: SortOrder
    comment?: SortOrder
    targetType?: SortOrder
    isActive?: SortOrder
    deletedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumTargetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TargetType | EnumTargetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTargetTypeWithAggregatesFilter<$PrismaModel> | $Enums.TargetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTargetTypeFilter<$PrismaModel>
    _max?: NestedEnumTargetTypeFilter<$PrismaModel>
  }

  export type RefreshTokenCountOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    isRevoked?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type RefreshTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    isRevoked?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }

  export type RefreshTokenMinOrderByAggregateInput = {
    id?: SortOrder
    token?: SortOrder
    userId?: SortOrder
    isRevoked?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    module?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    changes?: SortOrder
    status?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    geoLocation?: SortOrder
    createdAt?: SortOrder
    isTampered?: SortOrder
    hash?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    module?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    status?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    geoLocation?: SortOrder
    createdAt?: SortOrder
    isTampered?: SortOrder
    hash?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
    action?: SortOrder
    module?: SortOrder
    entityType?: SortOrder
    entityId?: SortOrder
    status?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    geoLocation?: SortOrder
    createdAt?: SortOrder
    isTampered?: SortOrder
    hash?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumPlacementImportTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PlacementImportType | EnumPlacementImportTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlacementImportTypeFilter<$PrismaModel> | $Enums.PlacementImportType
  }

  export type PlacementImportBatchCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    uploaderId?: SortOrder
    createdAt?: SortOrder
    errors?: SortOrder
  }

  export type PlacementImportBatchMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    uploaderId?: SortOrder
    createdAt?: SortOrder
  }

  export type PlacementImportBatchMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    uploaderId?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumPlacementImportTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlacementImportType | EnumPlacementImportTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlacementImportTypeWithAggregatesFilter<$PrismaModel> | $Enums.PlacementImportType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlacementImportTypeFilter<$PrismaModel>
    _max?: NestedEnumPlacementImportTypeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type PlacementImportBatchNullableRelationFilter = {
    is?: PlacementImportBatchWhereInput | null
    isNot?: PlacementImportBatchWhereInput | null
  }

  export type PersonalPlacementCountOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    batchId?: SortOrder
    level?: SortOrder
    candidateName?: SortOrder
    placementYear?: SortOrder
    doj?: SortOrder
    doq?: SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrder
    totalBilledHours?: SortOrder
    revenueUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    vbCode?: SortOrder
    recruiterName?: SortOrder
    teamLeadName?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    targetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    slabQualified?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
    createdAt?: SortOrder
  }

  export type PersonalPlacementAvgOrderByAggregateInput = {
    placementYear?: SortOrder
    totalBilledHours?: SortOrder
    revenueUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    targetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
  }

  export type PersonalPlacementMaxOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    batchId?: SortOrder
    level?: SortOrder
    candidateName?: SortOrder
    placementYear?: SortOrder
    doj?: SortOrder
    doq?: SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrder
    totalBilledHours?: SortOrder
    revenueUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    vbCode?: SortOrder
    recruiterName?: SortOrder
    teamLeadName?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    targetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    slabQualified?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
    createdAt?: SortOrder
  }

  export type PersonalPlacementMinOrderByAggregateInput = {
    id?: SortOrder
    employeeId?: SortOrder
    batchId?: SortOrder
    level?: SortOrder
    candidateName?: SortOrder
    placementYear?: SortOrder
    doj?: SortOrder
    doq?: SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrder
    totalBilledHours?: SortOrder
    revenueUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    vbCode?: SortOrder
    recruiterName?: SortOrder
    teamLeadName?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    targetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    slabQualified?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
    createdAt?: SortOrder
  }

  export type PersonalPlacementSumOrderByAggregateInput = {
    placementYear?: SortOrder
    totalBilledHours?: SortOrder
    revenueUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    targetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type TeamPlacementCountOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    batchId?: SortOrder
    level?: SortOrder
    candidateName?: SortOrder
    recruiterName?: SortOrder
    leadName?: SortOrder
    splitWith?: SortOrder
    placementYear?: SortOrder
    doj?: SortOrder
    doq?: SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrder
    totalBilledHours?: SortOrder
    revenueLeadUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    vbCode?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    placementAchPercent?: SortOrder
    yearlyRevenueTarget?: SortOrder
    revenueAch?: SortOrder
    revenueTargetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    slabQualified?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
    createdAt?: SortOrder
  }

  export type TeamPlacementAvgOrderByAggregateInput = {
    placementYear?: SortOrder
    totalBilledHours?: SortOrder
    revenueLeadUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    placementAchPercent?: SortOrder
    yearlyRevenueTarget?: SortOrder
    revenueAch?: SortOrder
    revenueTargetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
  }

  export type TeamPlacementMaxOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    batchId?: SortOrder
    level?: SortOrder
    candidateName?: SortOrder
    recruiterName?: SortOrder
    leadName?: SortOrder
    splitWith?: SortOrder
    placementYear?: SortOrder
    doj?: SortOrder
    doq?: SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrder
    totalBilledHours?: SortOrder
    revenueLeadUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    vbCode?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    placementAchPercent?: SortOrder
    yearlyRevenueTarget?: SortOrder
    revenueAch?: SortOrder
    revenueTargetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    slabQualified?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
    createdAt?: SortOrder
  }

  export type TeamPlacementMinOrderByAggregateInput = {
    id?: SortOrder
    leadId?: SortOrder
    batchId?: SortOrder
    level?: SortOrder
    candidateName?: SortOrder
    recruiterName?: SortOrder
    leadName?: SortOrder
    splitWith?: SortOrder
    placementYear?: SortOrder
    doj?: SortOrder
    doq?: SortOrder
    client?: SortOrder
    plcId?: SortOrder
    placementType?: SortOrder
    billingStatus?: SortOrder
    collectionStatus?: SortOrder
    totalBilledHours?: SortOrder
    revenueLeadUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    vbCode?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    placementAchPercent?: SortOrder
    yearlyRevenueTarget?: SortOrder
    revenueAch?: SortOrder
    revenueTargetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    slabQualified?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
    createdAt?: SortOrder
  }

  export type TeamPlacementSumOrderByAggregateInput = {
    placementYear?: SortOrder
    totalBilledHours?: SortOrder
    revenueLeadUsd?: SortOrder
    incentiveInr?: SortOrder
    incentivePaidInr?: SortOrder
    yearlyPlacementTarget?: SortOrder
    placementDone?: SortOrder
    placementAchPercent?: SortOrder
    yearlyRevenueTarget?: SortOrder
    revenueAch?: SortOrder
    revenueTargetAchievedPercent?: SortOrder
    totalRevenueGenerated?: SortOrder
    totalIncentiveInr?: SortOrder
    totalIncentivePaidInr?: SortOrder
  }

  export type EmployeeProfileCreateNestedManyWithoutTeamInput = {
    create?: XOR<EmployeeProfileCreateWithoutTeamInput, EmployeeProfileUncheckedCreateWithoutTeamInput> | EmployeeProfileCreateWithoutTeamInput[] | EmployeeProfileUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutTeamInput | EmployeeProfileCreateOrConnectWithoutTeamInput[]
    createMany?: EmployeeProfileCreateManyTeamInputEnvelope
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
  }

  export type EmployeeProfileUncheckedCreateNestedManyWithoutTeamInput = {
    create?: XOR<EmployeeProfileCreateWithoutTeamInput, EmployeeProfileUncheckedCreateWithoutTeamInput> | EmployeeProfileCreateWithoutTeamInput[] | EmployeeProfileUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutTeamInput | EmployeeProfileCreateOrConnectWithoutTeamInput[]
    createMany?: EmployeeProfileCreateManyTeamInputEnvelope
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EmployeeProfileUpdateManyWithoutTeamNestedInput = {
    create?: XOR<EmployeeProfileCreateWithoutTeamInput, EmployeeProfileUncheckedCreateWithoutTeamInput> | EmployeeProfileCreateWithoutTeamInput[] | EmployeeProfileUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutTeamInput | EmployeeProfileCreateOrConnectWithoutTeamInput[]
    upsert?: EmployeeProfileUpsertWithWhereUniqueWithoutTeamInput | EmployeeProfileUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: EmployeeProfileCreateManyTeamInputEnvelope
    set?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    disconnect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    delete?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    update?: EmployeeProfileUpdateWithWhereUniqueWithoutTeamInput | EmployeeProfileUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: EmployeeProfileUpdateManyWithWhereWithoutTeamInput | EmployeeProfileUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: EmployeeProfileScalarWhereInput | EmployeeProfileScalarWhereInput[]
  }

  export type EmployeeProfileUncheckedUpdateManyWithoutTeamNestedInput = {
    create?: XOR<EmployeeProfileCreateWithoutTeamInput, EmployeeProfileUncheckedCreateWithoutTeamInput> | EmployeeProfileCreateWithoutTeamInput[] | EmployeeProfileUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutTeamInput | EmployeeProfileCreateOrConnectWithoutTeamInput[]
    upsert?: EmployeeProfileUpsertWithWhereUniqueWithoutTeamInput | EmployeeProfileUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: EmployeeProfileCreateManyTeamInputEnvelope
    set?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    disconnect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    delete?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    update?: EmployeeProfileUpdateWithWhereUniqueWithoutTeamInput | EmployeeProfileUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: EmployeeProfileUpdateManyWithWhereWithoutTeamInput | EmployeeProfileUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: EmployeeProfileScalarWhereInput | EmployeeProfileScalarWhereInput[]
  }

  export type EmployeeProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<EmployeeProfileCreateWithoutUserInput, EmployeeProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutUserInput
    connect?: EmployeeProfileWhereUniqueInput
  }

  export type RefreshTokenCreateNestedManyWithoutUserInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
  }

  export type EmployeeProfileCreateNestedManyWithoutManagerInput = {
    create?: XOR<EmployeeProfileCreateWithoutManagerInput, EmployeeProfileUncheckedCreateWithoutManagerInput> | EmployeeProfileCreateWithoutManagerInput[] | EmployeeProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutManagerInput | EmployeeProfileCreateOrConnectWithoutManagerInput[]
    createMany?: EmployeeProfileCreateManyManagerInputEnvelope
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutSubordinatesInput = {
    create?: XOR<UserCreateWithoutSubordinatesInput, UserUncheckedCreateWithoutSubordinatesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSubordinatesInput
    connect?: UserWhereUniqueInput
  }

  export type UserCreateNestedManyWithoutManagerInput = {
    create?: XOR<UserCreateWithoutManagerInput, UserUncheckedCreateWithoutManagerInput> | UserCreateWithoutManagerInput[] | UserUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserCreateOrConnectWithoutManagerInput | UserCreateOrConnectWithoutManagerInput[]
    createMany?: UserCreateManyManagerInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type AuditLogCreateNestedManyWithoutActorInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type PlacementImportBatchCreateNestedManyWithoutUploaderInput = {
    create?: XOR<PlacementImportBatchCreateWithoutUploaderInput, PlacementImportBatchUncheckedCreateWithoutUploaderInput> | PlacementImportBatchCreateWithoutUploaderInput[] | PlacementImportBatchUncheckedCreateWithoutUploaderInput[]
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutUploaderInput | PlacementImportBatchCreateOrConnectWithoutUploaderInput[]
    createMany?: PlacementImportBatchCreateManyUploaderInputEnvelope
    connect?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
  }

  export type PersonalPlacementCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<PersonalPlacementCreateWithoutEmployeeInput, PersonalPlacementUncheckedCreateWithoutEmployeeInput> | PersonalPlacementCreateWithoutEmployeeInput[] | PersonalPlacementUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutEmployeeInput | PersonalPlacementCreateOrConnectWithoutEmployeeInput[]
    createMany?: PersonalPlacementCreateManyEmployeeInputEnvelope
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
  }

  export type TeamPlacementCreateNestedManyWithoutLeadInput = {
    create?: XOR<TeamPlacementCreateWithoutLeadInput, TeamPlacementUncheckedCreateWithoutLeadInput> | TeamPlacementCreateWithoutLeadInput[] | TeamPlacementUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutLeadInput | TeamPlacementCreateOrConnectWithoutLeadInput[]
    createMany?: TeamPlacementCreateManyLeadInputEnvelope
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
  }

  export type PasswordResetTokenCreateNestedManyWithoutUserInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
  }

  export type EmployeeProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<EmployeeProfileCreateWithoutUserInput, EmployeeProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutUserInput
    connect?: EmployeeProfileWhereUniqueInput
  }

  export type RefreshTokenUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
  }

  export type EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput = {
    create?: XOR<EmployeeProfileCreateWithoutManagerInput, EmployeeProfileUncheckedCreateWithoutManagerInput> | EmployeeProfileCreateWithoutManagerInput[] | EmployeeProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutManagerInput | EmployeeProfileCreateOrConnectWithoutManagerInput[]
    createMany?: EmployeeProfileCreateManyManagerInputEnvelope
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutManagerInput = {
    create?: XOR<UserCreateWithoutManagerInput, UserUncheckedCreateWithoutManagerInput> | UserCreateWithoutManagerInput[] | UserUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserCreateOrConnectWithoutManagerInput | UserCreateOrConnectWithoutManagerInput[]
    createMany?: UserCreateManyManagerInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutActorInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput = {
    create?: XOR<PlacementImportBatchCreateWithoutUploaderInput, PlacementImportBatchUncheckedCreateWithoutUploaderInput> | PlacementImportBatchCreateWithoutUploaderInput[] | PlacementImportBatchUncheckedCreateWithoutUploaderInput[]
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutUploaderInput | PlacementImportBatchCreateOrConnectWithoutUploaderInput[]
    createMany?: PlacementImportBatchCreateManyUploaderInputEnvelope
    connect?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
  }

  export type PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput = {
    create?: XOR<PersonalPlacementCreateWithoutEmployeeInput, PersonalPlacementUncheckedCreateWithoutEmployeeInput> | PersonalPlacementCreateWithoutEmployeeInput[] | PersonalPlacementUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutEmployeeInput | PersonalPlacementCreateOrConnectWithoutEmployeeInput[]
    createMany?: PersonalPlacementCreateManyEmployeeInputEnvelope
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
  }

  export type TeamPlacementUncheckedCreateNestedManyWithoutLeadInput = {
    create?: XOR<TeamPlacementCreateWithoutLeadInput, TeamPlacementUncheckedCreateWithoutLeadInput> | TeamPlacementCreateWithoutLeadInput[] | TeamPlacementUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutLeadInput | TeamPlacementCreateOrConnectWithoutLeadInput[]
    createMany?: TeamPlacementCreateManyLeadInputEnvelope
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
  }

  export type PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type EmployeeProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<EmployeeProfileCreateWithoutUserInput, EmployeeProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutUserInput
    upsert?: EmployeeProfileUpsertWithoutUserInput
    disconnect?: EmployeeProfileWhereInput | boolean
    delete?: EmployeeProfileWhereInput | boolean
    connect?: EmployeeProfileWhereUniqueInput
    update?: XOR<XOR<EmployeeProfileUpdateToOneWithWhereWithoutUserInput, EmployeeProfileUpdateWithoutUserInput>, EmployeeProfileUncheckedUpdateWithoutUserInput>
  }

  export type RefreshTokenUpdateManyWithoutUserNestedInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    upsert?: RefreshTokenUpsertWithWhereUniqueWithoutUserInput | RefreshTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    set?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    disconnect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    delete?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    update?: RefreshTokenUpdateWithWhereUniqueWithoutUserInput | RefreshTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RefreshTokenUpdateManyWithWhereWithoutUserInput | RefreshTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
  }

  export type EmployeeProfileUpdateManyWithoutManagerNestedInput = {
    create?: XOR<EmployeeProfileCreateWithoutManagerInput, EmployeeProfileUncheckedCreateWithoutManagerInput> | EmployeeProfileCreateWithoutManagerInput[] | EmployeeProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutManagerInput | EmployeeProfileCreateOrConnectWithoutManagerInput[]
    upsert?: EmployeeProfileUpsertWithWhereUniqueWithoutManagerInput | EmployeeProfileUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: EmployeeProfileCreateManyManagerInputEnvelope
    set?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    disconnect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    delete?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    update?: EmployeeProfileUpdateWithWhereUniqueWithoutManagerInput | EmployeeProfileUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: EmployeeProfileUpdateManyWithWhereWithoutManagerInput | EmployeeProfileUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: EmployeeProfileScalarWhereInput | EmployeeProfileScalarWhereInput[]
  }

  export type UserUpdateOneWithoutSubordinatesNestedInput = {
    create?: XOR<UserCreateWithoutSubordinatesInput, UserUncheckedCreateWithoutSubordinatesInput>
    connectOrCreate?: UserCreateOrConnectWithoutSubordinatesInput
    upsert?: UserUpsertWithoutSubordinatesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutSubordinatesInput, UserUpdateWithoutSubordinatesInput>, UserUncheckedUpdateWithoutSubordinatesInput>
  }

  export type UserUpdateManyWithoutManagerNestedInput = {
    create?: XOR<UserCreateWithoutManagerInput, UserUncheckedCreateWithoutManagerInput> | UserCreateWithoutManagerInput[] | UserUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserCreateOrConnectWithoutManagerInput | UserCreateOrConnectWithoutManagerInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutManagerInput | UserUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: UserCreateManyManagerInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutManagerInput | UserUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: UserUpdateManyWithWhereWithoutManagerInput | UserUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type AuditLogUpdateManyWithoutActorNestedInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutActorInput | AuditLogUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutActorInput | AuditLogUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutActorInput | AuditLogUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type PlacementImportBatchUpdateManyWithoutUploaderNestedInput = {
    create?: XOR<PlacementImportBatchCreateWithoutUploaderInput, PlacementImportBatchUncheckedCreateWithoutUploaderInput> | PlacementImportBatchCreateWithoutUploaderInput[] | PlacementImportBatchUncheckedCreateWithoutUploaderInput[]
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutUploaderInput | PlacementImportBatchCreateOrConnectWithoutUploaderInput[]
    upsert?: PlacementImportBatchUpsertWithWhereUniqueWithoutUploaderInput | PlacementImportBatchUpsertWithWhereUniqueWithoutUploaderInput[]
    createMany?: PlacementImportBatchCreateManyUploaderInputEnvelope
    set?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    disconnect?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    delete?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    connect?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    update?: PlacementImportBatchUpdateWithWhereUniqueWithoutUploaderInput | PlacementImportBatchUpdateWithWhereUniqueWithoutUploaderInput[]
    updateMany?: PlacementImportBatchUpdateManyWithWhereWithoutUploaderInput | PlacementImportBatchUpdateManyWithWhereWithoutUploaderInput[]
    deleteMany?: PlacementImportBatchScalarWhereInput | PlacementImportBatchScalarWhereInput[]
  }

  export type PersonalPlacementUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<PersonalPlacementCreateWithoutEmployeeInput, PersonalPlacementUncheckedCreateWithoutEmployeeInput> | PersonalPlacementCreateWithoutEmployeeInput[] | PersonalPlacementUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutEmployeeInput | PersonalPlacementCreateOrConnectWithoutEmployeeInput[]
    upsert?: PersonalPlacementUpsertWithWhereUniqueWithoutEmployeeInput | PersonalPlacementUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: PersonalPlacementCreateManyEmployeeInputEnvelope
    set?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    disconnect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    delete?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    update?: PersonalPlacementUpdateWithWhereUniqueWithoutEmployeeInput | PersonalPlacementUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: PersonalPlacementUpdateManyWithWhereWithoutEmployeeInput | PersonalPlacementUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: PersonalPlacementScalarWhereInput | PersonalPlacementScalarWhereInput[]
  }

  export type TeamPlacementUpdateManyWithoutLeadNestedInput = {
    create?: XOR<TeamPlacementCreateWithoutLeadInput, TeamPlacementUncheckedCreateWithoutLeadInput> | TeamPlacementCreateWithoutLeadInput[] | TeamPlacementUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutLeadInput | TeamPlacementCreateOrConnectWithoutLeadInput[]
    upsert?: TeamPlacementUpsertWithWhereUniqueWithoutLeadInput | TeamPlacementUpsertWithWhereUniqueWithoutLeadInput[]
    createMany?: TeamPlacementCreateManyLeadInputEnvelope
    set?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    disconnect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    delete?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    update?: TeamPlacementUpdateWithWhereUniqueWithoutLeadInput | TeamPlacementUpdateWithWhereUniqueWithoutLeadInput[]
    updateMany?: TeamPlacementUpdateManyWithWhereWithoutLeadInput | TeamPlacementUpdateManyWithWhereWithoutLeadInput[]
    deleteMany?: TeamPlacementScalarWhereInput | TeamPlacementScalarWhereInput[]
  }

  export type PasswordResetTokenUpdateManyWithoutUserNestedInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    upsert?: PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput | PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    set?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    disconnect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    delete?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    update?: PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput | PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PasswordResetTokenUpdateManyWithWhereWithoutUserInput | PasswordResetTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
  }

  export type EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<EmployeeProfileCreateWithoutUserInput, EmployeeProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutUserInput
    upsert?: EmployeeProfileUpsertWithoutUserInput
    disconnect?: EmployeeProfileWhereInput | boolean
    delete?: EmployeeProfileWhereInput | boolean
    connect?: EmployeeProfileWhereUniqueInput
    update?: XOR<XOR<EmployeeProfileUpdateToOneWithWhereWithoutUserInput, EmployeeProfileUpdateWithoutUserInput>, EmployeeProfileUncheckedUpdateWithoutUserInput>
  }

  export type RefreshTokenUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput> | RefreshTokenCreateWithoutUserInput[] | RefreshTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: RefreshTokenCreateOrConnectWithoutUserInput | RefreshTokenCreateOrConnectWithoutUserInput[]
    upsert?: RefreshTokenUpsertWithWhereUniqueWithoutUserInput | RefreshTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: RefreshTokenCreateManyUserInputEnvelope
    set?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    disconnect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    delete?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    connect?: RefreshTokenWhereUniqueInput | RefreshTokenWhereUniqueInput[]
    update?: RefreshTokenUpdateWithWhereUniqueWithoutUserInput | RefreshTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: RefreshTokenUpdateManyWithWhereWithoutUserInput | RefreshTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
  }

  export type EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput = {
    create?: XOR<EmployeeProfileCreateWithoutManagerInput, EmployeeProfileUncheckedCreateWithoutManagerInput> | EmployeeProfileCreateWithoutManagerInput[] | EmployeeProfileUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: EmployeeProfileCreateOrConnectWithoutManagerInput | EmployeeProfileCreateOrConnectWithoutManagerInput[]
    upsert?: EmployeeProfileUpsertWithWhereUniqueWithoutManagerInput | EmployeeProfileUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: EmployeeProfileCreateManyManagerInputEnvelope
    set?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    disconnect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    delete?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    connect?: EmployeeProfileWhereUniqueInput | EmployeeProfileWhereUniqueInput[]
    update?: EmployeeProfileUpdateWithWhereUniqueWithoutManagerInput | EmployeeProfileUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: EmployeeProfileUpdateManyWithWhereWithoutManagerInput | EmployeeProfileUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: EmployeeProfileScalarWhereInput | EmployeeProfileScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutManagerNestedInput = {
    create?: XOR<UserCreateWithoutManagerInput, UserUncheckedCreateWithoutManagerInput> | UserCreateWithoutManagerInput[] | UserUncheckedCreateWithoutManagerInput[]
    connectOrCreate?: UserCreateOrConnectWithoutManagerInput | UserCreateOrConnectWithoutManagerInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutManagerInput | UserUpsertWithWhereUniqueWithoutManagerInput[]
    createMany?: UserCreateManyManagerInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutManagerInput | UserUpdateWithWhereUniqueWithoutManagerInput[]
    updateMany?: UserUpdateManyWithWhereWithoutManagerInput | UserUpdateManyWithWhereWithoutManagerInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutActorNestedInput = {
    create?: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput> | AuditLogCreateWithoutActorInput[] | AuditLogUncheckedCreateWithoutActorInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutActorInput | AuditLogCreateOrConnectWithoutActorInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutActorInput | AuditLogUpsertWithWhereUniqueWithoutActorInput[]
    createMany?: AuditLogCreateManyActorInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutActorInput | AuditLogUpdateWithWhereUniqueWithoutActorInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutActorInput | AuditLogUpdateManyWithWhereWithoutActorInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput = {
    create?: XOR<PlacementImportBatchCreateWithoutUploaderInput, PlacementImportBatchUncheckedCreateWithoutUploaderInput> | PlacementImportBatchCreateWithoutUploaderInput[] | PlacementImportBatchUncheckedCreateWithoutUploaderInput[]
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutUploaderInput | PlacementImportBatchCreateOrConnectWithoutUploaderInput[]
    upsert?: PlacementImportBatchUpsertWithWhereUniqueWithoutUploaderInput | PlacementImportBatchUpsertWithWhereUniqueWithoutUploaderInput[]
    createMany?: PlacementImportBatchCreateManyUploaderInputEnvelope
    set?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    disconnect?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    delete?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    connect?: PlacementImportBatchWhereUniqueInput | PlacementImportBatchWhereUniqueInput[]
    update?: PlacementImportBatchUpdateWithWhereUniqueWithoutUploaderInput | PlacementImportBatchUpdateWithWhereUniqueWithoutUploaderInput[]
    updateMany?: PlacementImportBatchUpdateManyWithWhereWithoutUploaderInput | PlacementImportBatchUpdateManyWithWhereWithoutUploaderInput[]
    deleteMany?: PlacementImportBatchScalarWhereInput | PlacementImportBatchScalarWhereInput[]
  }

  export type PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput = {
    create?: XOR<PersonalPlacementCreateWithoutEmployeeInput, PersonalPlacementUncheckedCreateWithoutEmployeeInput> | PersonalPlacementCreateWithoutEmployeeInput[] | PersonalPlacementUncheckedCreateWithoutEmployeeInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutEmployeeInput | PersonalPlacementCreateOrConnectWithoutEmployeeInput[]
    upsert?: PersonalPlacementUpsertWithWhereUniqueWithoutEmployeeInput | PersonalPlacementUpsertWithWhereUniqueWithoutEmployeeInput[]
    createMany?: PersonalPlacementCreateManyEmployeeInputEnvelope
    set?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    disconnect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    delete?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    update?: PersonalPlacementUpdateWithWhereUniqueWithoutEmployeeInput | PersonalPlacementUpdateWithWhereUniqueWithoutEmployeeInput[]
    updateMany?: PersonalPlacementUpdateManyWithWhereWithoutEmployeeInput | PersonalPlacementUpdateManyWithWhereWithoutEmployeeInput[]
    deleteMany?: PersonalPlacementScalarWhereInput | PersonalPlacementScalarWhereInput[]
  }

  export type TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput = {
    create?: XOR<TeamPlacementCreateWithoutLeadInput, TeamPlacementUncheckedCreateWithoutLeadInput> | TeamPlacementCreateWithoutLeadInput[] | TeamPlacementUncheckedCreateWithoutLeadInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutLeadInput | TeamPlacementCreateOrConnectWithoutLeadInput[]
    upsert?: TeamPlacementUpsertWithWhereUniqueWithoutLeadInput | TeamPlacementUpsertWithWhereUniqueWithoutLeadInput[]
    createMany?: TeamPlacementCreateManyLeadInputEnvelope
    set?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    disconnect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    delete?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    update?: TeamPlacementUpdateWithWhereUniqueWithoutLeadInput | TeamPlacementUpdateWithWhereUniqueWithoutLeadInput[]
    updateMany?: TeamPlacementUpdateManyWithWhereWithoutLeadInput | TeamPlacementUpdateManyWithWhereWithoutLeadInput[]
    deleteMany?: TeamPlacementScalarWhereInput | TeamPlacementScalarWhereInput[]
  }

  export type PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput> | PasswordResetTokenCreateWithoutUserInput[] | PasswordResetTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: PasswordResetTokenCreateOrConnectWithoutUserInput | PasswordResetTokenCreateOrConnectWithoutUserInput[]
    upsert?: PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput | PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: PasswordResetTokenCreateManyUserInputEnvelope
    set?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    disconnect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    delete?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    connect?: PasswordResetTokenWhereUniqueInput | PasswordResetTokenWhereUniqueInput[]
    update?: PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput | PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: PasswordResetTokenUpdateManyWithWhereWithoutUserInput | PasswordResetTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPasswordResetTokensInput = {
    create?: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetTokensInput
    connect?: UserWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutPasswordResetTokensNestedInput = {
    create?: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutPasswordResetTokensInput
    upsert?: UserUpsertWithoutPasswordResetTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPasswordResetTokensInput, UserUpdateWithoutPasswordResetTokensInput>, UserUncheckedUpdateWithoutPasswordResetTokensInput>
  }

  export type UserCreateNestedOneWithoutEmployeeProfileInput = {
    create?: XOR<UserCreateWithoutEmployeeProfileInput, UserUncheckedCreateWithoutEmployeeProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmployeeProfileInput
    connect?: UserWhereUniqueInput
  }

  export type TeamCreateNestedOneWithoutEmployeesInput = {
    create?: XOR<TeamCreateWithoutEmployeesInput, TeamUncheckedCreateWithoutEmployeesInput>
    connectOrCreate?: TeamCreateOrConnectWithoutEmployeesInput
    connect?: TeamWhereUniqueInput
  }

  export type UserCreateNestedOneWithoutLeadEmployeesInput = {
    create?: XOR<UserCreateWithoutLeadEmployeesInput, UserUncheckedCreateWithoutLeadEmployeesInput>
    connectOrCreate?: UserCreateOrConnectWithoutLeadEmployeesInput
    connect?: UserWhereUniqueInput
  }

  export type EnumTargetTypeFieldUpdateOperationsInput = {
    set?: $Enums.TargetType
  }

  export type UserUpdateOneRequiredWithoutEmployeeProfileNestedInput = {
    create?: XOR<UserCreateWithoutEmployeeProfileInput, UserUncheckedCreateWithoutEmployeeProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutEmployeeProfileInput
    upsert?: UserUpsertWithoutEmployeeProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutEmployeeProfileInput, UserUpdateWithoutEmployeeProfileInput>, UserUncheckedUpdateWithoutEmployeeProfileInput>
  }

  export type TeamUpdateOneWithoutEmployeesNestedInput = {
    create?: XOR<TeamCreateWithoutEmployeesInput, TeamUncheckedCreateWithoutEmployeesInput>
    connectOrCreate?: TeamCreateOrConnectWithoutEmployeesInput
    upsert?: TeamUpsertWithoutEmployeesInput
    disconnect?: TeamWhereInput | boolean
    delete?: TeamWhereInput | boolean
    connect?: TeamWhereUniqueInput
    update?: XOR<XOR<TeamUpdateToOneWithWhereWithoutEmployeesInput, TeamUpdateWithoutEmployeesInput>, TeamUncheckedUpdateWithoutEmployeesInput>
  }

  export type UserUpdateOneWithoutLeadEmployeesNestedInput = {
    create?: XOR<UserCreateWithoutLeadEmployeesInput, UserUncheckedCreateWithoutLeadEmployeesInput>
    connectOrCreate?: UserCreateOrConnectWithoutLeadEmployeesInput
    upsert?: UserUpsertWithoutLeadEmployeesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutLeadEmployeesInput, UserUpdateWithoutLeadEmployeesInput>, UserUncheckedUpdateWithoutLeadEmployeesInput>
  }

  export type UserCreateNestedOneWithoutRefreshTokensInput = {
    create?: XOR<UserCreateWithoutRefreshTokensInput, UserUncheckedCreateWithoutRefreshTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutRefreshTokensNestedInput = {
    create?: XOR<UserCreateWithoutRefreshTokensInput, UserUncheckedCreateWithoutRefreshTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutRefreshTokensInput
    upsert?: UserUpsertWithoutRefreshTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRefreshTokensInput, UserUpdateWithoutRefreshTokensInput>, UserUncheckedUpdateWithoutRefreshTokensInput>
  }

  export type UserCreateNestedOneWithoutAuditLogsInput = {
    create?: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutAuditLogsNestedInput = {
    create?: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuditLogsInput
    upsert?: UserUpsertWithoutAuditLogsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAuditLogsInput, UserUpdateWithoutAuditLogsInput>, UserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type UserCreateNestedOneWithoutPlacementImportBatchesInput = {
    create?: XOR<UserCreateWithoutPlacementImportBatchesInput, UserUncheckedCreateWithoutPlacementImportBatchesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPlacementImportBatchesInput
    connect?: UserWhereUniqueInput
  }

  export type PersonalPlacementCreateNestedManyWithoutBatchInput = {
    create?: XOR<PersonalPlacementCreateWithoutBatchInput, PersonalPlacementUncheckedCreateWithoutBatchInput> | PersonalPlacementCreateWithoutBatchInput[] | PersonalPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutBatchInput | PersonalPlacementCreateOrConnectWithoutBatchInput[]
    createMany?: PersonalPlacementCreateManyBatchInputEnvelope
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
  }

  export type TeamPlacementCreateNestedManyWithoutBatchInput = {
    create?: XOR<TeamPlacementCreateWithoutBatchInput, TeamPlacementUncheckedCreateWithoutBatchInput> | TeamPlacementCreateWithoutBatchInput[] | TeamPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutBatchInput | TeamPlacementCreateOrConnectWithoutBatchInput[]
    createMany?: TeamPlacementCreateManyBatchInputEnvelope
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
  }

  export type PersonalPlacementUncheckedCreateNestedManyWithoutBatchInput = {
    create?: XOR<PersonalPlacementCreateWithoutBatchInput, PersonalPlacementUncheckedCreateWithoutBatchInput> | PersonalPlacementCreateWithoutBatchInput[] | PersonalPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutBatchInput | PersonalPlacementCreateOrConnectWithoutBatchInput[]
    createMany?: PersonalPlacementCreateManyBatchInputEnvelope
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
  }

  export type TeamPlacementUncheckedCreateNestedManyWithoutBatchInput = {
    create?: XOR<TeamPlacementCreateWithoutBatchInput, TeamPlacementUncheckedCreateWithoutBatchInput> | TeamPlacementCreateWithoutBatchInput[] | TeamPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutBatchInput | TeamPlacementCreateOrConnectWithoutBatchInput[]
    createMany?: TeamPlacementCreateManyBatchInputEnvelope
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
  }

  export type EnumPlacementImportTypeFieldUpdateOperationsInput = {
    set?: $Enums.PlacementImportType
  }

  export type UserUpdateOneRequiredWithoutPlacementImportBatchesNestedInput = {
    create?: XOR<UserCreateWithoutPlacementImportBatchesInput, UserUncheckedCreateWithoutPlacementImportBatchesInput>
    connectOrCreate?: UserCreateOrConnectWithoutPlacementImportBatchesInput
    upsert?: UserUpsertWithoutPlacementImportBatchesInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPlacementImportBatchesInput, UserUpdateWithoutPlacementImportBatchesInput>, UserUncheckedUpdateWithoutPlacementImportBatchesInput>
  }

  export type PersonalPlacementUpdateManyWithoutBatchNestedInput = {
    create?: XOR<PersonalPlacementCreateWithoutBatchInput, PersonalPlacementUncheckedCreateWithoutBatchInput> | PersonalPlacementCreateWithoutBatchInput[] | PersonalPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutBatchInput | PersonalPlacementCreateOrConnectWithoutBatchInput[]
    upsert?: PersonalPlacementUpsertWithWhereUniqueWithoutBatchInput | PersonalPlacementUpsertWithWhereUniqueWithoutBatchInput[]
    createMany?: PersonalPlacementCreateManyBatchInputEnvelope
    set?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    disconnect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    delete?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    update?: PersonalPlacementUpdateWithWhereUniqueWithoutBatchInput | PersonalPlacementUpdateWithWhereUniqueWithoutBatchInput[]
    updateMany?: PersonalPlacementUpdateManyWithWhereWithoutBatchInput | PersonalPlacementUpdateManyWithWhereWithoutBatchInput[]
    deleteMany?: PersonalPlacementScalarWhereInput | PersonalPlacementScalarWhereInput[]
  }

  export type TeamPlacementUpdateManyWithoutBatchNestedInput = {
    create?: XOR<TeamPlacementCreateWithoutBatchInput, TeamPlacementUncheckedCreateWithoutBatchInput> | TeamPlacementCreateWithoutBatchInput[] | TeamPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutBatchInput | TeamPlacementCreateOrConnectWithoutBatchInput[]
    upsert?: TeamPlacementUpsertWithWhereUniqueWithoutBatchInput | TeamPlacementUpsertWithWhereUniqueWithoutBatchInput[]
    createMany?: TeamPlacementCreateManyBatchInputEnvelope
    set?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    disconnect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    delete?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    update?: TeamPlacementUpdateWithWhereUniqueWithoutBatchInput | TeamPlacementUpdateWithWhereUniqueWithoutBatchInput[]
    updateMany?: TeamPlacementUpdateManyWithWhereWithoutBatchInput | TeamPlacementUpdateManyWithWhereWithoutBatchInput[]
    deleteMany?: TeamPlacementScalarWhereInput | TeamPlacementScalarWhereInput[]
  }

  export type PersonalPlacementUncheckedUpdateManyWithoutBatchNestedInput = {
    create?: XOR<PersonalPlacementCreateWithoutBatchInput, PersonalPlacementUncheckedCreateWithoutBatchInput> | PersonalPlacementCreateWithoutBatchInput[] | PersonalPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: PersonalPlacementCreateOrConnectWithoutBatchInput | PersonalPlacementCreateOrConnectWithoutBatchInput[]
    upsert?: PersonalPlacementUpsertWithWhereUniqueWithoutBatchInput | PersonalPlacementUpsertWithWhereUniqueWithoutBatchInput[]
    createMany?: PersonalPlacementCreateManyBatchInputEnvelope
    set?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    disconnect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    delete?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    connect?: PersonalPlacementWhereUniqueInput | PersonalPlacementWhereUniqueInput[]
    update?: PersonalPlacementUpdateWithWhereUniqueWithoutBatchInput | PersonalPlacementUpdateWithWhereUniqueWithoutBatchInput[]
    updateMany?: PersonalPlacementUpdateManyWithWhereWithoutBatchInput | PersonalPlacementUpdateManyWithWhereWithoutBatchInput[]
    deleteMany?: PersonalPlacementScalarWhereInput | PersonalPlacementScalarWhereInput[]
  }

  export type TeamPlacementUncheckedUpdateManyWithoutBatchNestedInput = {
    create?: XOR<TeamPlacementCreateWithoutBatchInput, TeamPlacementUncheckedCreateWithoutBatchInput> | TeamPlacementCreateWithoutBatchInput[] | TeamPlacementUncheckedCreateWithoutBatchInput[]
    connectOrCreate?: TeamPlacementCreateOrConnectWithoutBatchInput | TeamPlacementCreateOrConnectWithoutBatchInput[]
    upsert?: TeamPlacementUpsertWithWhereUniqueWithoutBatchInput | TeamPlacementUpsertWithWhereUniqueWithoutBatchInput[]
    createMany?: TeamPlacementCreateManyBatchInputEnvelope
    set?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    disconnect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    delete?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    connect?: TeamPlacementWhereUniqueInput | TeamPlacementWhereUniqueInput[]
    update?: TeamPlacementUpdateWithWhereUniqueWithoutBatchInput | TeamPlacementUpdateWithWhereUniqueWithoutBatchInput[]
    updateMany?: TeamPlacementUpdateManyWithWhereWithoutBatchInput | TeamPlacementUpdateManyWithWhereWithoutBatchInput[]
    deleteMany?: TeamPlacementScalarWhereInput | TeamPlacementScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutPersonalPlacementsInput = {
    create?: XOR<UserCreateWithoutPersonalPlacementsInput, UserUncheckedCreateWithoutPersonalPlacementsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPersonalPlacementsInput
    connect?: UserWhereUniqueInput
  }

  export type PlacementImportBatchCreateNestedOneWithoutPersonalPlacementsInput = {
    create?: XOR<PlacementImportBatchCreateWithoutPersonalPlacementsInput, PlacementImportBatchUncheckedCreateWithoutPersonalPlacementsInput>
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutPersonalPlacementsInput
    connect?: PlacementImportBatchWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UserUpdateOneRequiredWithoutPersonalPlacementsNestedInput = {
    create?: XOR<UserCreateWithoutPersonalPlacementsInput, UserUncheckedCreateWithoutPersonalPlacementsInput>
    connectOrCreate?: UserCreateOrConnectWithoutPersonalPlacementsInput
    upsert?: UserUpsertWithoutPersonalPlacementsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutPersonalPlacementsInput, UserUpdateWithoutPersonalPlacementsInput>, UserUncheckedUpdateWithoutPersonalPlacementsInput>
  }

  export type PlacementImportBatchUpdateOneWithoutPersonalPlacementsNestedInput = {
    create?: XOR<PlacementImportBatchCreateWithoutPersonalPlacementsInput, PlacementImportBatchUncheckedCreateWithoutPersonalPlacementsInput>
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutPersonalPlacementsInput
    upsert?: PlacementImportBatchUpsertWithoutPersonalPlacementsInput
    disconnect?: PlacementImportBatchWhereInput | boolean
    delete?: PlacementImportBatchWhereInput | boolean
    connect?: PlacementImportBatchWhereUniqueInput
    update?: XOR<XOR<PlacementImportBatchUpdateToOneWithWhereWithoutPersonalPlacementsInput, PlacementImportBatchUpdateWithoutPersonalPlacementsInput>, PlacementImportBatchUncheckedUpdateWithoutPersonalPlacementsInput>
  }

  export type UserCreateNestedOneWithoutTeamPlacementsInput = {
    create?: XOR<UserCreateWithoutTeamPlacementsInput, UserUncheckedCreateWithoutTeamPlacementsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTeamPlacementsInput
    connect?: UserWhereUniqueInput
  }

  export type PlacementImportBatchCreateNestedOneWithoutTeamPlacementsInput = {
    create?: XOR<PlacementImportBatchCreateWithoutTeamPlacementsInput, PlacementImportBatchUncheckedCreateWithoutTeamPlacementsInput>
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutTeamPlacementsInput
    connect?: PlacementImportBatchWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutTeamPlacementsNestedInput = {
    create?: XOR<UserCreateWithoutTeamPlacementsInput, UserUncheckedCreateWithoutTeamPlacementsInput>
    connectOrCreate?: UserCreateOrConnectWithoutTeamPlacementsInput
    upsert?: UserUpsertWithoutTeamPlacementsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutTeamPlacementsInput, UserUpdateWithoutTeamPlacementsInput>, UserUncheckedUpdateWithoutTeamPlacementsInput>
  }

  export type PlacementImportBatchUpdateOneWithoutTeamPlacementsNestedInput = {
    create?: XOR<PlacementImportBatchCreateWithoutTeamPlacementsInput, PlacementImportBatchUncheckedCreateWithoutTeamPlacementsInput>
    connectOrCreate?: PlacementImportBatchCreateOrConnectWithoutTeamPlacementsInput
    upsert?: PlacementImportBatchUpsertWithoutTeamPlacementsInput
    disconnect?: PlacementImportBatchWhereInput | boolean
    delete?: PlacementImportBatchWhereInput | boolean
    connect?: PlacementImportBatchWhereUniqueInput
    update?: XOR<XOR<PlacementImportBatchUpdateToOneWithWhereWithoutTeamPlacementsInput, PlacementImportBatchUpdateWithoutTeamPlacementsInput>, PlacementImportBatchUncheckedUpdateWithoutTeamPlacementsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumTargetTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TargetType | EnumTargetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTargetTypeFilter<$PrismaModel> | $Enums.TargetType
  }

  export type NestedEnumTargetTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TargetType | EnumTargetTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TargetType[] | ListEnumTargetTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTargetTypeWithAggregatesFilter<$PrismaModel> | $Enums.TargetType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTargetTypeFilter<$PrismaModel>
    _max?: NestedEnumTargetTypeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumPlacementImportTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PlacementImportType | EnumPlacementImportTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlacementImportTypeFilter<$PrismaModel> | $Enums.PlacementImportType
  }

  export type NestedEnumPlacementImportTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PlacementImportType | EnumPlacementImportTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PlacementImportType[] | ListEnumPlacementImportTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPlacementImportTypeWithAggregatesFilter<$PrismaModel> | $Enums.PlacementImportType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlacementImportTypeFilter<$PrismaModel>
    _max?: NestedEnumPlacementImportTypeFilter<$PrismaModel>
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type EmployeeProfileCreateWithoutTeamInput = {
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutEmployeeProfileInput
    manager?: UserCreateNestedOneWithoutLeadEmployeesInput
  }

  export type EmployeeProfileUncheckedCreateWithoutTeamInput = {
    id: string
    managerId?: string | null
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmployeeProfileCreateOrConnectWithoutTeamInput = {
    where: EmployeeProfileWhereUniqueInput
    create: XOR<EmployeeProfileCreateWithoutTeamInput, EmployeeProfileUncheckedCreateWithoutTeamInput>
  }

  export type EmployeeProfileCreateManyTeamInputEnvelope = {
    data: EmployeeProfileCreateManyTeamInput | EmployeeProfileCreateManyTeamInput[]
    skipDuplicates?: boolean
  }

  export type EmployeeProfileUpsertWithWhereUniqueWithoutTeamInput = {
    where: EmployeeProfileWhereUniqueInput
    update: XOR<EmployeeProfileUpdateWithoutTeamInput, EmployeeProfileUncheckedUpdateWithoutTeamInput>
    create: XOR<EmployeeProfileCreateWithoutTeamInput, EmployeeProfileUncheckedCreateWithoutTeamInput>
  }

  export type EmployeeProfileUpdateWithWhereUniqueWithoutTeamInput = {
    where: EmployeeProfileWhereUniqueInput
    data: XOR<EmployeeProfileUpdateWithoutTeamInput, EmployeeProfileUncheckedUpdateWithoutTeamInput>
  }

  export type EmployeeProfileUpdateManyWithWhereWithoutTeamInput = {
    where: EmployeeProfileScalarWhereInput
    data: XOR<EmployeeProfileUpdateManyMutationInput, EmployeeProfileUncheckedUpdateManyWithoutTeamInput>
  }

  export type EmployeeProfileScalarWhereInput = {
    AND?: EmployeeProfileScalarWhereInput | EmployeeProfileScalarWhereInput[]
    OR?: EmployeeProfileScalarWhereInput[]
    NOT?: EmployeeProfileScalarWhereInput | EmployeeProfileScalarWhereInput[]
    id?: StringFilter<"EmployeeProfile"> | string
    teamId?: StringNullableFilter<"EmployeeProfile"> | string | null
    managerId?: StringNullableFilter<"EmployeeProfile"> | string | null
    level?: StringNullableFilter<"EmployeeProfile"> | string | null
    vbid?: StringNullableFilter<"EmployeeProfile"> | string | null
    comment?: StringNullableFilter<"EmployeeProfile"> | string | null
    targetType?: EnumTargetTypeFilter<"EmployeeProfile"> | $Enums.TargetType
    isActive?: BoolFilter<"EmployeeProfile"> | boolean
    deletedAt?: DateTimeNullableFilter<"EmployeeProfile"> | Date | string | null
    createdAt?: DateTimeFilter<"EmployeeProfile"> | Date | string
    updatedAt?: DateTimeFilter<"EmployeeProfile"> | Date | string
  }

  export type EmployeeProfileCreateWithoutUserInput = {
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    team?: TeamCreateNestedOneWithoutEmployeesInput
    manager?: UserCreateNestedOneWithoutLeadEmployeesInput
  }

  export type EmployeeProfileUncheckedCreateWithoutUserInput = {
    teamId?: string | null
    managerId?: string | null
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmployeeProfileCreateOrConnectWithoutUserInput = {
    where: EmployeeProfileWhereUniqueInput
    create: XOR<EmployeeProfileCreateWithoutUserInput, EmployeeProfileUncheckedCreateWithoutUserInput>
  }

  export type RefreshTokenCreateWithoutUserInput = {
    id?: string
    token: string
    isRevoked?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type RefreshTokenUncheckedCreateWithoutUserInput = {
    id?: string
    token: string
    isRevoked?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type RefreshTokenCreateOrConnectWithoutUserInput = {
    where: RefreshTokenWhereUniqueInput
    create: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput>
  }

  export type RefreshTokenCreateManyUserInputEnvelope = {
    data: RefreshTokenCreateManyUserInput | RefreshTokenCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type EmployeeProfileCreateWithoutManagerInput = {
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutEmployeeProfileInput
    team?: TeamCreateNestedOneWithoutEmployeesInput
  }

  export type EmployeeProfileUncheckedCreateWithoutManagerInput = {
    id: string
    teamId?: string | null
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmployeeProfileCreateOrConnectWithoutManagerInput = {
    where: EmployeeProfileWhereUniqueInput
    create: XOR<EmployeeProfileCreateWithoutManagerInput, EmployeeProfileUncheckedCreateWithoutManagerInput>
  }

  export type EmployeeProfileCreateManyManagerInputEnvelope = {
    data: EmployeeProfileCreateManyManagerInput | EmployeeProfileCreateManyManagerInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutSubordinatesInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutSubordinatesInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutSubordinatesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutSubordinatesInput, UserUncheckedCreateWithoutSubordinatesInput>
  }

  export type UserCreateWithoutManagerInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutManagerInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutManagerInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutManagerInput, UserUncheckedCreateWithoutManagerInput>
  }

  export type UserCreateManyManagerInputEnvelope = {
    data: UserCreateManyManagerInput | UserCreateManyManagerInput[]
    skipDuplicates?: boolean
  }

  export type AuditLogCreateWithoutActorInput = {
    id?: string
    action: string
    module?: string | null
    entityType?: string | null
    entityId?: string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    ipAddress?: string | null
    userAgent?: string | null
    geoLocation?: string | null
    createdAt?: Date | string
    isTampered?: boolean
    hash?: string | null
  }

  export type AuditLogUncheckedCreateWithoutActorInput = {
    id?: string
    action: string
    module?: string | null
    entityType?: string | null
    entityId?: string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    ipAddress?: string | null
    userAgent?: string | null
    geoLocation?: string | null
    createdAt?: Date | string
    isTampered?: boolean
    hash?: string | null
  }

  export type AuditLogCreateOrConnectWithoutActorInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput>
  }

  export type AuditLogCreateManyActorInputEnvelope = {
    data: AuditLogCreateManyActorInput | AuditLogCreateManyActorInput[]
    skipDuplicates?: boolean
  }

  export type PlacementImportBatchCreateWithoutUploaderInput = {
    id?: string
    type: $Enums.PlacementImportType
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutBatchInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchUncheckedCreateWithoutUploaderInput = {
    id?: string
    type: $Enums.PlacementImportType
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutBatchInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchCreateOrConnectWithoutUploaderInput = {
    where: PlacementImportBatchWhereUniqueInput
    create: XOR<PlacementImportBatchCreateWithoutUploaderInput, PlacementImportBatchUncheckedCreateWithoutUploaderInput>
  }

  export type PlacementImportBatchCreateManyUploaderInputEnvelope = {
    data: PlacementImportBatchCreateManyUploaderInput | PlacementImportBatchCreateManyUploaderInput[]
    skipDuplicates?: boolean
  }

  export type PersonalPlacementCreateWithoutEmployeeInput = {
    id?: string
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    batch?: PlacementImportBatchCreateNestedOneWithoutPersonalPlacementsInput
  }

  export type PersonalPlacementUncheckedCreateWithoutEmployeeInput = {
    id?: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type PersonalPlacementCreateOrConnectWithoutEmployeeInput = {
    where: PersonalPlacementWhereUniqueInput
    create: XOR<PersonalPlacementCreateWithoutEmployeeInput, PersonalPlacementUncheckedCreateWithoutEmployeeInput>
  }

  export type PersonalPlacementCreateManyEmployeeInputEnvelope = {
    data: PersonalPlacementCreateManyEmployeeInput | PersonalPlacementCreateManyEmployeeInput[]
    skipDuplicates?: boolean
  }

  export type TeamPlacementCreateWithoutLeadInput = {
    id?: string
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    batch?: PlacementImportBatchCreateNestedOneWithoutTeamPlacementsInput
  }

  export type TeamPlacementUncheckedCreateWithoutLeadInput = {
    id?: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type TeamPlacementCreateOrConnectWithoutLeadInput = {
    where: TeamPlacementWhereUniqueInput
    create: XOR<TeamPlacementCreateWithoutLeadInput, TeamPlacementUncheckedCreateWithoutLeadInput>
  }

  export type TeamPlacementCreateManyLeadInputEnvelope = {
    data: TeamPlacementCreateManyLeadInput | TeamPlacementCreateManyLeadInput[]
    skipDuplicates?: boolean
  }

  export type PasswordResetTokenCreateWithoutUserInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetTokenUncheckedCreateWithoutUserInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type PasswordResetTokenCreateOrConnectWithoutUserInput = {
    where: PasswordResetTokenWhereUniqueInput
    create: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput>
  }

  export type PasswordResetTokenCreateManyUserInputEnvelope = {
    data: PasswordResetTokenCreateManyUserInput | PasswordResetTokenCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type EmployeeProfileUpsertWithoutUserInput = {
    update: XOR<EmployeeProfileUpdateWithoutUserInput, EmployeeProfileUncheckedUpdateWithoutUserInput>
    create: XOR<EmployeeProfileCreateWithoutUserInput, EmployeeProfileUncheckedCreateWithoutUserInput>
    where?: EmployeeProfileWhereInput
  }

  export type EmployeeProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: EmployeeProfileWhereInput
    data: XOR<EmployeeProfileUpdateWithoutUserInput, EmployeeProfileUncheckedUpdateWithoutUserInput>
  }

  export type EmployeeProfileUpdateWithoutUserInput = {
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team?: TeamUpdateOneWithoutEmployeesNestedInput
    manager?: UserUpdateOneWithoutLeadEmployeesNestedInput
  }

  export type EmployeeProfileUncheckedUpdateWithoutUserInput = {
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenUpsertWithWhereUniqueWithoutUserInput = {
    where: RefreshTokenWhereUniqueInput
    update: XOR<RefreshTokenUpdateWithoutUserInput, RefreshTokenUncheckedUpdateWithoutUserInput>
    create: XOR<RefreshTokenCreateWithoutUserInput, RefreshTokenUncheckedCreateWithoutUserInput>
  }

  export type RefreshTokenUpdateWithWhereUniqueWithoutUserInput = {
    where: RefreshTokenWhereUniqueInput
    data: XOR<RefreshTokenUpdateWithoutUserInput, RefreshTokenUncheckedUpdateWithoutUserInput>
  }

  export type RefreshTokenUpdateManyWithWhereWithoutUserInput = {
    where: RefreshTokenScalarWhereInput
    data: XOR<RefreshTokenUpdateManyMutationInput, RefreshTokenUncheckedUpdateManyWithoutUserInput>
  }

  export type RefreshTokenScalarWhereInput = {
    AND?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
    OR?: RefreshTokenScalarWhereInput[]
    NOT?: RefreshTokenScalarWhereInput | RefreshTokenScalarWhereInput[]
    id?: StringFilter<"RefreshToken"> | string
    token?: StringFilter<"RefreshToken"> | string
    userId?: StringFilter<"RefreshToken"> | string
    isRevoked?: BoolFilter<"RefreshToken"> | boolean
    expiresAt?: DateTimeFilter<"RefreshToken"> | Date | string
    createdAt?: DateTimeFilter<"RefreshToken"> | Date | string
  }

  export type EmployeeProfileUpsertWithWhereUniqueWithoutManagerInput = {
    where: EmployeeProfileWhereUniqueInput
    update: XOR<EmployeeProfileUpdateWithoutManagerInput, EmployeeProfileUncheckedUpdateWithoutManagerInput>
    create: XOR<EmployeeProfileCreateWithoutManagerInput, EmployeeProfileUncheckedCreateWithoutManagerInput>
  }

  export type EmployeeProfileUpdateWithWhereUniqueWithoutManagerInput = {
    where: EmployeeProfileWhereUniqueInput
    data: XOR<EmployeeProfileUpdateWithoutManagerInput, EmployeeProfileUncheckedUpdateWithoutManagerInput>
  }

  export type EmployeeProfileUpdateManyWithWhereWithoutManagerInput = {
    where: EmployeeProfileScalarWhereInput
    data: XOR<EmployeeProfileUpdateManyMutationInput, EmployeeProfileUncheckedUpdateManyWithoutManagerInput>
  }

  export type UserUpsertWithoutSubordinatesInput = {
    update: XOR<UserUpdateWithoutSubordinatesInput, UserUncheckedUpdateWithoutSubordinatesInput>
    create: XOR<UserCreateWithoutSubordinatesInput, UserUncheckedCreateWithoutSubordinatesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutSubordinatesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutSubordinatesInput, UserUncheckedUpdateWithoutSubordinatesInput>
  }

  export type UserUpdateWithoutSubordinatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutSubordinatesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUpsertWithWhereUniqueWithoutManagerInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutManagerInput, UserUncheckedUpdateWithoutManagerInput>
    create: XOR<UserCreateWithoutManagerInput, UserUncheckedCreateWithoutManagerInput>
  }

  export type UserUpdateWithWhereUniqueWithoutManagerInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutManagerInput, UserUncheckedUpdateWithoutManagerInput>
  }

  export type UserUpdateManyWithWhereWithoutManagerInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutManagerInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    passwordHash?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    vbid?: StringNullableFilter<"User"> | string | null
    role?: EnumRoleFilter<"User"> | $Enums.Role
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    mfaSecret?: StringNullableFilter<"User"> | string | null
    mfaEnabled?: BoolFilter<"User"> | boolean
    managerId?: StringNullableFilter<"User"> | string | null
  }

  export type AuditLogUpsertWithWhereUniqueWithoutActorInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutActorInput, AuditLogUncheckedUpdateWithoutActorInput>
    create: XOR<AuditLogCreateWithoutActorInput, AuditLogUncheckedCreateWithoutActorInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutActorInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutActorInput, AuditLogUncheckedUpdateWithoutActorInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutActorInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutActorInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    actorId?: StringNullableFilter<"AuditLog"> | string | null
    action?: StringFilter<"AuditLog"> | string
    module?: StringNullableFilter<"AuditLog"> | string | null
    entityType?: StringNullableFilter<"AuditLog"> | string | null
    entityId?: StringNullableFilter<"AuditLog"> | string | null
    changes?: JsonNullableFilter<"AuditLog">
    status?: StringFilter<"AuditLog"> | string
    ipAddress?: StringNullableFilter<"AuditLog"> | string | null
    userAgent?: StringNullableFilter<"AuditLog"> | string | null
    geoLocation?: StringNullableFilter<"AuditLog"> | string | null
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    isTampered?: BoolFilter<"AuditLog"> | boolean
    hash?: StringNullableFilter<"AuditLog"> | string | null
  }

  export type PlacementImportBatchUpsertWithWhereUniqueWithoutUploaderInput = {
    where: PlacementImportBatchWhereUniqueInput
    update: XOR<PlacementImportBatchUpdateWithoutUploaderInput, PlacementImportBatchUncheckedUpdateWithoutUploaderInput>
    create: XOR<PlacementImportBatchCreateWithoutUploaderInput, PlacementImportBatchUncheckedCreateWithoutUploaderInput>
  }

  export type PlacementImportBatchUpdateWithWhereUniqueWithoutUploaderInput = {
    where: PlacementImportBatchWhereUniqueInput
    data: XOR<PlacementImportBatchUpdateWithoutUploaderInput, PlacementImportBatchUncheckedUpdateWithoutUploaderInput>
  }

  export type PlacementImportBatchUpdateManyWithWhereWithoutUploaderInput = {
    where: PlacementImportBatchScalarWhereInput
    data: XOR<PlacementImportBatchUpdateManyMutationInput, PlacementImportBatchUncheckedUpdateManyWithoutUploaderInput>
  }

  export type PlacementImportBatchScalarWhereInput = {
    AND?: PlacementImportBatchScalarWhereInput | PlacementImportBatchScalarWhereInput[]
    OR?: PlacementImportBatchScalarWhereInput[]
    NOT?: PlacementImportBatchScalarWhereInput | PlacementImportBatchScalarWhereInput[]
    id?: StringFilter<"PlacementImportBatch"> | string
    type?: EnumPlacementImportTypeFilter<"PlacementImportBatch"> | $Enums.PlacementImportType
    uploaderId?: StringFilter<"PlacementImportBatch"> | string
    createdAt?: DateTimeFilter<"PlacementImportBatch"> | Date | string
    errors?: JsonNullableFilter<"PlacementImportBatch">
  }

  export type PersonalPlacementUpsertWithWhereUniqueWithoutEmployeeInput = {
    where: PersonalPlacementWhereUniqueInput
    update: XOR<PersonalPlacementUpdateWithoutEmployeeInput, PersonalPlacementUncheckedUpdateWithoutEmployeeInput>
    create: XOR<PersonalPlacementCreateWithoutEmployeeInput, PersonalPlacementUncheckedCreateWithoutEmployeeInput>
  }

  export type PersonalPlacementUpdateWithWhereUniqueWithoutEmployeeInput = {
    where: PersonalPlacementWhereUniqueInput
    data: XOR<PersonalPlacementUpdateWithoutEmployeeInput, PersonalPlacementUncheckedUpdateWithoutEmployeeInput>
  }

  export type PersonalPlacementUpdateManyWithWhereWithoutEmployeeInput = {
    where: PersonalPlacementScalarWhereInput
    data: XOR<PersonalPlacementUpdateManyMutationInput, PersonalPlacementUncheckedUpdateManyWithoutEmployeeInput>
  }

  export type PersonalPlacementScalarWhereInput = {
    AND?: PersonalPlacementScalarWhereInput | PersonalPlacementScalarWhereInput[]
    OR?: PersonalPlacementScalarWhereInput[]
    NOT?: PersonalPlacementScalarWhereInput | PersonalPlacementScalarWhereInput[]
    id?: StringFilter<"PersonalPlacement"> | string
    employeeId?: StringFilter<"PersonalPlacement"> | string
    batchId?: StringNullableFilter<"PersonalPlacement"> | string | null
    level?: StringNullableFilter<"PersonalPlacement"> | string | null
    candidateName?: StringFilter<"PersonalPlacement"> | string
    placementYear?: IntNullableFilter<"PersonalPlacement"> | number | null
    doj?: DateTimeFilter<"PersonalPlacement"> | Date | string
    doq?: DateTimeNullableFilter<"PersonalPlacement"> | Date | string | null
    client?: StringFilter<"PersonalPlacement"> | string
    plcId?: StringFilter<"PersonalPlacement"> | string
    placementType?: StringFilter<"PersonalPlacement"> | string
    billingStatus?: StringFilter<"PersonalPlacement"> | string
    collectionStatus?: StringNullableFilter<"PersonalPlacement"> | string | null
    totalBilledHours?: IntNullableFilter<"PersonalPlacement"> | number | null
    revenueUsd?: DecimalFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableFilter<"PersonalPlacement"> | string | null
    recruiterName?: StringNullableFilter<"PersonalPlacement"> | string | null
    teamLeadName?: StringNullableFilter<"PersonalPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableFilter<"PersonalPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableFilter<"PersonalPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"PersonalPlacement"> | Date | string
  }

  export type TeamPlacementUpsertWithWhereUniqueWithoutLeadInput = {
    where: TeamPlacementWhereUniqueInput
    update: XOR<TeamPlacementUpdateWithoutLeadInput, TeamPlacementUncheckedUpdateWithoutLeadInput>
    create: XOR<TeamPlacementCreateWithoutLeadInput, TeamPlacementUncheckedCreateWithoutLeadInput>
  }

  export type TeamPlacementUpdateWithWhereUniqueWithoutLeadInput = {
    where: TeamPlacementWhereUniqueInput
    data: XOR<TeamPlacementUpdateWithoutLeadInput, TeamPlacementUncheckedUpdateWithoutLeadInput>
  }

  export type TeamPlacementUpdateManyWithWhereWithoutLeadInput = {
    where: TeamPlacementScalarWhereInput
    data: XOR<TeamPlacementUpdateManyMutationInput, TeamPlacementUncheckedUpdateManyWithoutLeadInput>
  }

  export type TeamPlacementScalarWhereInput = {
    AND?: TeamPlacementScalarWhereInput | TeamPlacementScalarWhereInput[]
    OR?: TeamPlacementScalarWhereInput[]
    NOT?: TeamPlacementScalarWhereInput | TeamPlacementScalarWhereInput[]
    id?: StringFilter<"TeamPlacement"> | string
    leadId?: StringFilter<"TeamPlacement"> | string
    batchId?: StringNullableFilter<"TeamPlacement"> | string | null
    level?: StringNullableFilter<"TeamPlacement"> | string | null
    candidateName?: StringFilter<"TeamPlacement"> | string
    recruiterName?: StringNullableFilter<"TeamPlacement"> | string | null
    leadName?: StringNullableFilter<"TeamPlacement"> | string | null
    splitWith?: StringNullableFilter<"TeamPlacement"> | string | null
    placementYear?: IntNullableFilter<"TeamPlacement"> | number | null
    doj?: DateTimeFilter<"TeamPlacement"> | Date | string
    doq?: DateTimeNullableFilter<"TeamPlacement"> | Date | string | null
    client?: StringFilter<"TeamPlacement"> | string
    plcId?: StringFilter<"TeamPlacement"> | string
    placementType?: StringFilter<"TeamPlacement"> | string
    billingStatus?: StringFilter<"TeamPlacement"> | string
    collectionStatus?: StringNullableFilter<"TeamPlacement"> | string | null
    totalBilledHours?: IntNullableFilter<"TeamPlacement"> | number | null
    revenueLeadUsd?: DecimalFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    vbCode?: StringNullableFilter<"TeamPlacement"> | string | null
    yearlyPlacementTarget?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementDone?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueAch?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    slabQualified?: StringNullableFilter<"TeamPlacement"> | string | null
    totalIncentiveInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: DecimalNullableFilter<"TeamPlacement"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"TeamPlacement"> | Date | string
  }

  export type PasswordResetTokenUpsertWithWhereUniqueWithoutUserInput = {
    where: PasswordResetTokenWhereUniqueInput
    update: XOR<PasswordResetTokenUpdateWithoutUserInput, PasswordResetTokenUncheckedUpdateWithoutUserInput>
    create: XOR<PasswordResetTokenCreateWithoutUserInput, PasswordResetTokenUncheckedCreateWithoutUserInput>
  }

  export type PasswordResetTokenUpdateWithWhereUniqueWithoutUserInput = {
    where: PasswordResetTokenWhereUniqueInput
    data: XOR<PasswordResetTokenUpdateWithoutUserInput, PasswordResetTokenUncheckedUpdateWithoutUserInput>
  }

  export type PasswordResetTokenUpdateManyWithWhereWithoutUserInput = {
    where: PasswordResetTokenScalarWhereInput
    data: XOR<PasswordResetTokenUpdateManyMutationInput, PasswordResetTokenUncheckedUpdateManyWithoutUserInput>
  }

  export type PasswordResetTokenScalarWhereInput = {
    AND?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
    OR?: PasswordResetTokenScalarWhereInput[]
    NOT?: PasswordResetTokenScalarWhereInput | PasswordResetTokenScalarWhereInput[]
    id?: StringFilter<"PasswordResetToken"> | string
    userId?: StringFilter<"PasswordResetToken"> | string
    tokenHash?: StringFilter<"PasswordResetToken"> | string
    expiresAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
    usedAt?: DateTimeNullableFilter<"PasswordResetToken"> | Date | string | null
    createdAt?: DateTimeFilter<"PasswordResetToken"> | Date | string
  }

  export type UserCreateWithoutPasswordResetTokensInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
  }

  export type UserUncheckedCreateWithoutPasswordResetTokensInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
  }

  export type UserCreateOrConnectWithoutPasswordResetTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
  }

  export type UserUpsertWithoutPasswordResetTokensInput = {
    update: XOR<UserUpdateWithoutPasswordResetTokensInput, UserUncheckedUpdateWithoutPasswordResetTokensInput>
    create: XOR<UserCreateWithoutPasswordResetTokensInput, UserUncheckedCreateWithoutPasswordResetTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPasswordResetTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPasswordResetTokensInput, UserUncheckedUpdateWithoutPasswordResetTokensInput>
  }

  export type UserUpdateWithoutPasswordResetTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
  }

  export type UserUncheckedUpdateWithoutPasswordResetTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
  }

  export type UserCreateWithoutEmployeeProfileInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutEmployeeProfileInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutEmployeeProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutEmployeeProfileInput, UserUncheckedCreateWithoutEmployeeProfileInput>
  }

  export type TeamCreateWithoutEmployeesInput = {
    id?: string
    name: string
    color?: string | null
    yearlyTarget: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TeamUncheckedCreateWithoutEmployeesInput = {
    id?: string
    name: string
    color?: string | null
    yearlyTarget: Decimal | DecimalJsLike | number | string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TeamCreateOrConnectWithoutEmployeesInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutEmployeesInput, TeamUncheckedCreateWithoutEmployeesInput>
  }

  export type UserCreateWithoutLeadEmployeesInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutLeadEmployeesInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutLeadEmployeesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutLeadEmployeesInput, UserUncheckedCreateWithoutLeadEmployeesInput>
  }

  export type UserUpsertWithoutEmployeeProfileInput = {
    update: XOR<UserUpdateWithoutEmployeeProfileInput, UserUncheckedUpdateWithoutEmployeeProfileInput>
    create: XOR<UserCreateWithoutEmployeeProfileInput, UserUncheckedCreateWithoutEmployeeProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutEmployeeProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutEmployeeProfileInput, UserUncheckedUpdateWithoutEmployeeProfileInput>
  }

  export type UserUpdateWithoutEmployeeProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutEmployeeProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type TeamUpsertWithoutEmployeesInput = {
    update: XOR<TeamUpdateWithoutEmployeesInput, TeamUncheckedUpdateWithoutEmployeesInput>
    create: XOR<TeamCreateWithoutEmployeesInput, TeamUncheckedCreateWithoutEmployeesInput>
    where?: TeamWhereInput
  }

  export type TeamUpdateToOneWithWhereWithoutEmployeesInput = {
    where?: TeamWhereInput
    data: XOR<TeamUpdateWithoutEmployeesInput, TeamUncheckedUpdateWithoutEmployeesInput>
  }

  export type TeamUpdateWithoutEmployeesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyTarget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamUncheckedUpdateWithoutEmployeesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    color?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyTarget?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpsertWithoutLeadEmployeesInput = {
    update: XOR<UserUpdateWithoutLeadEmployeesInput, UserUncheckedUpdateWithoutLeadEmployeesInput>
    create: XOR<UserCreateWithoutLeadEmployeesInput, UserUncheckedCreateWithoutLeadEmployeesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutLeadEmployeesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutLeadEmployeesInput, UserUncheckedUpdateWithoutLeadEmployeesInput>
  }

  export type UserUpdateWithoutLeadEmployeesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutLeadEmployeesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutRefreshTokensInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutRefreshTokensInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRefreshTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRefreshTokensInput, UserUncheckedCreateWithoutRefreshTokensInput>
  }

  export type UserUpsertWithoutRefreshTokensInput = {
    update: XOR<UserUpdateWithoutRefreshTokensInput, UserUncheckedUpdateWithoutRefreshTokensInput>
    create: XOR<UserCreateWithoutRefreshTokensInput, UserUncheckedCreateWithoutRefreshTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRefreshTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRefreshTokensInput, UserUncheckedUpdateWithoutRefreshTokensInput>
  }

  export type UserUpdateWithoutRefreshTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutRefreshTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAuditLogsInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAuditLogsInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAuditLogsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
  }

  export type UserUpsertWithoutAuditLogsInput = {
    update: XOR<UserUpdateWithoutAuditLogsInput, UserUncheckedUpdateWithoutAuditLogsInput>
    create: XOR<UserCreateWithoutAuditLogsInput, UserUncheckedCreateWithoutAuditLogsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAuditLogsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAuditLogsInput, UserUncheckedUpdateWithoutAuditLogsInput>
  }

  export type UserUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAuditLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutPlacementImportBatchesInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPlacementImportBatchesInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPlacementImportBatchesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPlacementImportBatchesInput, UserUncheckedCreateWithoutPlacementImportBatchesInput>
  }

  export type PersonalPlacementCreateWithoutBatchInput = {
    id?: string
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    employee: UserCreateNestedOneWithoutPersonalPlacementsInput
  }

  export type PersonalPlacementUncheckedCreateWithoutBatchInput = {
    id?: string
    employeeId: string
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type PersonalPlacementCreateOrConnectWithoutBatchInput = {
    where: PersonalPlacementWhereUniqueInput
    create: XOR<PersonalPlacementCreateWithoutBatchInput, PersonalPlacementUncheckedCreateWithoutBatchInput>
  }

  export type PersonalPlacementCreateManyBatchInputEnvelope = {
    data: PersonalPlacementCreateManyBatchInput | PersonalPlacementCreateManyBatchInput[]
    skipDuplicates?: boolean
  }

  export type TeamPlacementCreateWithoutBatchInput = {
    id?: string
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    lead: UserCreateNestedOneWithoutTeamPlacementsInput
  }

  export type TeamPlacementUncheckedCreateWithoutBatchInput = {
    id?: string
    leadId: string
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type TeamPlacementCreateOrConnectWithoutBatchInput = {
    where: TeamPlacementWhereUniqueInput
    create: XOR<TeamPlacementCreateWithoutBatchInput, TeamPlacementUncheckedCreateWithoutBatchInput>
  }

  export type TeamPlacementCreateManyBatchInputEnvelope = {
    data: TeamPlacementCreateManyBatchInput | TeamPlacementCreateManyBatchInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutPlacementImportBatchesInput = {
    update: XOR<UserUpdateWithoutPlacementImportBatchesInput, UserUncheckedUpdateWithoutPlacementImportBatchesInput>
    create: XOR<UserCreateWithoutPlacementImportBatchesInput, UserUncheckedCreateWithoutPlacementImportBatchesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPlacementImportBatchesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPlacementImportBatchesInput, UserUncheckedUpdateWithoutPlacementImportBatchesInput>
  }

  export type UserUpdateWithoutPlacementImportBatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPlacementImportBatchesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PersonalPlacementUpsertWithWhereUniqueWithoutBatchInput = {
    where: PersonalPlacementWhereUniqueInput
    update: XOR<PersonalPlacementUpdateWithoutBatchInput, PersonalPlacementUncheckedUpdateWithoutBatchInput>
    create: XOR<PersonalPlacementCreateWithoutBatchInput, PersonalPlacementUncheckedCreateWithoutBatchInput>
  }

  export type PersonalPlacementUpdateWithWhereUniqueWithoutBatchInput = {
    where: PersonalPlacementWhereUniqueInput
    data: XOR<PersonalPlacementUpdateWithoutBatchInput, PersonalPlacementUncheckedUpdateWithoutBatchInput>
  }

  export type PersonalPlacementUpdateManyWithWhereWithoutBatchInput = {
    where: PersonalPlacementScalarWhereInput
    data: XOR<PersonalPlacementUpdateManyMutationInput, PersonalPlacementUncheckedUpdateManyWithoutBatchInput>
  }

  export type TeamPlacementUpsertWithWhereUniqueWithoutBatchInput = {
    where: TeamPlacementWhereUniqueInput
    update: XOR<TeamPlacementUpdateWithoutBatchInput, TeamPlacementUncheckedUpdateWithoutBatchInput>
    create: XOR<TeamPlacementCreateWithoutBatchInput, TeamPlacementUncheckedCreateWithoutBatchInput>
  }

  export type TeamPlacementUpdateWithWhereUniqueWithoutBatchInput = {
    where: TeamPlacementWhereUniqueInput
    data: XOR<TeamPlacementUpdateWithoutBatchInput, TeamPlacementUncheckedUpdateWithoutBatchInput>
  }

  export type TeamPlacementUpdateManyWithWhereWithoutBatchInput = {
    where: TeamPlacementScalarWhereInput
    data: XOR<TeamPlacementUpdateManyMutationInput, TeamPlacementUncheckedUpdateManyWithoutBatchInput>
  }

  export type UserCreateWithoutPersonalPlacementsInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutPersonalPlacementsInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutLeadInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutPersonalPlacementsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutPersonalPlacementsInput, UserUncheckedCreateWithoutPersonalPlacementsInput>
  }

  export type PlacementImportBatchCreateWithoutPersonalPlacementsInput = {
    id?: string
    type: $Enums.PlacementImportType
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    uploader: UserCreateNestedOneWithoutPlacementImportBatchesInput
    teamPlacements?: TeamPlacementCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchUncheckedCreateWithoutPersonalPlacementsInput = {
    id?: string
    type: $Enums.PlacementImportType
    uploaderId: string
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    teamPlacements?: TeamPlacementUncheckedCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchCreateOrConnectWithoutPersonalPlacementsInput = {
    where: PlacementImportBatchWhereUniqueInput
    create: XOR<PlacementImportBatchCreateWithoutPersonalPlacementsInput, PlacementImportBatchUncheckedCreateWithoutPersonalPlacementsInput>
  }

  export type UserUpsertWithoutPersonalPlacementsInput = {
    update: XOR<UserUpdateWithoutPersonalPlacementsInput, UserUncheckedUpdateWithoutPersonalPlacementsInput>
    create: XOR<UserCreateWithoutPersonalPlacementsInput, UserUncheckedCreateWithoutPersonalPlacementsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutPersonalPlacementsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutPersonalPlacementsInput, UserUncheckedUpdateWithoutPersonalPlacementsInput>
  }

  export type UserUpdateWithoutPersonalPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutPersonalPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PlacementImportBatchUpsertWithoutPersonalPlacementsInput = {
    update: XOR<PlacementImportBatchUpdateWithoutPersonalPlacementsInput, PlacementImportBatchUncheckedUpdateWithoutPersonalPlacementsInput>
    create: XOR<PlacementImportBatchCreateWithoutPersonalPlacementsInput, PlacementImportBatchUncheckedCreateWithoutPersonalPlacementsInput>
    where?: PlacementImportBatchWhereInput
  }

  export type PlacementImportBatchUpdateToOneWithWhereWithoutPersonalPlacementsInput = {
    where?: PlacementImportBatchWhereInput
    data: XOR<PlacementImportBatchUpdateWithoutPersonalPlacementsInput, PlacementImportBatchUncheckedUpdateWithoutPersonalPlacementsInput>
  }

  export type PlacementImportBatchUpdateWithoutPersonalPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    uploader?: UserUpdateOneRequiredWithoutPlacementImportBatchesNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutBatchNestedInput
  }

  export type PlacementImportBatchUncheckedUpdateWithoutPersonalPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    uploaderId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutBatchNestedInput
  }

  export type UserCreateWithoutTeamPlacementsInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    employeeProfile?: EmployeeProfileCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileCreateNestedManyWithoutManagerInput
    manager?: UserCreateNestedOneWithoutSubordinatesInput
    subordinates?: UserCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutEmployeeInput
    passwordResetTokens?: PasswordResetTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutTeamPlacementsInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
    managerId?: string | null
    employeeProfile?: EmployeeProfileUncheckedCreateNestedOneWithoutUserInput
    refreshTokens?: RefreshTokenUncheckedCreateNestedManyWithoutUserInput
    leadEmployees?: EmployeeProfileUncheckedCreateNestedManyWithoutManagerInput
    subordinates?: UserUncheckedCreateNestedManyWithoutManagerInput
    auditLogs?: AuditLogUncheckedCreateNestedManyWithoutActorInput
    placementImportBatches?: PlacementImportBatchUncheckedCreateNestedManyWithoutUploaderInput
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutEmployeeInput
    passwordResetTokens?: PasswordResetTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutTeamPlacementsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTeamPlacementsInput, UserUncheckedCreateWithoutTeamPlacementsInput>
  }

  export type PlacementImportBatchCreateWithoutTeamPlacementsInput = {
    id?: string
    type: $Enums.PlacementImportType
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    uploader: UserCreateNestedOneWithoutPlacementImportBatchesInput
    personalPlacements?: PersonalPlacementCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchUncheckedCreateWithoutTeamPlacementsInput = {
    id?: string
    type: $Enums.PlacementImportType
    uploaderId: string
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementUncheckedCreateNestedManyWithoutBatchInput
  }

  export type PlacementImportBatchCreateOrConnectWithoutTeamPlacementsInput = {
    where: PlacementImportBatchWhereUniqueInput
    create: XOR<PlacementImportBatchCreateWithoutTeamPlacementsInput, PlacementImportBatchUncheckedCreateWithoutTeamPlacementsInput>
  }

  export type UserUpsertWithoutTeamPlacementsInput = {
    update: XOR<UserUpdateWithoutTeamPlacementsInput, UserUncheckedUpdateWithoutTeamPlacementsInput>
    create: XOR<UserCreateWithoutTeamPlacementsInput, UserUncheckedCreateWithoutTeamPlacementsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutTeamPlacementsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutTeamPlacementsInput, UserUncheckedUpdateWithoutTeamPlacementsInput>
  }

  export type UserUpdateWithoutTeamPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    manager?: UserUpdateOneWithoutSubordinatesNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutTeamPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type PlacementImportBatchUpsertWithoutTeamPlacementsInput = {
    update: XOR<PlacementImportBatchUpdateWithoutTeamPlacementsInput, PlacementImportBatchUncheckedUpdateWithoutTeamPlacementsInput>
    create: XOR<PlacementImportBatchCreateWithoutTeamPlacementsInput, PlacementImportBatchUncheckedCreateWithoutTeamPlacementsInput>
    where?: PlacementImportBatchWhereInput
  }

  export type PlacementImportBatchUpdateToOneWithWhereWithoutTeamPlacementsInput = {
    where?: PlacementImportBatchWhereInput
    data: XOR<PlacementImportBatchUpdateWithoutTeamPlacementsInput, PlacementImportBatchUncheckedUpdateWithoutTeamPlacementsInput>
  }

  export type PlacementImportBatchUpdateWithoutTeamPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    uploader?: UserUpdateOneRequiredWithoutPlacementImportBatchesNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutBatchNestedInput
  }

  export type PlacementImportBatchUncheckedUpdateWithoutTeamPlacementsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    uploaderId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutBatchNestedInput
  }

  export type EmployeeProfileCreateManyTeamInput = {
    id: string
    managerId?: string | null
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type EmployeeProfileUpdateWithoutTeamInput = {
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutEmployeeProfileNestedInput
    manager?: UserUpdateOneWithoutLeadEmployeesNestedInput
  }

  export type EmployeeProfileUncheckedUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmployeeProfileUncheckedUpdateManyWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    managerId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenCreateManyUserInput = {
    id?: string
    token: string
    isRevoked?: boolean
    expiresAt: Date | string
    createdAt?: Date | string
  }

  export type EmployeeProfileCreateManyManagerInput = {
    id: string
    teamId?: string | null
    level?: string | null
    vbid?: string | null
    comment?: string | null
    targetType?: $Enums.TargetType
    isActive?: boolean
    deletedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateManyManagerInput = {
    id?: string
    email: string
    passwordHash: string
    name: string
    vbid?: string | null
    role: $Enums.Role
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    mfaSecret?: string | null
    mfaEnabled?: boolean
  }

  export type AuditLogCreateManyActorInput = {
    id?: string
    action: string
    module?: string | null
    entityType?: string | null
    entityId?: string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    ipAddress?: string | null
    userAgent?: string | null
    geoLocation?: string | null
    createdAt?: Date | string
    isTampered?: boolean
    hash?: string | null
  }

  export type PlacementImportBatchCreateManyUploaderInput = {
    id?: string
    type: $Enums.PlacementImportType
    createdAt?: Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PersonalPlacementCreateManyEmployeeInput = {
    id?: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type TeamPlacementCreateManyLeadInput = {
    id?: string
    batchId?: string | null
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type PasswordResetTokenCreateManyUserInput = {
    id?: string
    tokenHash: string
    expiresAt: Date | string
    usedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type RefreshTokenUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    isRevoked?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    isRevoked?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RefreshTokenUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    token?: StringFieldUpdateOperationsInput | string
    isRevoked?: BoolFieldUpdateOperationsInput | boolean
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmployeeProfileUpdateWithoutManagerInput = {
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutEmployeeProfileNestedInput
    team?: TeamUpdateOneWithoutEmployeesNestedInput
  }

  export type EmployeeProfileUncheckedUpdateWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmployeeProfileUncheckedUpdateManyWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    comment?: NullableStringFieldUpdateOperationsInput | string | null
    targetType?: EnumTargetTypeFieldUpdateOperationsInput | $Enums.TargetType
    isActive?: BoolFieldUpdateOperationsInput | boolean
    deletedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUpdateWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUpdateManyWithoutManagerNestedInput
    subordinates?: UserUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
    employeeProfile?: EmployeeProfileUncheckedUpdateOneWithoutUserNestedInput
    refreshTokens?: RefreshTokenUncheckedUpdateManyWithoutUserNestedInput
    leadEmployees?: EmployeeProfileUncheckedUpdateManyWithoutManagerNestedInput
    subordinates?: UserUncheckedUpdateManyWithoutManagerNestedInput
    auditLogs?: AuditLogUncheckedUpdateManyWithoutActorNestedInput
    placementImportBatches?: PlacementImportBatchUncheckedUpdateManyWithoutUploaderNestedInput
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutEmployeeNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutLeadNestedInput
    passwordResetTokens?: PasswordResetTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutManagerInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    vbid?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    mfaSecret?: NullableStringFieldUpdateOperationsInput | string | null
    mfaEnabled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AuditLogUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    module?: NullableStringFieldUpdateOperationsInput | string | null
    entityType?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    geoLocation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isTampered?: BoolFieldUpdateOperationsInput | boolean
    hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogUncheckedUpdateWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    module?: NullableStringFieldUpdateOperationsInput | string | null
    entityType?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    geoLocation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isTampered?: BoolFieldUpdateOperationsInput | boolean
    hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AuditLogUncheckedUpdateManyWithoutActorInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    module?: NullableStringFieldUpdateOperationsInput | string | null
    entityType?: NullableStringFieldUpdateOperationsInput | string | null
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    changes?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    geoLocation?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    isTampered?: BoolFieldUpdateOperationsInput | boolean
    hash?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PlacementImportBatchUpdateWithoutUploaderInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementUpdateManyWithoutBatchNestedInput
    teamPlacements?: TeamPlacementUpdateManyWithoutBatchNestedInput
  }

  export type PlacementImportBatchUncheckedUpdateWithoutUploaderInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
    personalPlacements?: PersonalPlacementUncheckedUpdateManyWithoutBatchNestedInput
    teamPlacements?: TeamPlacementUncheckedUpdateManyWithoutBatchNestedInput
  }

  export type PlacementImportBatchUncheckedUpdateManyWithoutUploaderInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPlacementImportTypeFieldUpdateOperationsInput | $Enums.PlacementImportType
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    errors?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PersonalPlacementUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    batch?: PlacementImportBatchUpdateOneWithoutPersonalPlacementsNestedInput
  }

  export type PersonalPlacementUncheckedUpdateWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PersonalPlacementUncheckedUpdateManyWithoutEmployeeInput = {
    id?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamPlacementUpdateWithoutLeadInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    batch?: PlacementImportBatchUpdateOneWithoutTeamPlacementsNestedInput
  }

  export type TeamPlacementUncheckedUpdateWithoutLeadInput = {
    id?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamPlacementUncheckedUpdateManyWithoutLeadInput = {
    id?: StringFieldUpdateOperationsInput | string
    batchId?: NullableStringFieldUpdateOperationsInput | string | null
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PasswordResetTokenUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenHash?: StringFieldUpdateOperationsInput | string
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PersonalPlacementCreateManyBatchInput = {
    id?: string
    employeeId: string
    level?: string | null
    candidateName: string
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    recruiterName?: string | null
    teamLeadName?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type TeamPlacementCreateManyBatchInput = {
    id?: string
    leadId: string
    level?: string | null
    candidateName: string
    recruiterName?: string | null
    leadName?: string | null
    splitWith?: string | null
    placementYear?: number | null
    doj: Date | string
    doq?: Date | string | null
    client: string
    plcId: string
    placementType: string
    billingStatus: string
    collectionStatus?: string | null
    totalBilledHours?: number | null
    revenueLeadUsd: Decimal | DecimalJsLike | number | string
    incentiveInr: Decimal | DecimalJsLike | number | string
    incentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    vbCode?: string | null
    yearlyPlacementTarget?: Decimal | DecimalJsLike | number | string | null
    placementDone?: Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: Decimal | DecimalJsLike | number | string | null
    revenueAch?: Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: Decimal | DecimalJsLike | number | string | null
    slabQualified?: string | null
    totalIncentiveInr?: Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
  }

  export type PersonalPlacementUpdateWithoutBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    employee?: UserUpdateOneRequiredWithoutPersonalPlacementsNestedInput
  }

  export type PersonalPlacementUncheckedUpdateWithoutBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PersonalPlacementUncheckedUpdateManyWithoutBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    employeeId?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    teamLeadName?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    targetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamPlacementUpdateWithoutBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lead?: UserUpdateOneRequiredWithoutTeamPlacementsNestedInput
  }

  export type TeamPlacementUncheckedUpdateWithoutBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    leadId?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamPlacementUncheckedUpdateManyWithoutBatchInput = {
    id?: StringFieldUpdateOperationsInput | string
    leadId?: StringFieldUpdateOperationsInput | string
    level?: NullableStringFieldUpdateOperationsInput | string | null
    candidateName?: StringFieldUpdateOperationsInput | string
    recruiterName?: NullableStringFieldUpdateOperationsInput | string | null
    leadName?: NullableStringFieldUpdateOperationsInput | string | null
    splitWith?: NullableStringFieldUpdateOperationsInput | string | null
    placementYear?: NullableIntFieldUpdateOperationsInput | number | null
    doj?: DateTimeFieldUpdateOperationsInput | Date | string
    doq?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    client?: StringFieldUpdateOperationsInput | string
    plcId?: StringFieldUpdateOperationsInput | string
    placementType?: StringFieldUpdateOperationsInput | string
    billingStatus?: StringFieldUpdateOperationsInput | string
    collectionStatus?: NullableStringFieldUpdateOperationsInput | string | null
    totalBilledHours?: NullableIntFieldUpdateOperationsInput | number | null
    revenueLeadUsd?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentiveInr?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    incentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    vbCode?: NullableStringFieldUpdateOperationsInput | string | null
    yearlyPlacementTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementDone?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    placementAchPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yearlyRevenueTarget?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueAch?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    revenueTargetAchievedPercent?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalRevenueGenerated?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    slabQualified?: NullableStringFieldUpdateOperationsInput | string | null
    totalIncentiveInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalIncentivePaidInr?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TeamCountOutputTypeDefaultArgs instead
     */
    export type TeamCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlacementImportBatchCountOutputTypeDefaultArgs instead
     */
    export type PlacementImportBatchCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlacementImportBatchCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TeamDefaultArgs instead
     */
    export type TeamArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PasswordResetTokenDefaultArgs instead
     */
    export type PasswordResetTokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PasswordResetTokenDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmployeeProfileDefaultArgs instead
     */
    export type EmployeeProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmployeeProfileDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RefreshTokenDefaultArgs instead
     */
    export type RefreshTokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RefreshTokenDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AuditLogDefaultArgs instead
     */
    export type AuditLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AuditLogDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PlacementImportBatchDefaultArgs instead
     */
    export type PlacementImportBatchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PlacementImportBatchDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PersonalPlacementDefaultArgs instead
     */
    export type PersonalPlacementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PersonalPlacementDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TeamPlacementDefaultArgs instead
     */
    export type TeamPlacementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamPlacementDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}