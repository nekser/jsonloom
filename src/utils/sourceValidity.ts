export type SourceJsonValidity = {
  text: "Valid JSON" | "Invalid JSON";
  isValid: boolean;
  className: string;
};

export function getSourceJsonValidity(sourceError?: string): SourceJsonValidity {
  if (sourceError) {
    return {
      text: "Invalid JSON",
      isValid: false,
      className: "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900",
    };
  }

  return {
    text: "Valid JSON",
    isValid: true,
    className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900",
  };
}
