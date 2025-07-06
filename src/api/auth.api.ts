import request from "@/utils/request";


const AuthAPI = {
  /** 登录接口*/
  login(data: LoginFormData) {
    const formData = new FormData();
    formData.append("country", data.country);
    formData.append("user", data.telephone);
    formData.append("password", data.password);

    return request<any, LoginResult>({
      url: `wxapp.php?controller=user.weblogin_do`,
      method: "get",
      params: {
        'country':data.country,
        'user':data.telephone,
        'passwd':data.password
      },
    });
  },

  check_login(token){
    return request({
      url: `wxapp.php?controller=user.check_login`,
      method: "get",
      params: {token}
    });
  },

  /** 刷新 token 接口*/
  refreshToken(refreshToken: string) {
    return request<any, LoginResult>({
      url: `${AUTH_BASE_URL}/refresh-token`,
      method: "post",
      params: { refreshToken: refreshToken },
      headers: {
        Authorization: "no-auth",
      },
    });
  },

  /** 注销登录接口 */
  logout() {
    return request({
      url: `wxapp.php?controller=user.logout`,
      method: "get"
    });
  },

  /** 获取验证码接口*/
  getCaptcha() {
    return request<any, CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "get",
    });
  },
};

export default AuthAPI;

/** 登录表单数据 */
export interface LoginFormData {
  country: string
  /** 用户名 */
  telephone: string;
  /** 密码 */
  password: string;
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码 */
  captchaCode: string;
  /** 记住我 */
  rememberMe: boolean;
}

/** 登录响应 */
export interface LoginResult {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间(秒) */
  expiresIn: number;
}

/** 验证码信息 */
export interface CaptchaInfo {
  /** 验证码缓存key */
  captchaKey: string;
  /** 验证码图片Base64字符串 */
  captchaBase64: string;
}
