<template>
  <v-app style="background-color: #EEEEEE">
    <!--顶部导航-->
    <v-app-bar app flat   absolute>
      <v-app-bar-nav-icon @click="permanent=!permanent;mini=!mini"/>
      <v-list-item-title class="body-1 ml-3">{{ title }}</v-list-item-title>
      <v-spacer/>
      <!--消息盒子-->
      <v-menu   offset-y
                transition="slide-y-transition"
                :close-on-content-click="true">
        <!--消息盒子的按钮-->
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon small large
                 v-bind="attrs"
                 v-on="on"
                 class="mr-5">
            <v-badge v-model="badge"  left color="pink" :content="unreadMessageNum">
              <i class="fa fa-bell-o fa-lg"></i>
            </v-badge>
          </v-btn>
        </template>
        <!--点击要展开的数据-->
        <v-list width="300">
          <!--顶部按钮-->
          <v-list-item>
            <v-btn elevation="0" @click="gotoMessage">查看全部消息</v-btn>
            <v-spacer/>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn small large icon @click="allRead">
                  <i v-bind="attrs" v-on="on" class="fa fa-envelope-open"></i>
                </v-btn>
              </template>
              <span>全部标记为已读</span>
            </v-tooltip>
          </v-list-item>
          <v-divider/>
          <!--下部分消息内容-->
          <v-virtual-scroll
              :items="message"
              height="300"
              item-height="64"
          >
            <template v-slot:default="{ item }">
              <v-list dense>
                <v-list-item-group color="success">
                  <v-list-item :key="item.id">
                    <v-list-item-content>
                      <v-list-item-title @click="messageDialog(item)">
                        {{item.content.substring(0,10)+`....`}}
                      </v-list-item-title>
                    </v-list-item-content>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn small large icon>
                          <i v-bind="attrs" v-on="on" class="fa fa-envelope-open" @click="haveRead(item)"></i>
                        </v-btn>
                      </template>
                      <span>标记为已读</span>
                    </v-tooltip>
                  </v-list-item>
                </v-list-item-group>

              </v-list>
            </template>
          </v-virtual-scroll>
        </v-list>
      </v-menu>


      <!--个人信息-->
      <v-menu offset-y  transition="slide-y-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-avatar
              v-bind="attrs"
              v-on="on"
              size="30">
            <v-img
                :src="'http://img.yangcc.top/'+avatar"
                lazy-src="http://img.yangcc.top/header.jpg"
                alt="Avatar"/>
          </v-avatar>
        </template>
        <v-list dense>
          <v-list-item @click="myInfo">
            <v-icon small class=mr-3>fa fa-pencil-square-o</v-icon>
            <span class="body-2">我的信息</span>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="signOut">
            <v-icon small class=mr-3>fa fa-sign-out</v-icon>
            <span class="body-2">退出</span>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <!--导航抽屉-->
    <v-navigation-drawer
        src="http://img.yangcc.top/image1.jpg"
        :dark="barColor !== 'rgba(228, 226, 226, 1)'"
        app
        v-model="drawer"
        :mini-variant="mini"
        :permanent="permanent">
      <template v-slot:img="props">
        <v-img
            :gradient="`to bottom, ${barColor}`"
            v-bind="props"
        />
      </template>
      <!--上方标题-->
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-center mt-3 text-h6">
            <strong>高校会议审批</strong>
          </v-list-item-title>
          <v-divider class="mt-5"/>
        </v-list-item-content>
      </v-list-item>

      <!--路由列表-->
      <v-list  nav>
        <div v-for="item in  menuList" :key="item.id">
          <!--如果没有子路由-->
          <div v-if="item.children.length===0">
            <v-list-item
                @click="title = item.name"
                :to="item.path"
                active-class="success white--text"
                color="success"
            >
              <!--二级icon-->
              <v-icon
                  small
                  color="white"
                  class="mr-3">{{ item.icon }}</v-icon>
              <v-list-item-content
                  class="white--text">
                {{item.name}}
              </v-list-item-content>
            </v-list-item>
          </div>
          <!--如果有子路由-->
          <div v-else>
            <v-list-group
                @click="title = item.name"
                append-icon="mdi-menu-up"
                color="success"
            >
              <!--icon-->
              <template v-slot:activator>
                <v-icon
                    small
                    color="white"
                    class="mr-3">
                  {{item.icon}}
                </v-icon>
                <!--title-->
                <v-list-item-content>
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                </v-list-item-content>
              </template>
              <!--二级菜单-->
              <v-list-item
                  @click="title = item.name +' / '+subItem.name "
                  v-for="subItem in item.children"
                  :key="subItem.id"
                  :to="item.path + subItem.path"
                  active-class="success white--text"
                  color="success"
                  dense
              >
                <!--二级icon-->
                <v-icon
                    small
                    color="white"
                    class="mr-3 ml-5">{{ subItem.icon }}</v-icon>
                <v-list-item-content
                    class="white--text">
                  {{subItem.name}}
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </div>
        </div>
      </v-list>
    </v-navigation-drawer>

    <!--消息内容-->
    <v-dialog
        v-model="snackbar"
        transition="dialog-top-transition"
        max-width="600">
      <v-card>
        <v-card-text class="subtitle-1 black--text">
          <v-container>
            {{selectMessage.content}}
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          时间：<v-chip color="success" label>{{selectMessage.sendTime}}</v-chip>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--主页-->
    <v-main app>
      <v-container>
        <router-view/>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "Index",
  data(){
    return{
      // 导航相关
      drawer: true,
      mini: false,     // 默认不是mini
      permanent:true,  // 默认是侧栏展开
      title: "首页", // 默认首页
      avatar: 'header.jpg',
      menuList: [],
      // 用户消息相关
      unreadMessageNum: 0,
      barColor: 'rgba(0, 0, 0, 0.7), rgba(0, 0, 0,0.7)',
      // 用户导航相关
      user_menu: [
        { title: '我的信息',icon: 'fa fa-home'},
        { title: '退出' ,icon: 'fa fa-home'},
      ],
      //消息列表
      message: [],
      //选择的消息对象
      selectMessage: '',
      //消息
      snackbar: false,
      badge: false,
    };
  },
  created() {
    //在页面加载时读取sessionStorage里的状态信息
    if (sessionStorage.getItem("store") ) {
      this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(sessionStorage.getItem("store"))))
    }
    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener("beforeunload",()=>{
      sessionStorage.setItem("store",JSON.stringify(this.$store.state))
    })
    this.initMenu();
    this.findAllMessage();
  },
  methods:{
    gotoMessage(){
      //路由到登录页面
      this.$router.push("/my/myMessage")
    },
    //全部已读
    allRead(){
      this.$axios.post("/message/haveReadAll/"+this.$store.state.username,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.findAllMessage();
        }
      })
    },
    //消息详情
    messageDialog(item){
      //修改此消息为已读消息
      this.$axios.post("/message/haveRead/"+item.id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      })
      this.findAllMessage();
      this.selectMessage = item;
      this.snackbar = true;
    },
    haveRead(item){
      this.$axios.post("/message/haveRead/"+item.id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      })
      this.findAllMessage();
    },
    initMenu(){
      // 获取此用户对应的菜单信息
      this.$axios.post("/menu/findByUsername/"+this.$store.state.username,null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.menuList = res.data.data;
        }else {
          this.$message.error(res.data.message);
        }
      })
      //获取用户头像信息
      this.$axios.post("/user/findAvatarByUsername/"+this.$store.state.username,null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.$store.commit("setAvatar",res.data.data);
          this.avatar = this.$store.state.avatar;
        }else {
          this.$message.error(res.data.message);
        }
      })
    },
    //我的信息
    myInfo(){
      //路由到登录页面
      this.$router.push("/my/myInfo")
    },
    //登出
    signOut(){
      this.$axios.post("/login/logout",null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          //删除过期token
          this.$store.commit("setTokenName",'');
          this.$store.commit("setTokenValue",'');
          this.$store.commit("setUsername", '');
          //清空sessionStorage
          sessionStorage.clear();
          this.$message.success(res.data.message);
          //路由到登录页面
          this.$router.push("/login")
        }
        else {
          this.$message.error(res.data.message);
        }
      })
    },
    //查询所有未读消息
    findAllMessage(){
      this.$axios.post("/message/findAllReadMessage/"+this.$store.state.username,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.message = res.data.data;
          this.unreadMessageNum = this.message.length;
          if (this.unreadMessageNum===0){
            this.badge = false;
          }else {
            this.badge = true;
          }
        }else {
          this.$message.error(res.data.message);
        }
      })
    }
  },
}
</script>

<style scoped>
.my:hover{
  cursor: pointer;
}
</style>