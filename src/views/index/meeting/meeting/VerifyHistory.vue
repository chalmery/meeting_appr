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
          <v-toolbar flat>
            <!--展示表格的icon-->
            <v-card class="white--text success  text-center mycard elevation-5 pa-8" >
              <i class="fa fa-history fa-2x" />
            </v-card>
            <div class="mt-5 ml-5 text-h6">审批历史</div>
          </v-toolbar>
          <v-container>
            <v-row class="mt-3">
              <v-col cols="1">
                <!--搜索框-->
                <v-text-field  v-model="pagination.meeting.id"
                               label="#"
                               outlined
                               dense
                               color="success"></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.meeting.name"
                               label="会议名称"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.meeting.sponsor.username"
                               label="发起人"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="1">
                <v-btn color="success" elevation="5" @click="search"><i class="fa fa-search"></i><span>搜索</span></v-btn>
              </v-col>
              <v-col cols="1" class="ml-5">
                <v-btn color="deep-purple" class="white--text" elevation="5" @click="clean"><i class="fa fa-times"></i><span>重置</span></v-btn>
              </v-col>
            </v-row>
          </v-container>
        </template>

        <!--会议名称-->
        <template v-slot:item.name="{item}">
          <v-chip class="elevation-5" label color="primary">{{ item.name.substring(0,3)+'..'}}</v-chip>
        </template>
        <!--会议状态-->
        <template v-slot:item.status="{item}">
          <v-chip  v-if="item.status==='未进行'" class="elevation-5" label >{{ item.status}}</v-chip>
          <v-chip v-if="item.status==='正在进行'" class="elevation-5" label color="success">{{ item.status}}</v-chip>
          <v-chip v-if="item.status==='已经结束'" class="elevation-5" label color="primary">{{ item.status}}</v-chip>
        </template>
        <!--审核状态-->
        <template v-slot:item.approvalStatus="{item}">
          <v-chip v-if="item.approvalStatus==='未审核'" class="elevation-5" label >{{ item.approvalStatus}}</v-chip>
          <v-chip v-if="item.approvalStatus==='审核未通过'" class="elevation-5" label color="error" >{{ item.approvalStatus}}</v-chip>
          <v-chip v-if="item.approvalStatus==='审核通过'" class="elevation-5" label color="success">{{ item.approvalStatus}}</v-chip>
        </template>
        <!--会议简介-->
        <template v-slot:item.info="{item}">
          <v-chip class="elevation-5" label color="primary">{{ item.info.substring(0,3)+'..'}}</v-chip>
        </template>
        <!--操作的按钮-->
        <template v-slot:item.actions="{ item }">
          <v-btn small elevation="5" color="primary" @click="verify(item)"><i class="fa fa-eye"></i></v-btn>
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

      <!--弹出框-->
      <v-dialog v-model="dialog"  transition="dialog-top-transition">
        <v-card>
          <v-toolbar class="text-h6" color="success" dark>
            <v-spacer/>会议审核<v-spacer/>
          </v-toolbar>
          <v-card-text>
            <v-container>
              <div class="text-h6">会议信息</div>
              <v-divider/>
              <v-simple-table fixed-header>
                <template v-slot:default>
                  <thead>
                  <tr>
                    <th>#</th>
                    <th>会议主题</th>
                    <th>开始时间</th>
                    <th>结束时间</th>
                    <th>状态</th>
                    <th>发起人</th>
                    <th>发起时间</th>
                    <th>审核状态</th>
                    <th>描述信息</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>{{ selectMeeting.id }}</td>
                    <td>{{ selectMeeting.name }}</td>
                    <td>{{selectMeeting.start}}</td>
                    <td>{{selectMeeting.end}}</td>
                    <td> <v-chip class="elevation-5" label >{{selectMeeting.status}}</v-chip></td>
                    <td v-if="selectMeeting.sponsor!==undefined">{{selectMeeting.sponsor.username}}</td>
                    <td>{{selectMeeting.sponsorTime}}</td>
                    <td> <v-chip class="elevation-5" label >{{selectMeeting.approvalStatus}}</v-chip></td>
                    <td>{{selectMeeting.info}}</td>
                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <div class="text-h6 mt-10">会议室信息</div>
              <v-divider/>
              <v-simple-table fixed-header>
                <template v-slot:default>
                  <thead>
                  <tr>
                    <th>#</th>
                    <th>会议室</th>
                    <th>房间</th>
                    <th>状态</th>
                    <th>容量</th>
                    <th>描述信息</th>
                    <th>对应的院系</th>
                    <th>院系地点</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>{{ meetingRoom.id }}</td>
                    <td>
                      <v-img :src="`http://img.yangcc.top/`+meetingRoom.img" lazy-src="http://img.yangcc.top/image1.jpg" width="200"></v-img>
                    </td>
                    <td>{{ meetingRoom.room }}</td>
                    <td>
                      <v-chip class="elevation-5" color="success" label>{{ meetingRoom.status }}</v-chip>
                    </td>
                    <td>{{meetingRoom.capacity}}</td>
                    <td>{{meetingRoom.info}}</td>
                    <td v-if="meetingRoom.faculty!==undefined">{{meetingRoom.faculty.name}}</td>
                    <td v-if="meetingRoom.faculty!==undefined">{{meetingRoom.faculty.location}}</td>
                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
              <div class="text-h6 mt-10">参会人员信息</div>
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
                  <tr v-for="item in members" :key="item.id">
                    <td>{{ item.id }}</td>
                    <td>
                      <v-avatar  size="36px">
                        <v-img alt="Avatar"
                               :src="'http://img.yangcc.top/'+item.avatar"
                               lazy-src="http://img.yangcc.top/header.jpg"
                        ></v-img>
                      </v-avatar>
                    </td>
                    <td>{{ item.username }}</td>
                    <td v-if=" item.faculty!==undefined">
                      <v-chip class="elevation-5" color="success" label>{{ item.faculty.name }}</v-chip>
                    </td>
                    <td  v-if=" item.role!==undefined">
                      <v-chip class="elevation-5" color="warning" label v-if="item.admin===true">
                        {{ item.role.name }}
                      </v-chip>
                      <v-chip class="elevation-5" color="warning" label v-else>
                        {{ item.role.name }}
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
    </v-container>
  </v-app>
