/**
 * Stable event names emitted by the bindings themselves. Apps keep their own
 * `App[:Page][:Object]:Action` names for product events; these three exist so
 * error volume is queryable across every app without per-app naming drift.
 */
export const TelemetryEvent = {
	/** React render error caught by `TSErrorBoundary`. */
	ReactError: "App:Error:React",
	/** Uncaught exception seen by `window.onerror`. */
	WindowError: "App:Error:Window",
	/** Promise rejection with no handler. */
	UnhandledRejection: "App:Error:UnhandledRejection",
} as const;

/** Max length of the React component stack attribute. */
export const MAX_COMPONENT_STACK_LENGTH = 4000;
