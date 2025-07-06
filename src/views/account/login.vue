<template>

  <div class="wrapper-padded">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <a href="/public" title="Back to the frontpage">Home</a>
      <span aria-hidden="true">›</span>
      <span>Account</span>
    </nav>
  </div>
  <div class="main-content page-main--wrapper">
    <!-- /templates/customers/login.liquid -->

    <div class="wrapper-padded">
      <div class="grid page-main--wrapper">

        <div class="grid__item large--one-third push--large--one-third text-center">


          <div class="note form-success" id="ResetSuccess" style="display:none;">
            We've sent you an email with a link to update your password.
          </div>

          <div id="CustomerLoginForm" class="form-vertical">
            <el-form
                  ref="loginFormRef"
                  :model="loginFormData"
                  :rules="loginRules"
                  id="customer_login" accept-charset="UTF-8" data-login-with-shop-sign-in="true" data-cptcha="true" data-hcaptcha-bound="true">

              <div class="sitewide--title-wrapper">
                <h1 class="page--title">Login</h1>
              </div>

              <el-form-item prop="telephone">
                <el-input
                  ref="loginForm"
                  v-model="loginFormData.telephone"
                  placeholder="Please input phone number"
                  size="large"
                  class="input-full">
                  <template #prepend>
                    <el-select  size="large" v-model="loginFormData.country" placeholder="Select" class="el-input-select">
                      <el-option label="+1" value="1">+1 Canada</el-option>
                      <el-option label="+44" value="44">+44 England</el-option>
                      <el-option label="+33" value="33">+33 France</el-option>
                      <el-option label="+62" value="62">+62 Indonesia</el-option>
                      <el-option label="+60" value="60">+60 Malaysia </el-option>
                      <el-option label="+65" value="65">+65 Singapore</el-option>
                      <el-option label="+66" value="66">+66 Thailand</el-option>
                      <el-option label="+1" value="1">+1 USA</el-option>
                      <el-option label="+971" value="971">+971 UAE</el-option>
                      <el-option label="+84" value="84">+84 Vietnam</el-option>
                      <el-option label="+82" value="82">+82 대한민국</el-option>
                      <el-option label="+86" value="86">+86 中国</el-option>
                    </el-select>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="loginFormData.password"
                  style="max-width: 600px"
                  placeholder="Please input"
                  size="large"
                  type="password"
                  show-password
                  class="input-full">
                </el-input>
              </el-form-item>


              <p class="input-full">
                <el-button @click="handleLoginSubmit" :loading="loading" block   class="btn--full" type="primary">{{ t("login.login") }}</el-button>

              </p>


              <div flex-center gap-10px>
                <el-text size="default">{{ t("login.noAccount") }}</el-text>
                <router-link to="/ulink_comshop/pages/user/register"   underline="never" >
                  {{ t("login.reg") }}
                </router-link>
              </div>

<!--              <p>
                <el-link href="/account/register" type="primary"  underline="never" >
                  {{ t("login.forgetPassword") }}
                </el-link>
              </p>-->
            </el-form>
          </div>

        </div>

      </div>
    </div>


  </div>


</template>

<script setup lang="ts">
import type { LoginFormData } from "@/api/auth.api";
import { useI18n } from "vue-i18n";
import router from "@/router";

import type { FormInstance } from "element-plus";
import { useUserStore } from "@/store";
import { useRoute } from "vue-router";

const userStore = useUserStore();
const route = useRoute();

const { t } = useI18n();
const loading = ref(false); // 按钮 loading 状态
const loginFormRef = ref<FormInstance>();
const loginFormData = ref<LoginFormData>({
  country:'65',
  telephone: "13380348067",
  password: "123456",
  captchaKey: "",
  captchaCode: "",
  rememberMe: false,
});
const loginRules = computed(() => {
  return {
    telephone: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.telephone.required"),
      },
    ],
    password: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.password.required"),
      },
      {
        min: 6,
        message: t("login.message.password.min"),
        trigger: "blur",
      },
    ],
    captchaCode: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.captchaCode.required"),
      },
    ],
  };
});
async function handleLoginSubmit() {
  try {
    // 1. 表单验证
    const valid = await loginFormRef.value?.validate();
    if (!valid) return;

    loading.value = true;

    // 2. 执行登录
    await userStore.login(loginFormData.value);

    // 3. 获取用户信息
    await userStore.getUserInfo();
    // 4. 解析并跳转目标地址
    const redirect = resolveRedirectTarget(route.query);
    await router.push(redirect);

    // TODO 5. 判断用户是否点击了记住我？采用明文保存或使用jsencrypt库？
  } catch (error) {
    // 5. 统一错误处理
    ElMessage.warning(error);
    console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
}
/**
 * 解析重定向目标
 * @param query 路由查询参数
 * @returns 标准化后的路由地址对象
 */
function resolveRedirectTarget(query: LocationQuery): RouteLocationRaw {
  // 默认跳转路径
  const defaultPath = "/";

  // 获取原始重定向路径
  const rawRedirect = (query.redirect as string) || defaultPath;

  try {
    // 6. 使用Vue Router解析路径
    const resolved = router.resolve(rawRedirect);
    return {
      path: resolved.path,
      query: resolved.query,
    };
  } catch {
    // 7. 异常处理：返回安全路径
    return { path: defaultPath };
  }
}
</script>

<style lang="scss" >

.el-input-select{
  width: 90px;
  --el-input-border: transparent;
}

input:focus, select:focus, textarea:focus {
  border: 0px solid var(--border-color-darken10);
}
.form-vertical input, .form-vertical select, .form-vertical textarea {
  display: block;
  margin-bottom: 0px;
}
#CustomerLoginForm .input-full {

  padding: 5px 0px;
}
#CustomerLoginForm input:focus, #RecoverPasswordForm input:focus, #create_customer input:focus {
  border: 0;
  border-bottom: 0px solid rgba(26,26,26,.5);
}

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-plus css */
.login-container {
  .el-input {
    height: 47px;
    width: 85%;

    .el-input__wrapper,
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      box-shadow: none;
    }

    input {
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor  !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
