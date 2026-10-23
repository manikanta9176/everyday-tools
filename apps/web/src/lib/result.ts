export type ToolSuccess<T> = { ok: true; value: T };
export type ToolFailure = { ok: false; error: string };
export type ToolResult<T> = ToolSuccess<T> | ToolFailure;

export function ok<T>(value: T): ToolSuccess<T> {
  return { ok: true, value };
}

export function fail(error: string): ToolFailure {
  return { ok: false, error };
}

export function fromThrowable<T>(fn: () => T): ToolResult<T> {
  try {
    return ok(fn());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Something went wrong.");
  }
}
