// Comprehensive (but still simplified) TypeScript definitions for the local
// libWrapper shim, based on the official libWrapper public API documentation.
// Not all internal implementation details are represented; only stable, public
// surfaces intended for module consumption.

export const VERSIONS: [number, number, number];
export const TGT_SPLIT_RE: RegExp; // Internal helper (exposed by shim only)
export const TGT_CLEANUP_RE: RegExp; // Internal helper (exposed by shim only)

/** Wrapper kinds. */
export type LibWrapperWrapperType = 'LISTENER' | 'WRAPPER' | 'MIXED' | 'OVERRIDE';
/** Performance modes. */
export type LibWrapperPerfMode = 'NORMAL' | 'FAST' | 'AUTO';

/** Options object accepted by register(). */
export interface LibWrapperRegisterOptions {
  /** If true, first param to fn is the next function in the chain. Defaults true except for OVERRIDE. */
  chain?: boolean;
  /** Preferred performance mode. Default 'AUTO'. */
  perf_mode?: LibWrapperPerfMode;
  /** Arguments to bind (insert) after the wrapped function param. */
  bind?: any[];
}

/** Options object accepted by ignore_conflicts(). */
export interface LibWrapperIgnoreConflictOptions {
  /** If true, also ignore confirmed conflicts (errors) not only warnings. Default false. */
  ignore_errors?: boolean;
}

/** Function signature for LISTENER & OVERRIDE wrappers (no wrapped param). */
export type LibWrapperBareWrapperFn = (...args: any[]) => any;
/** Function signature for WRAPPER & MIXED (first param is next function). */
export type LibWrapperChainedWrapperFn = (wrapped: (...args: any[]) => any, ...args: any[]) => any;
/** Union of any accepted wrapper function signatures. */
export type LibWrapperAnyWrapperFn = LibWrapperBareWrapperFn | LibWrapperChainedWrapperFn;

/** Base error class (available as libWrapper.Error & libWrapper.LibWrapperError). */
export class LibWrapperError extends Error { package_id?: string; }
export class LibWrapperInternalError extends LibWrapperError {}
export class LibWrapperPackageError extends LibWrapperError {}
export class LibWrapperAlreadyOverriddenError extends LibWrapperError { conflicting_id?: string; target?: string; }
export class LibWrapperInvalidWrapperChainError extends LibWrapperError {}

export declare class LibWrapper {
  // -------- Enumerations / constants --------
  static readonly WRAPPER: 'WRAPPER';
  static readonly MIXED: 'MIXED';
  static readonly OVERRIDE: 'OVERRIDE';
  static readonly LISTENER: 'LISTENER';
  static readonly PERF_NORMAL: 'NORMAL';
  static readonly PERF_AUTO: 'AUTO';
  static readonly PERF_FAST: 'FAST';

  // -------- Versioning / metadata --------
  static get version(): string; // "<MAJOR>.<MINOR>.<PATCH>.<SUFFIX><META>"
  static get versions(): [number, number, number, number, string];
  static get git_version(): string; // Commit hash or 'HEAD'
  static version_at_least(major: number, minor?: number, patch?: number, suffix?: number): boolean;
  static get is_fallback(): boolean;

  // -------- Errors (aliases) --------
  static readonly Error: typeof LibWrapperError;
  static readonly LibWrapperError: typeof LibWrapperError;
  static readonly InternalError: typeof LibWrapperInternalError;
  static readonly LibWrapperInternalError: typeof LibWrapperInternalError;
  static readonly PackageError: typeof LibWrapperPackageError;
  static readonly LibWrapperPackageError: typeof LibWrapperPackageError;
  static readonly AlreadyOverriddenError: typeof LibWrapperAlreadyOverriddenError;
  static readonly LibWrapperAlreadyOverriddenError: typeof LibWrapperAlreadyOverriddenError;
  static readonly InvalidWrapperChainError: typeof LibWrapperInvalidWrapperChainError;
  static readonly LibWrapperInvalidWrapperChainError: typeof LibWrapperInvalidWrapperChainError;

  // -------- Core API --------
  /** Register a new wrapper. Returns unique numeric target identifier. */
  static register(
    package_id: string,
    target: string | number,
    fn: LibWrapperChainedWrapperFn,
    type?: Exclude<LibWrapperWrapperType, 'LISTENER' | 'OVERRIDE'> | number,
    options?: LibWrapperRegisterOptions
  ): number;
  static register(
    package_id: string,
    target: string | number,
    fn: LibWrapperBareWrapperFn,
    type: 'LISTENER' | 'OVERRIDE' | number,
    options?: LibWrapperRegisterOptions
  ): number;
  static register(
    package_id: string,
    target: string | number,
    fn: LibWrapperAnyWrapperFn,
    type?: LibWrapperWrapperType | number,
    options?: LibWrapperRegisterOptions
  ): number;

  /** Unregister a previously registered wrapper. */
  static unregister(package_id: string, target: string | number, fail?: boolean): void;
  /** Unregister all wrappers belonging to a package. */
  static unregister_all(package_id: string): void;
  /** Ignore conflicts matching supplied filters. */
  static ignore_conflicts(
    package_id: string,
    ignore_ids: string | string[],
    targets: string | string[],
    options?: LibWrapperIgnoreConflictOptions
  ): void;
}

/** Global variable containing either the real library or the fallback shim. */
export let libWrapper: typeof LibWrapper | undefined;

declare global {
  // eslint-disable-next-line no-var
  var libWrapper: typeof LibWrapper | undefined;
}

export {}; // Treat file as a module and retain global augmentation.
