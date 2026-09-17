import {Component, type ContextType, type ErrorInfo, type ReactNode} from "react";

import {TelemetryContext} from "./context";
import {MAX_COMPONENT_STACK_LENGTH, TelemetryEvent} from "./events";

/** Props for {@link TSErrorBoundary}. */
export interface TSErrorBoundaryProps {
	children?: ReactNode;
	/**
	 * Rendered instead of the children once a render error is caught. A
	 * function receives the error and a `reset` callback for retry UI.
	 */
	fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
	/** Event name override. Default: `App:Error:React`. */
	eventName?: string;
	/** Extra attributes merged into the emitted event. */
	attributes?: Record<string, unknown>;
	/** Escape hatch for app-side handling (logging, resetting state). */
	onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
	error: Error | null;
}

/**
 * React error boundary that records render errors as a stable-named product
 * event with the component stack attached, then renders `fallback`.
 *
 * Boundaries only catch errors thrown during render/lifecycle. Async
 * callbacks and promise rejections need {@link installGlobalErrorHandlers}.
 * The exception message is truncated by the core emitter; the component stack
 * is truncated here.
 */
export class TSErrorBoundary extends Component<TSErrorBoundaryProps, State> {
	static contextType = TelemetryContext;
	declare context: ContextType<typeof TelemetryContext>;

	state: State = {error: null};

	static getDerivedStateFromError(error: Error): State {
		return {error};
	}

	componentDidCatch(error: Error, info: ErrorInfo): void {
		this.context?.trackError(error, {
			name: this.props.eventName ?? TelemetryEvent.ReactError,
			attributes: {
				...this.props.attributes,
				"error.source": "react",
				"react.component_stack": (info.componentStack ?? "").slice(0, MAX_COMPONENT_STACK_LENGTH),
			},
		});
		this.props.onError?.(error, info);
	}

	private readonly reset = (): void => {
		this.setState({error: null});
	};

	render(): ReactNode {
		const {error} = this.state;
		if (!error) return this.props.children;
		const {fallback} = this.props;
		return typeof fallback === "function" ? fallback(error, this.reset) : (fallback ?? null);
	}
}
