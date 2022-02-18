export const enum CertificationProcess {
  login = 'login',
  register = 'register',
  updatePassword = 'updatePassword',
}

export const enum ResponseCode {
  /** 网络错误 */
  error,
  /** 成功 */
  success = 200,
  /** 未登录 */
  unLogin = 401,
  /** 权限不足 */
  noPermission = 403,
  /** 请求超时 */
  timeout = 504,
}
