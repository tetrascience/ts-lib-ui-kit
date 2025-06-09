import React, { useState } from "react";
import { AxiosError } from "axios";
import "./ErrorAlert.scss";

interface ErrorObject {
  isAxiosError?: boolean;
  message?: string;
  error?: string;
  detail?: string;
}

// Helper function to check if an error is an AxiosError (more robust than instanceof)
// You might already have axios installed and can use axios.isAxiosError directly.
// If so, you can replace this function with: import axios from 'axios'; const isAxiosError = axios.isAxiosError;
// This implementation avoids a direct dependency on the axios runtime in this component if preferred.
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as ErrorObject).isAxiosError === true
  );
}

interface ErrorAlertProps {
  /** The error object to display. Can be Error, AxiosError, string, or any other type. */
  error: unknown;
  /** Optional title for the error alert. Defaults to 'An Error Occurred'. */
  title?: React.ReactNode;
  /** Optional callback function when the alert is closed. */
  onClose?: () => void;
  /** Set to true to show technical details expanded by default. Defaults to false. */
  showDetailsDefault?: boolean;
  /** Custom message to show when error is null/undefined (optional, component renders nothing by default) */
  noErrorContent?: React.ReactNode;
}

// Simple Collapse component implementation
const Collapse = ({
  children,
  header,
  defaultExpanded = false,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  defaultExpanded?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div>
      <div
        className={`collapse-header ${
          isExpanded ? "collapse-header--active" : ""
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {header}
      </div>
      <div
        className={`collapse-content ${
          isExpanded ? "collapse-content--visible" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  title = "An Error Occurred",
  onClose,
  showDetailsDefault = false,
}) => {
  // If no error is provided, render nothing
  if (!error) {
    return <></>;
  }

  let message: React.ReactNode = "An unexpected error occurred.";
  let description: React.ReactNode | null = null;
  let details: string | null = null;
  let errorType: string = "Unknown Error";

  if (isAxiosError(error)) {
    errorType = "Network/API Error";
    message = error.message; // Default Axios message

    if (error.response) {
      // Error response received from server (4xx, 5xx)
      const status = error.response.status;
      const statusText = error.response.statusText;
      message = `API Error: ${status} ${statusText}`;

      // Try to extract a more specific message from the response body
      const responseData = error.response.data;
      if (typeof responseData === "string") {
        description = responseData;
      } else if (responseData && typeof responseData === "object") {
        // Common patterns for error messages in JSON responses

        const detail =
          (responseData as ErrorObject).detail ||
          (responseData as ErrorObject).message ||
          (responseData as ErrorObject).error;
        if (typeof detail === "string") {
          description = detail;
        } else {
          // Fallback: Show stringified data in description or details
          description = "Check details for response data.";
          details = JSON.stringify(responseData, null, 2);
        }
      } else {
        description = `Request failed with status code ${status}.`;
      }
      // Prepare details section
      details = `URL: ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }\nStatus: ${status} ${statusText}\nResponse Data:\n${
        details ?? JSON.stringify(responseData, null, 2)
      }`;
    } else if (error.request) {
      // Request was made but no response received (network error, CORS issue, etc.)
      errorType = "Network Error";
      message = "Network Error: Could not reach the server.";
      description =
        "Please check your internet connection or contact support if the problem persists.";
      details = `URL: ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      }\nError Message: ${error.message}`;
    } else {
      // Something else happened setting up the request
      message = `Request Setup Error: ${error.message}`;
    }

    // Include Axios error code if available
    if (error.code) {
      errorType += ` (Code: ${error.code})`;
    }
  } else if (error instanceof Error) {
    errorType = error.name || "Error"; // e.g., 'TypeError', 'ReferenceError'
    message = error.message;
    details = error.stack ?? "No stack trace available.";
  } else if (typeof error === "string") {
    errorType = "Message";
    message = error;
  } else if (typeof error === "object" && error !== null) {
    // Handle generic objects potentially used as errors
    errorType = "Object Error";

    message =
      (error as ErrorObject).message ||
      (error as ErrorObject).error ||
      "An object was thrown as an error.";
    try {
      details = JSON.stringify(error, null, 2);
    } catch {
      details = "Could not stringify the error object.";
    }
  }
  // else: message remains 'An unexpected error occurred.'

  return (
    <div className="alert-container alert-container--error">
      <div className="alert-header">
        <div className="title-container">
          <div className="icon-container">⚠️</div>
          {title}
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      <div className="styled-space">
        <p className="paragraph">
          <span className="text text--strong">{errorType}:</span> {message}
        </p>
        {description && (
          <p className="paragraph">
            <span className="text text--secondary">{description}</span>
          </p>
        )}
        {details && (
          <div className="collapse-container">
            <Collapse header="Details" defaultExpanded={showDetailsDefault}>
              <pre className="pre-container">{details}</pre>
            </Collapse>
          </div>
        )}
      </div>
    </div>
  );
};

export { ErrorAlert };
export type { ErrorAlertProps };
