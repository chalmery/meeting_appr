<template>
  <v-app>
    <div class="background">
      <div class="color">
        <v-card class="login">
          <!--顶部logo-->
          <v-card class="white--text success mycard text-center mb-5 pa-7 elevation-5">
            <div class="text-h6">
              <strong>用户登录</strong>
            </div>
          </v-card>
          <!--下方输入框-->
          <v-container>
            <v-text-field
                prepend-icon="mdi mdi-face"
                color="success"
                label="学工号"
                type="text"
                v-model="username"
                :rules="usernameRules"
            />
            <v-text-field
                prepend-icon="mdi mdi-lock-outline"
                color="success"
                label="密码"
                type="password"
                v-model="password"
                :type="show ? 'text' : 'password'"
                @click:append="show = !show"
                :rules="passwordRules"
            />
            <v-btn block color="success" class="mt-3" @click="vuetify">登录</v-btn>
            <!--滑动拼图验证组件-->
            <Verify @success="success"
                    :mode="'pop'"
                    :captchaType="'blockPuzzle'"
                    :imgSize="{ width: '330px', height: '155px' }"
                    ref="verify"
            ></Verify>
          </v-container>
        </v-card>
      </div>
    </div>
  </v-app>
</template>

<script>
import Verify from "./../components/verifition/Verify";
export default {
  name: "Login",
  components: {
    Verify,
  },
  data(){
    return{
      show: false, //验证图片是否展示
      // 保存账户信息
      username: '',
      password: '',
      alert: false,
      // 提示框内的文本
      text: '',
      // 表单校验
      type: 'success',
      usernameRules: [
        value => !!value || '不能为空'],
      passwordRules: [
        value => !!value || '不能为空',
      ],
    };
  },
  methods:{
    // 点击登录后显示滑动框
    vuetify(){
      // 先检测账号密码的输入问题
      if (this.username ===''|| this.password===''||this.username===null || this.password===null
      ||this.username===undefined||this.password===undefined){
        this.$message.error("请检查输入是否规范")
      }
      else {
        this.$refs.verify.show()
      }

    },
    // 验证成功的回调函数
    success(params){
      this.$axios.post("/login/verify",params)
          .then((response)=>{
            // 如果通过二次验证，则验证账号密码
            if (response.data.repCode ==='0000'){
              this.login();
            }
            else{
              this.$message.error("验证失败，没有通过第二次验证")
            }
          })
          // 如果验证失败，打印服务器返回信息
          .catch(()=>{
            this.$message.error("验证失败")
          })
    },
    // 关闭alert
    closeAlert(){
      this.alert =false;
    },
    //登录
    login(){
      this.$axios.post("/login/login",{
        username: this.username,
        password: this.password
      }).then((response)=>{
            // 如果密码账号没问题
            if (response.data.code===200){
              this.$message.success("登录成功")
              //保存token
              this.$store.commit("setTokenName",response.data.data.tokenName);
              this.$store.commit("setTokenValue",response.data.data.tokenValue);
              //保存用户名
              this.$store.commit("setUsername",this.username);
              //跳转页面
              this.$router.push("/home")
            }
          })
    }
  },
  created() {
    //删除过期token
    this.$store.commit("setTokenName",'');
    this.$store.commit("setTokenValue",'');
    this.$store.commit("setUsername", '');
    //清空sessionStorage
    sessionStorage.clear();
  },
}
</script>

<style scoped>
/*背景图片*/
.background{
  position: absolute;
  background-image: url("http://img.yangcc.top/image1.jpg");
  background-size: cover; /*自适应*/
  width: 100%;
  height: 100%;
}
/*黑色图层*/
.color{
  height:100%;
  width:100%;
  background: rgba(0,0,0,0.4);
}
/*登录框在页面中央*/
.login{
  position: absolute;
  z-index: 1;
  width: 350px;
  height: 370px;
  left: 50%;
  top: 50%;
  margin-left: -175px;
  margin-top: -185px;
  padding: 20px;
}
/*标题突出一部分*/
.mycard{
  width: 100%;
  height: 100px;
  margin-top: -40px;
}
</style>