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
            <div class="mt-5 ml-5 text-h6">我的消息列表</div>
          </v-toolbar>
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
            <v-textarea disabled color="success" outlined
                        v-model="selectContent" counter></v-textarea>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>


  </v-app>
</template>

<script>
export default {
  name: "MyMessage",
  data(){
    return{
      contentDialog: false,
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
        {
          text: '是否已读',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'read',
        },
        {
          text: '会议id',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'meeting.id',
        },
        { text: '消息内容',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'content',
          sortable: false
        },
      ],
      // 分页相关数据
      pagination:{
        currentPage: 1, // 当前页
        pageSize: 10,  // 每页显示条数
        total: 10,    // 总记录数
        message: { // 查询条件
          id: '',
          addressee: {
            id: '',
            username: '',
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
    //展示content
    show(item){
      this.id = item.id;
      this.selectContent = item.content;
      //如果消息是未读状态修改为已读
      if (item.read===false){
        this.$axios.post("/message/haveRead/"+item.id,null,{
          //加入token
          headers: {
            'Content-Type': 'application/json',
            'token': this.$store.state.token.tokenValue,
          }
        })
      }
      this.contentDialog=true;
    },
    // 分页查询
    findPage(){
      this.pagination.message.addressee.username = this.$store.state.username;
      // 当前页，每页显示记录数，查询条件
      let param ={
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        message: this.pagination.message
      }
      this.$axios.post("/message/findPageByUser",param,{
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