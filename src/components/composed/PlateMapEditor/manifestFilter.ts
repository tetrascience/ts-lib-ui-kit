export type FilterValueType = "string" | "number";

export type FilterOperator =
  | "contains"
  | "does_not_contain"
  | "is"
  | "is_not"
  | "is_empty"
  | "is_not_empty"
  | "eq"
  | "neq"
  | "lt"
  | "gt"
  | "lte"
  | "gte";

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

export interface FilterState {
  conjunction: "and" | "or";
  conditions: FilterCondition[];
}

export interface FilterColumn {
  field: string;
  headerName: string;
  type?: FilterValueType;
}

export const EMPTY_FILTER_STATE: FilterState = {
  conjunction: "and",
  conditions: [],
};

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains: "contains",
  does_not_contain: "does not contain",
  is: "is",
  is_not: "is not",
  is_empty: "is empty",
  is_not_empty: "is not empty",
  eq: "=",
  neq: "≠",
  lt: "<",
  gt: ">",
  lte: "≤",
  gte: "≥",
};

const STRING_OPERATORS: FilterOperator[] = [
  "contains",
  "does_not_contain",
  "is",
  "is_not",
  "is_empty",
  "is_not_empty",
];

const NUMBER_OPERATORS: FilterOperator[] = [
  "eq",
  "neq",
  "lt",
  "gt",
  "lte",
  "gte",
  "is_empty",
  "is_not_empty",
];

export function operatorsForType(type: FilterValueType = "string"): FilterOperator[] {
  return type === "number" ? NUMBER_OPERATORS : STRING_OPERATORS;
}

export function defaultOperatorFor(type: FilterValueType = "string"): FilterOperator {
  return type === "number" ? "eq" : "contains";
}

export function valueInputRequired(op: FilterOperator): boolean {
  return op !== "is_empty" && op !== "is_not_empty";
}

function columnType(field: string, columns: FilterColumn[]): FilterValueType {
  return columns.find((c) => c.field === field)?.type ?? "string";
}

function evaluateCondition(
  row: Record<string, unknown>,
  condition: FilterCondition,
  columns: FilterColumn[],
): boolean {
  const raw = row[condition.field];
  const { operator, value } = condition;

  if (operator === "is_empty") return raw === undefined || raw === null || String(raw).trim() === "";
  if (operator === "is_not_empty") return raw !== undefined && raw !== null && String(raw).trim() !== "";

  if (columnType(condition.field, columns) === "number") {
    const rowNum = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
    const condNum = parseFloat(value);
    if (Number.isNaN(condNum)) return true;
    switch (operator) {
      case "eq":
        return rowNum === condNum;
      case "neq":
        return rowNum !== condNum;
      case "lt":
        return rowNum < condNum;
      case "gt":
        return rowNum > condNum;
      case "lte":
        return rowNum <= condNum;
      case "gte":
        return rowNum >= condNum;
      default:
        return true;
    }
  }

  const rowStr = String(raw ?? "").toLowerCase();
  const condStr = value.toLowerCase();
  if (!condStr) return true;
  switch (operator) {
    case "contains":
      return rowStr.includes(condStr);
    case "does_not_contain":
      return !rowStr.includes(condStr);
    case "is":
      return rowStr === condStr;
    case "is_not":
      return rowStr !== condStr;
    default:
      return true;
  }
}

export function applyFilterState<T extends Record<string, unknown>>(
  rows: T[],
  state: FilterState,
  columns: FilterColumn[],
): T[] {
  if (state.conditions.length === 0) return rows;
  const match = state.conjunction === "or" ? "some" : "every";
  return rows.filter((row) => state.conditions[match]((cond) => evaluateCondition(row, cond, columns)));
}

const RADIX_BASE36 = 36;

export function makeFilterCondition(field: string, type: FilterValueType = "string"): FilterCondition {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `cond_${Date.now()}_${Math.random().toString(RADIX_BASE36).slice(2)}`;
  return {
    id,
    field,
    operator: defaultOperatorFor(type),
    value: "",
  };
}
