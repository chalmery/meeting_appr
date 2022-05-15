<template>
  <v-app  style="background-color: #EEEEEE">
    <v-container>
      <!--表格-->
      <v-data-table
          :headers="headers"
          :items="dataList"
          sort-by="calories"
          class="elevation-5 mt-10"
          hide-default-footer
          :page.sync="pagination.currentPage"
          :items-per-page="pagination.pageSize"
          :server-items-length="pagination.total"
          :update:page="handleCurrentPage">
        <!--表格 顶部的工具栏-->
        <template v-slot:top>
          <v-toolbar flat prominent>
            <!--展示表格的icon-->
            <v-card class="white--text success  text-center mycard elevation-5 pa-8" >
              <i class="fa fa-comments fa-2x" />
            </v-card>
            <div class="mt-5 ml-5 text-h6">消息列表</div>
          </v-toolbar>
          <v-container>
            <v-row class="mt-3">
              <v-col cols="1">
                <!--搜索框-->
                <v-text-field  v-model="pagination.message.id"
                               label="#"
                               outlined
                               dense
                               color="success"></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.message.addressee.id"
                               label="发信人id"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.message.meeting.id"
                               label="会议id"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-btn color="success" elevation="5" @click="searchUser"><i class="fa fa-search"></i><span>搜索</span></v-btn>
              </v-col>
              <v-col cols="1" class="ml-5">
                <v-btn color="deep-purple" class="white--text" elevation="5" @click="clean"><i class="fa fa-times"></i><span>重置</span></v-btn>
              </v-col>
            </v-row>
          </v-container>
        </template>

        <!--自定义info列,只展示部分内容-->
        <template v-slot:item.read="{ item }">
          <v-chip v-if="item.read===true" class="elevation-5" label color="success">是</v-chip>
          <v-chip v-else class="elevation-5" label color="warning">否</v-chip>
        </template>
        <!--自定义info列,只展示部分内容-->
        <template v-slot:item.content="{ item }">
          <v-chip class="elevation-5" label color="primary" @click="show(item)">{{ item.content.substring(0,3)+'...' }}</v-chip>
        </template>
        <!--操作的按钮-->
        <template v-slot:item.actions="{ item }">
          <v-btn small elevation="5" color="primary" @click="showAll(item)"><i class="fa fa-eye"></i></v-btn>
        </template>
      </v-data-table>

      <!--分页组件-->
      <v-pagination
          class="mt-10"
          color="success"
          v-model="pagination.currentPage"
          :length="pageCount"
          prev-icon="mdi-menu-left"
          next-icon="mdi-menu-right"
          @input="handleCurrentPage"
      ></v-pagination>
    </v-container>

    <!--content-->
    <v-dialog
        width="600"
        v-model="contentDialog"
        transition="dialog-top-transition">
      <v-card>
        <v-card-title><v-spacer/>消息详情<v-spacer/></v-card-title>
        <v-card-text>
          <v-container>
            <v-textarea :disabled="disable" color="success" outlined
                        v-model="selectContent"
                        :rules="[rules.required,rules.length(200)]" counter></v-textarea>
          </v-container>
        </v-card-text>
        <v-card-actions v-if="disable===false">
          <v-spacer/>
          <v-btn @click="contentDialog=false">取消</v-btn>
          <v-btn color="success" @click="edit">修改</v-btn>
          <v-spacer/>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--content-->
    <v-dialog
        v-model="dialog"
        transition="dialog-top-transition">
      <v-card>
        <v-toolbar  class="text-h6" color="success" dark><v-spacer/>消息详情<v-spacer/></v-toolbar>
        <v-card-text>
          <v-container>
            <div class="text-h6 mt-10">会议信息</div>
            <v-divider/>
            <v-simple-table fixed-header>
              <template v-slot:default>
                <thead>
                <tr>
                  <th>#</th>
                  <th>会议主题</th>
                  <th>开始时间</th>
                  <th>结束时间</th>
                  <th>发起人</th>
                  <th>发起时间</th>
                  <th>描述信息</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>{{ meeting.id }}</td>
                  <td>{{ meeting.name }}</td>
                  <td> <v-chip class="elevation-5" label color="error" >{{meeting.start}}</v-chip></td>
                  <td> <v-chip class="elevation-5" label color="error" >{{meeting.end}}</v-chip></td>
                  <td v-if="meeting.sponsor!==undefined && meeting.sponsor!==null">{{meeting.sponsor.username}}</td>
                  <td>{{meeting.sponsorTime}}</td>
                  <td>{{meeting.info}}</td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>
            <div class="text-h6 mt-10">收件人信息</div>
            <v-divider/>
            <v-simple-table fixed-header>
              <template v-slot:default>
                <thead>
                <tr>
                  <th>#</th>
                  <th>头像</th>
                  <th>学工号</th>
                  <th>所在院系</th>
                  <th>角色</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>{{ user.id }}</td>
                  <td>
                    <v-avatar  size="36px">
                      <v-img alt="Avatar"
                             :src="'http://img.yangcc.top/'+user.avatar"
                             lazy-src="http://img.yangcc.top/header.jpg"
                      ></v-img>
                    </v-avatar>
                  </td>
                  <td>{{ user.username }}</td>
                  <td v-if="user.faculty!==undefined">
                    <v-chip class="elevation-5" color="success" label>{{ user.faculty.name }}</v-chip>
                  </td>
                  <td v-if="user.role!==undefined">
                    <v-chip class="elevation-5" color="warning" label v-if="user.admin===true">
                      {{ user.role.name }}
                    </v-chip>
                    <v-chip class="elevation-5" color="warning" label v-else>
                      {{ user.role.name }}
                    </v-chip>
                  </td>
                </tr>
                </tbody>
              </template>
            </v-simple-table>

          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-app>
