export type ActionSuccess<T> = { success: true; data: T };

export type ActionFailure = {
  success: false;
  error: string;
  code?: string;
  status: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type ActionResult<T = unknown> = ActionSuccess<T> | ActionFailure;

export function actionOk<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

export function actionFail(
  error: string,
  status: number,
  extras?: Pick<ActionFailure, 'code' | 'fieldErrors'>,
): ActionFailure {
  return { success: false, error, status, ...extras };
}
