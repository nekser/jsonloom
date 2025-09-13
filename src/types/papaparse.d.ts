declare module "papaparse" {
  interface ParseResult<T> {
    data: T[];
    errors: Array<{ row?: number; message: string; type?: string }>;
    meta: unknown;
  }
  interface ParseConfig<T> {
    header?: boolean;
    dynamicTyping?: boolean;
    skipEmptyLines?: boolean | string;
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    transformHeader?(header: string): string;
    complete?(results: ParseResult<T>): void;
  }
  const Papa: {
    parse<T = Record<string, unknown>>(input: string, config?: ParseConfig<T>): ParseResult<T>;
  };
  export default Papa;
}
