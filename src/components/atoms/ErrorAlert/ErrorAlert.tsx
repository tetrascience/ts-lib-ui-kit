import React, { useState } from "react";
import styled from "styled-components";

import type { AxiosError } from "axios";

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
  box-sizing: border-box;
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

/** Parsed error result used for rendering */
interface ParsedError {
  message: React.ReactNode;
  description: React.ReactNode | null;
  details: string | null;
  errorType: string;
}

/** Parses Axios error response data to extract description and details */
function parseAxiosResponseData(
  responseData: unknown
): { description: React.ReactNode; details: string | null } {
  if (typeof responseData === "string") {
    return { description: responseData, details: null };
  }
  if (responseData && typeof responseData === "object") {
    const detail =
      (responseData as ErrorObject).detail ||
      (responseData as ErrorObject).message ||
      (responseData as ErrorObject).error;
    if (typeof detail === "string") {
      return { description: detail, details: null };
    }
    return {
      description: "Check details for response data.",
      details: JSON.stringify(responseData, null, 2),
    };
  }
  return { description: null, details: null };
}

/** Parses an Axios error into a ParsedError object */
function parseAxiosError(error: AxiosError): ParsedError {
  let errorType = "Network/API Error";
  let message: React.ReactNode = error.message;
  let description: React.ReactNode | null = null;
  let details: string | null = null;

  if (error.response) {
    const { status, statusText, data: responseData } = error.response;
    message = `API Error: ${status} ${statusText}`;
    const parsed = parseAxiosResponseData(responseData);
    description = parsed.description ?? `Request failed with status code ${status}.`;
    details = `URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}\nStatus: ${status} ${statusText}\nResponse Data:\n${parsed.details ?? JSON.stringify(responseData, null, 2)}`;
  } else if (error.request) {
    errorType = "Network Error";
    message = "Network Error: Could not reach the server.";
    description = "Please check your internet connection or contact support if the problem persists.";
    details = `URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}\nError Message: ${error.message}`;
  } else {
    message = `Request Setup Error: ${error.message}`;
  }

  if (error.code) {
    errorType += ` (Code: ${error.code})`;
  }

  return { message, description, details, errorType };
}

/** Parses a standard Error object into a ParsedError object */
function parseStandardError(error: Error): ParsedError {
  return {
    message: error.message,
    description: null,
    details: error.stack ?? "No stack trace available.",
    errorType: error.name || "Error",
  };
}

/** Parses an object error into a ParsedError object */
function parseObjectError(error: object): ParsedError {
  const message =
    (error as ErrorObject).message ||
    (error as ErrorObject).error ||
    "An object was thrown as an error.";
  let details: string | null;
  try {
    details = JSON.stringify(error, null, 2);
  } catch {
    details = "Could not stringify the error object.";
  }
  return { message, description: null, details, errorType: "Object Error" };
}

/** Parses any error type into a structured ParsedError object */
function parseError(error: unknown): ParsedError {
  if (isAxiosError(error)) {
    return parseAxiosError(error);
  }
  if (error instanceof Error) {
    return parseStandardError(error);
  }
  if (typeof error === "string") {
    return { message: error, description: null, details: null, errorType: "Message" };
  }
  if (typeof error === "object" && error !== null) {
    return parseObjectError(error);
  }
  return {
    message: "An unexpected error occurred.",
    description: null,
    details: null,
    errorType: "Unknown Error",
  };
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

  const { message, description, details, errorType } = parseError(error);

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