</template>

<script>
export default {
  name: "VerifyHistory",
  data() {
    return {
      dialog: false,
      headers: [
        {
          text: '#',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'id',
        },
        {
          text: '会议名称',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'name',
        },
        { text: '开始时间',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'start'
        },
        {
          text: '结束时间',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'end',
        },
        { text: '状态',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'status'
        },
        {
          text: '审核',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'approvalStatus'
        },
        {
          text: '发起人',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'sponsor.username'
        },
        { text: '发起时间',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'sponsorTime',
          sortable: false
        },
        { text: '简介',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'info',
          sortable: false
        },
        { text: '操作',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'actions',
          sortable: false
        },
      ],

      // 分页相关数据
      pagination:{
        currentPage: 1, // 当前页
        pageSize: 10,  // 每页显示条数
        total: 10,    // 总记录数
        meeting: { // 查询条件
          id: '',
          name: '',
          sponsor: {
            username: ''
          }
        }
      },
      dataList: [],  // 要展示的数据数组
      pageCount: 1, // 总页码
      //查询的会议室信息
      meetingRoom: '',
      //参会人员信息
      members:[],
      //选择的会议信息
      selectMeeting: '',
    };
  },
  created() {
    this.findPage();
  },
  methods: {
    // 页码变化
    handleCurrentPage(currentPage){
      this.pagination.currentPage =currentPage;
      this.findPage();
    },
    // 分页查询
    findPage(){
      // 当前页，每页显示记录数，查询条件
      let param ={
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        meeting: this.pagination.meeting
      }
      this.$axios.post("/meeting/findPageByVerifyHistory",param,{
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

    //搜索
    search(){
      this.findPage();
    },
    // 清除搜索条件
    clean(){
      this.pagination.meeting.id = '';
      this.pagination.meeting.name = '';
      this.pagination.meeting.status = '';
    },

    //审核页面打开
    verify(item){
      this.selectMeeting = item;
      //查询此会议对应的会议室信息
      this.$axios.post("/meetingRoom/findByMeetingId/"+item.id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.meetingRoom = res.data.data;
        }else {
          this.$message.error(res.data.message);
        }
      })
      //查询此会议人员信息
      this.$axios.post("/user/findByMeetingId/"+item.id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.members = res.data.data;
        }else {
          this.$message.error(res.data.message);
        }
      })
      this.dialog = true;
    },
  },
}
</script>

<style scoped>

</style>