<template>

  <div class="wrapper-padded">
    <nav class="breadcrumb" aria-label="breadcrumbs">
      <a href="/" title="Back to the frontpage">Home</a>
      <span aria-hidden="true">›</span>
      <span>Create account</span>
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
            <el-form  ref="formRef"
                    :model="registerFormData" :rules="rules"
                  id="customer_login" accept-charset="UTF-8" data-login-with-shop-sign-in="true" data-cptcha="true" data-hcaptcha-bound="true">

              <div class="sitewide--title-wrapper">
                <h1 class="page--title">Create account</h1>
              </div>

              <el-form-item prop="username">
                <el-input
                  ref="loginForm"
                  v-model="registerFormData.username"
                  placeholder="Please input name"
                  size="large"
                  class="input-full">

                </el-input>
              </el-form-item>

              <el-form-item prop="telephone">
                <el-input
                  ref="loginForm"
                  v-model="registerFormData.telephone"
                  placeholder="Please input phone number"
                  size="large"
                  class="input-full">
                  <template #prepend>
                    <el-select  size="large" v-model="registerFormData.country" placeholder="Select" class="el-input-select">
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

              <!-- 密码 -->
              <el-form-item prop="password">
                <el-input
                  v-model.trim="registerFormData.password"
                  :placeholder="t('login.password')"
                  type="password"
                  show-password
                  size="large"
                  class="input-full"
                  @keyup.enter="submit"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input
                  v-model.trim="registerFormData.confirmPassword"
                  :placeholder="t('login.message.password.confirm')"
                  type="password"
                  size="large"
                  show-password
                  class="input-full">
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <p class="input-full">
                <input type="button" @click="submit" class="btn btn--full account-section--btn " value="Create">
              </p>

              <div flex-center gap-10px>
                <el-text size="default">{{ t("login.haveAccount") }}</el-text>
                <router-link  underline="never" to="/ulink_comshop/pages/user/login" >{{ t("login.login") }}</router-link>
              </div>


            </el-form>
          </div>



        </div>

      </div>
    </div>


  </div>


</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import type { FormInstance } from "element-plus";
import { Lock } from "@element-plus/icons-vue";

const formRef = ref<FormInstance>();

const registerFormData = ref({
  country:'65',
  username: "",
  telephone:'',
  password: "",
  confirmPassword:''
});
const rules = computed(() => {
  return {
    username: [
      {
        required: true,
        trigger: "blur",
        message: t("login.message.username.required"),
      },
    ],
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
    confirmPassword: [
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
      {
        validator: (_: any, value: string) => {
          return value === model.value.password;
        },
        trigger: "blur",
        message: t("login.message.password.inconformity"),
      },
    ]
  };
});
const submit = async () => {
  await formRef.value?.validate();
  ElMessage.warning("开发中 ...");
};
</script>

<style lang="scss">
.el-input {

  --el-input-text-color: var(--el-text-color-regular);
  --el-input-border: transparent;
  --el-input-hover-border: var(--el-border-color-hover);
  --el-input-focus-border: var(--el-color-primary);
  --el-input-transparent-border: 0 0 0 0px transparent inset;
  --el-input-border-color: var(--el-border-color);
  --el-input-border-radius: var(--el-border-radius-base);
  --el-input-bg-color: var(--el-fill-color-blank);
  --el-input-icon-color: var(--el-text-color-placeholder);
  --el-input-placeholder-color: var(--el-text-color-placeholder);
  --el-input-hover-border-color: var(--el-border-color-hover);
  --el-input-clear-hover-color: var(--el-text-color-secondary);
  --el-input-focus-border-color: var(--el-color-primary);
  --el-input-width: 100%;
}
.el-input-select{
  width: 90px;
  --el-input-border: transparent;
}
#CustomerLoginForm .input-full {

  padding: 5px 0px;
}
input:focus, select:focus, textarea:focus {
  border: 0px solid var(--border-color-darken10);
}
.form-vertical input, .form-vertical select, .form-vertical textarea {
  display: block;
  margin-bottom: 0px;
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
    margin-bottom:2px
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
  .el-form-item--default{
    margin-bottom:2px
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
