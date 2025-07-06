import { store } from "@/store";

import AuthAPI, { type LoginFormData } from "@/api/auth.api";
import UserAPI, { type UserInfo } from "@/api/system/user.api";

import { setAccessToken, setRefreshToken, getRefreshToken, clearToken, getAccessToken } from "@/utils/auth";

export const useUserStore = defineStore("user", () => {
  const userInfo = useStorage<UserInfo>("userInfo", {} as UserInfo);

  /**
   * 登录
   *
   * @param {LoginFormData}
   * @returns
   */
  function login(LoginFormData: LoginFormData) {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.login(LoginFormData)
        .then((data) => {

          if(data['member_id'] > 0){
            const { token } = data;
            setAccessToken(token); // eyJhbGciOiJIUzI1NiJ9.xxx.xxx
            resolve();
          }else{
            reject("Login failed: Incorrect mobile phone number or password");
          }


        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  function check_login() {
    return new Promise<void>((resolve, reject) => {
      const token = getAccessToken();
      AuthAPI.check_login(token).then((res)=>{
        if(res['code'] ==0 && res['data']){
          resolve(true);
        }else{
          clearToken()
          reject(false);
        }
      }).catch((error) => {
        clearToken()
        reject(false);
      });
    })

  }

  /**
   * 获取用户信息
   *
   * @returns {UserInfo} 用户信息
   */
  function getUserInfo() {
    return new Promise((resolve, reject) => {
      UserAPI.getInfo()
        .then((data) => {
          console.log(data)
          if (data.code!=0) {
            reject("Verification failed, please Login again.");
            return;
          }

          Object.assign(userInfo.value, { ...data.data });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 登出
   */
  function logout() {
    return new Promise<void>((resolve, reject) => {
      AuthAPI.logout()
        .then(() => {
          clearSessionAndCache();
          resolve();
        })
        .catch((error) => {
          clearSessionAndCache();
          reject(error);
        });
    });
  }

  /**
   * 刷新 token
   */
  function refreshToken() {
    const refreshToken = getRefreshToken();
    return new Promise<void>((resolve, reject) => {
      AuthAPI.refreshToken(refreshToken)
        .then((data) => {
          const { accessToken, refreshToken } = data;
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          resolve();
        })
        .catch((error) => {
          console.log(" refreshToken  刷新失败", error);
          reject(error);
        });
    });
  }

  /**
   * 清除用户会话和缓存
   */
  function clearSessionAndCache() {
    return new Promise<void>((resolve) => {
      clearToken();
      userInfo.value = {} as UserInfo;
      resolve();
    });
  }

  return {
    userInfo,
    getUserInfo,
    login,
    logout,
    clearSessionAndCache,
    refreshToken,
    check_login
  };
});

/**
 * 用于在组件外部（如在Pinia Store 中）使用 Pinia 提供的 store 实例。
 * 官方文档解释了如何在组件外部使用 Pinia Store：
 * https://pinia.vuejs.org/core-concepts/outside-component-usage.html#using-a-store-outside-of-a-component
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
