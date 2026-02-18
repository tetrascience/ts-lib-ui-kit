import { describe, it, expect } from "vitest";

import {
  ProviderError,
  MissingTableError,
  QueryError,
  ProviderConnectionError,
  InvalidProviderConfigurationError,
} from "../exceptions";

describe("Provider Exception Classes", () => {
  describe("ProviderError", () => {
    it("should be an instance of Error", () => {
      const error = new ProviderError("test error");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProviderError);
    });

    it("should have the correct name", () => {
      const error = new ProviderError("test error");
      expect(error.name).toBe("ProviderError");
    });

    it("should have the correct message", () => {
      const error = new ProviderError("test error message");
      expect(error.message).toBe("test error message");
    });
  });

  describe("MissingTableError", () => {
    it("should be an instance of ProviderError", () => {
      const error = new MissingTableError("table not found");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProviderError);
      expect(error).toBeInstanceOf(MissingTableError);
    });

    it("should have the correct name", () => {
      const error = new MissingTableError("table not found");
      expect(error.name).toBe("MissingTableError");
    });
  });

  describe("QueryError", () => {
    it("should be an instance of ProviderError", () => {
      const error = new QueryError("query failed");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProviderError);
      expect(error).toBeInstanceOf(QueryError);
    });

    it("should have the correct name", () => {
      const error = new QueryError("query failed");
      expect(error.name).toBe("QueryError");
    });
  });

  describe("ProviderConnectionError", () => {
    it("should be an instance of ProviderError", () => {
      const error = new ProviderConnectionError("connection failed");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProviderError);
      expect(error).toBeInstanceOf(ProviderConnectionError);
    });

    it("should have the correct name", () => {
      const error = new ProviderConnectionError("connection failed");
      expect(error.name).toBe("ProviderConnectionError");
    });
  });

  describe("InvalidProviderConfigurationError", () => {
    it("should be an instance of ProviderError", () => {
      const error = new InvalidProviderConfigurationError("invalid config");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ProviderError);
      expect(error).toBeInstanceOf(InvalidProviderConfigurationError);
    });

    it("should have the correct name", () => {
      const error = new InvalidProviderConfigurationError("invalid config");
      expect(error.name).toBe("InvalidProviderConfigurationError");
    });
  });
});