</template>


<script>
export default {
  name: "Message",
  data(){
    return{
      contentDialog: false,
      dialog: false,
      disable: true,
      //选择的消息
      id: '',
      selectContent: '',
      //人员详情
      user: '',
      meeting: '',
      //所有的列信息
      headers: [
        {
          text: '#',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'id',
        },
        {
          text: '发送时间',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'sendTime',
        },
        { text: '收信人',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'addressee.id'
        },
        {
          text: '会议id',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'meeting.id',
        },
        {
          text: '是否已读',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'read',
        },
        { text: '消息内容',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'content',
          sortable: false
        },
        { text: '操作',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'actions',
          sortable: false
        },
      ],
      rules: {
        capacityRules: value => {let pattern = /^[0-9]*$/
          return pattern.test(value)|| '只能是数字'},
        length: len => v => (v || '').length <= len || `最大长度为: ${len}`,
        required: v => !!v || '不能为空',
      },

      // 分页相关数据
      pagination:{
        currentPage: 1, // 当前页
        pageSize: 10,  // 每页显示条数
        total: 10,    // 总记录数
        message: { // 查询条件
          id: '',
          addressee: {
            id: '',
          },
          meeting: {
            id: '',
          }
        }
      },
      dataList: [],  // 要展示的数据数组
      pageCount: 1, // 总页码
    };
  },

  created () {
    this.findPage();
  },

  // 所有的方法
  methods: {
    //修改
    edit(){
      //修改消息内容
      this.$axios.post("/message/edit/"+this.id,this.selectContent,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.$message.success(res.data.message);
          this.contentDialog = false;
          this.findPage();
        }
        else {
          this.$message.error(res.data.message);
        }
      })
    },
    // 点击搜索按钮
    searchUser(){
      this.findPage();
    },
   //展示content
    show(item){
      this.id = item.id;
      this.selectContent = item.content;
      //如果消息还未读则让其可读
      if (item.read===false){
        this.disable=false;
      }else{
        this.disable= true;
      }
      this.contentDialog=true;
    },
    //展示消息的全部信息
    showAll(item){
      //根据消息id查询会议详情,收件人信息
      this.$axios.post("/message/findDetail/"+item.id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.user = res.data.data.user;
          this.meeting = res.data.data.meeting;
        }
        else {
          this.$message.error(res.data.message);
        }
      })
      this.dialog=true;
    },
    // 分页查询
    findPage(){
      // 当前页，每页显示记录数，查询条件
      let param ={
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        message: this.pagination.message
      }
      this.$axios.post("/message/findPage",param,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        // 为，总记录数，数据集合赋值
        this.pagination.total = res.data.data.total;
        this.dataList = res.data.data.rows;
        // 总页码赋值
        this.pageCount =Math.ceil(this.pagination.total/this.pagination.pageSize);
      })
    },
    // 页码变化
    handleCurrentPage(currentPage){
      this.pagination.currentPage =currentPage;
      this.findPage();
    },

    clean(){
      this.pagination.message.id = '';
      this.pagination.message.addressee.id = '';
      this.pagination.message.meeting.id = '';
    },
  },
}
</script>

<style scoped>
.mycard{
  width: 100px;
  height: 100px;
  top: -30px;
}
</style>