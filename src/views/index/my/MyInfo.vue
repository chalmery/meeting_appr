<template>
  <v-container  style="background-color: #EEEEEE">
    <v-card class="mt-5">
      <v-card-text>
        <!--头像-->
        <v-tooltip>
          <template v-slot:activator="{ on, attrs }">
            <div class="mx-auto text-center">
              <v-avatar color="success"
                        class="white--text avatar elevation-5"
                        size="100"
                        v-bind="attrs"
                        v-on="on"
                        @click="upload">
                <img :src="`http://img.yangcc.top/`+avatar"
                     lazy-src="http://img.yangcc.top/header.jpg"
                     alt="头像">
              </v-avatar>
            </div>
          </template>
          <span>上传图片</span>
        </v-tooltip>
        <input type="file" id="upload"  ref="upload" @change="changeImg" accept=".jpg, .jpeg, .png" style="width:0;height:0">
        <!--个人信息-->
        <v-container>
          <v-form v-model="valid" ref="form">
            <!--学工号-->
            <v-text-field
                prepend-icon="mdi mdi-face"
                color="success"
                v-model="editItem.username"
                label="学工号"
                :rules="[rules.required,rules.length(20)]">
            </v-text-field>
            <!--院系-->
            <v-select
                prepend-icon="mdi mdi-bank"
                v-model="editItem.faculty.name"
                menu-props="auto"
                color="success"
                :items="faculty.map((map)=>map.name)"
                label="院系"
                :rules="[rules.required]"
            ></v-select>
            <!--密码-->
            <v-text-field
                prepend-icon="mdi mdi-lock-outline"
                color="success"
                type="password"
                v-model="editItem.password"
                label="重置密码">
            </v-text-field>
            <v-text-field
                prepend-icon="mdi mdi-lock-outline"
                color="success"
                type="password"
                v-model="password2"
                :rules="[rules.verify(password2)]"
                label="再次输入密码">
            </v-text-field>
          </v-form>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="deep-purple" class="white--text" @click="clean"><i class="fa fa-times"></i>重置</v-btn>
        <v-btn color="success" :loading="saveLoading" @click="edit"><i class="fa fa-pencil"></i>更改</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "MyInfo",
  data(){
    return{
      valid: true,
      // 保存按钮的样式
      saveLoading: false,
      rules: {
        verify: v=> v===this.editItem.password  || '两次输入密码不一致',
        length: len => v => (v || '').length <= len || `最大长度为: ${len}`,
        required: v => !!v || '不能为空',
      },
      faculty: [],
      //查询到的用户信息
      user: {
        id: '',
        username: '',
        password: '',
        faculty: {
          id: '',
          name: '',
        }
      },
      //修改
      editItem:{
        id: '',
        username: '',
        password: '',
        faculty: {
          id: '',
          name: '',
        }
      },
      password2:'',
      avatar: '',
    };
  },
  created() {
    this.init();
    this.avatar = this.$store.state.avatar;
  },
  methods: {
    upload(){
      let uploadBtn = this.$refs.upload
      uploadBtn.click();
    },
    //修改头像
    async changeImg (e) {
      let formData=new FormData()
      formData.append('file', e.target.files[0]);
      formData.append('id', this.editItem.id);
      this.$axios.post("/user/userEditAvatar",formData,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(res.data.message);
        }
        else {
          this.$message.error(res.data.message);
        }
      }).finally(() => {
        this.init();
      });
    },
    init(){
      //查询全部的院系
      this.$axios.post("/faculty/findAll",null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.faculty = res.data.data
        }
        else {
          this.$message.error(res.data.message);
        }
      })
      //初始化用户信息
      this.$axios.post("/user/findByUsername/"+this.$store.state.username,null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.user = res.data.data
          this.editItem.id = this.user.id;
          this.editItem.username = this.user.username;
          this.editItem.faculty = this.user.faculty;
          //保存用户头像信息
          this.$store.commit("setAvatar",this.user.avatar);
        }
        else {
          this.$message.error(res.data.message);
        }
      })
    },
    //修改
    edit(){
      //拿到院系对应的id
      let f = this.faculty.filter((f) => {
        return f.name === this.editItem.faculty.name;
      });
      this.editItem.faculty.id = f[0].id;
      this.saveLoading = true;
      let validate = this.$refs.form.validate();
      if (validate===true){
        this.$axios.post("/user/userEdit",this.editItem,{
          //加入token
          headers: {
            "Content-Type": "application/json",
            'token': this.$store.state.token.tokenValue,
          }
        }).then((res) => {
          // 如果成功
          if (res.data.code === 200) {
            this.$message.success(res.data.message);
          }
          // 如果后端提示失败打印
          else {
            this.$message.error(res.data.message);
          }
        }).finally(() => {
          this.init();
          this.saveLoading = false;
          this.clean();
        });
      }
    },
    //重置
    clean(){
      this.$nextTick(() => {
        this.editItem.id = this.user.id;
        this.editItem.username = this.user.username;
        this.editItem.password = '';
        this.password2 = '';
        this.editItem.faculty = this.user.faculty;
      })
    },
  }
}
</script>

<style scoped>
.avatar{
  top: -50px;
}
.avatar:hover{
  cursor: pointer;
}
</style>