import React, { useState } from "react";
import { AxiosError } from "axios";
import styled from "styled-components";

interface ErrorObject {
  isAxiosError?: boolean;
  message?: string;
  error?: string;
  detail?: string;
}

// Styled components to replace Ant Design components
const AlertContainer = styled.div<{
  type: "error" | "warning" | "info" | "success";
}>`
  width: 100%;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 16px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AlertHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const IconContainer = styled.div`
  color: #ff4d4f;
  font-size: 18px;
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  padding: 0;
  line-height: 1;
  &:hover {
    color: rgba(0, 0, 0, 0.75);
  }
`;

const TitleContainer = styled.div`
  font-weight: 500;
  font-size: 16px;
  display: flex;
  align-items: center;
  flex-grow: 1;
`;

const StyledSpace = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const Paragraph = styled.p`
  margin: 0;
  padding: 0;
  line-height: 1.5;
`;

const Text = styled.span<{ $strong?: boolean; $type?: "secondary" | "primary" }>`
  font-weight: ${(props) => (props.$strong ? "600" : "400")};
  color: ${(props) =>
    props.$type === "secondary" ? "rgba(0, 0, 0, 0.45)" : "inherit"};
`;

const SecondaryText = styled(Text).attrs({ $type: "secondary" })``;

const CollapseContainer = styled.div`
  margin-left: -15px;
  margin-right: -15px;
  margin-bottom: -5px;
`;

const CollapseHeader = styled.div<{ $isActive: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  user-select: none;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &::after {
    content: "${(props) => (props.$isActive ? "▼" : "▶")}";
    font-size: 12px;
    margin-left: 8px;
  }
`;

const CollapseContent = styled.div<{ $isVisible: boolean }>`
  padding: ${(props) => (props.$isVisible ? "0 16px 12px" : "0 16px")};
  max-height: ${(props) => (props.$isVisible ? "300px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const PreContainer = styled.pre`
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin: 0;
`;

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

export interface ErrorAlertProps {
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
      <CollapseHeader
        $isActive={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {header}
      </CollapseHeader>
      <CollapseContent $isVisible={isExpanded}>{children}</CollapseContent>
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
    <AlertContainer type="error">
      <AlertHeader>
        <TitleContainer>
          <IconContainer>⚠️</IconContainer>
          {title}
        </TitleContainer>
        {onClose && <CloseButton onClick={onClose}>✕</CloseButton>}
      </AlertHeader>
      <StyledSpace>
        <Paragraph>
          <Text $strong>{errorType}:</Text> {message}
        </Paragraph>
        {description && (
          <Paragraph>
            <SecondaryText>{description}</SecondaryText>
          </Paragraph>
        )}
        {details && (
          <CollapseContainer>
            <Collapse header="Details" defaultExpanded={showDetailsDefault}>
              <PreContainer>{details}</PreContainer>
            </Collapse>
          </CollapseContainer>
        )}
      </StyledSpace>
    </AlertContainer>
  );
};

export default ErrorAlert;
