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
          :loading="loading"
          :update:page="handleCurrentPage">
        <!--表格 顶部的工具栏-->
        <template v-slot:top>
          <v-toolbar flat>
            <!--展示表格的icon-->
            <v-card class="white--text success  text-center mycard elevation-5 pa-8" >
              <i class="fa  fa-home fa-2x" />
            </v-card>
            <div class="mt-5 ml-5 text-h6">会议室信息表</div>
            <v-spacer></v-spacer>
            <!--新建会议按钮-->
            <v-btn color="success" elevation="5" dark class="mt-5" @click="showCreateDialog">新建会议室</v-btn>
          </v-toolbar>
          <v-container>
            <v-row class="mt-3">
              <v-col cols="1">
                <!--搜索框-->
                <v-text-field  v-model="pagination.meetingRoom.id"
                               label="#"
                               outlined
                               dense
                               color="success"></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.meetingRoom.capacity"
                               label="容纳人数"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.meetingRoom.faculty.name"
                               label="位置"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.meetingRoom.faculty.location"
                               label="地点"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.meetingRoom.status"
                               label="状态"
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


        <!--操作的按钮-->
        <template v-slot:item.actions="{ item }">
          <v-btn small elevation="5" color="success" class="mr-2" @click="editItem(item)"><i class="fa fa-pencil"></i></v-btn>
          <v-btn small elevation="5" color="error" @click="deleteItem(item)"><i class="fa fa-times"></i></v-btn>
        </template>

        <!--第一列展示图片-->
        <template v-slot:item.img="{item}">
          <v-img :src="`http://img.yangcc.top/`+item.img"
                 lazy-src="http://img.yangcc.top/image1.jpg" width="150" height="75"
                 class="img" @click.stop="showImg(item)">
            <!--当图片有问题时候，显示无法加载的样式-->
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </template>

        <!--自定义info列,只展示部分内容-->
        <template v-slot:item.info="{ item }">
          <v-chip class="elevation-5" label color="primary" @click="showInfo(item)">{{ item.info.substring(0,3) }}</v-chip>
        </template>
        <!--自定义会议状态列-->
        <template v-slot:item.status="{ item }">
          <div v-if="item.status==='可用'">
            <v-chip class="elevation-5"  color="success" label>可用</v-chip>
          </div>
          <div v-if="item.status==='使用中' ">
            <v-chip class="elevation-5" color="warning" label>使用中</v-chip>
          </div>
          <div v-if="item.status==='维修中'">
            <v-chip class="elevation-5" color="error" label>维修中</v-chip>
          </div>
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

    <!--删除的弹出页面-->
    <v-dialog v-model="dialogDelete" max-width="250px">
      <v-card>
        <v-card-title class="subtitle-1">你确定要删除这个会议室吗?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" elevation="5"  @click="closeDelete">取消</v-btn>
          <v-btn color="error" elevation="5"  @click="deleteItemConfirm">删除</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--新建会议室的弹出页面-->
    <v-form v-model="valid"  ref="form">
      <v-dialog  v-model="dialog" max-width="600px" transition="dialog-top-transition">
        <!--新建页面的title-->
        <v-card>
          <v-toolbar  class="text-h6" color="success" dark>
            <v-spacer/>
            {{ formTitle }}
            <v-spacer/>
          </v-toolbar>
          <!--新建页面的内容-->
          <v-card-text>
            <v-container>
              <!--图片上传-->
              <v-file-input accept="image/*"
                            @change="onFileChange"
                            label="上传图片"
                            show-size color="success" truncate-length="20"></v-file-input>
              <!--选择院系-->
              <v-select
                  prepend-icon="mdi mdi-bank"
                  v-model="editedItem.faculty.name"
                  menu-props="auto"
                  color="success"
                  :rules="[rules.required]"
                  :items="faculty.map(map=>map.name)"
                  label="所属院系"
                  @change="change(faculty)"
              ></v-select>

              <v-text-field
                  :prefix="prefixLocation"
                  prepend-icon="mdi mdi-factory"
                  color="success"
                  v-model="editedItem.room"
                  label="会议室地点">
              </v-text-field>
              <v-text-field
                  prepend-icon="mdi mdi-account-group"
                  color="success"
                  v-model="editedItem.capacity"
                  label="可容纳人数"
                  :rules="[rules.required,rules.capacityRules]"></v-text-field>

              <v-radio-group mandatory v-model="editedItem.status" row>
                <v-radio color="success" label="可用" value="可用"></v-radio>
                <v-radio color="warning" label="使用中" value="使用中"></v-radio>
                <v-radio color="error" label="维修中" value="维修中"></v-radio>
              </v-radio-group>
              <v-textarea color="success" outlined name="input-7-4" label="会议室描述信息"
                          v-model="editedItem.info"  :rules="[rules.required,rules.length(200)]" counter></v-textarea>
            </v-container>
          </v-card-text>
          <!--新建页面的保存，取消按钮-->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" elevation="5" @click="close">取消</v-btn>
            <v-btn :disabled="!valid" elevation="5" color="success" :loading="saveLoading" @click="save">保存</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-form>

    <!--图片弹窗-->
    <v-dialog
        v-model="imgDialog"
        transition="dialog-top-transition"
        max-width="800">
      <v-card>
        <v-img :src="`http://img.yangcc.top/`+imgDialogSrc" width="800"></v-img>
      </v-card>
    </v-dialog>
    <!--会议室信息弹窗-->
    <v-dialog
        v-model="infoDialog"
        transition="dialog-top-transition"
        max-width="300">
      <v-card>
        <v-toolbar color="primary" class="text-h6 mb-5" dark>
          {{location}}
        </v-toolbar>
        <v-card-text class="text-body-1">
          {{info}}
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  name: "MeetingRoom",
  data(){
    return{
      // 编辑,或者修改页面的表单是否通过验证
      valid: true,
      // 编辑，新建弹出框是否展示
      dialog: false,
      dialogDelete: false,
      editedIndex: -1, // 用于判断是否是新建，还是修改
      loading: false,  // 是否展示加载样式
      // 保存按钮的加载样式
      saveLoading: false,
      // 图片弹窗相关
      imgDialog: false,
      imgDialogSrc: '',
      //会议室信息弹窗
      infoDialog: false,
      info: '',
      location: '',

      rules: {
        capacityRules: value => {let pattern = /^[0-9]*$/
          return pattern.test(value)|| '只能是数字'},
        length: len => v => (v || '').length <= len || `最大长度为: ${len}`,
        required: v => !!v || '不能为空',
      },
      //存放学院信息
      faculty: [],
      //会议室的地点
      prefixLocation: '',
      // 图片文件
      img: '',
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
          text: '会议室',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'img',
        },
        { text: '会议室位置',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'faculty.name'
        },
        {
          text: '地点',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'faculty.location',
        },
        {
          text: '房间',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'room',
        },

        { text: '人数',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'capacity' },

        {
          text: '状态',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'status'
        },
        { text: '描述',
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
        meetingRoom: { // 查询条件
          id: '',
          capacity: '',
          status: '',
          faculty:{
            name: '',
            location: '',
          }
        }
      },
      dataList: [],  // 要展示的数据数组
      pageCount: 1, // 总页码


      // 保存新建，修改弹窗的值
      editedItem: {
        id: '',
        img: '',
        room:'',
        capacity: '',
        status: '',
        info:'',
        faculty: {
          name: '',
          location: '',
        }
      },
      // 点击清空时候赋值
      defaultItem: {
        id: '',
        img: '',
        room:'',
        capacity:'',
        status: '',
        info: '',
        faculty: {
          name: '',
          location: '',
        }
      },
    };
  },

  created () {
    this.findPage();
  },

  // 所有的方法
  methods: {
    //选择院系后,对应的院系地点前缀填上
    change(faculty){
      //获取对应的对象
      let data = faculty.filter((list)=>{
        return list.name===this.editedItem.faculty.name;
      })
      //如果是教学楼,则加上-
      this.prefixLocation = data[0].location+'-';
    },
    //图片上传
    onFileChange(file){
      this.img = file;
    },
    // 新建会议室的弹窗
    showCreateDialog(){
      this.prefixLocation='';
      // 查询学院信息
      this.$axios.post("/faculty/findAll",null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=> {
        if (res.data.code === 200) {
          this.faculty=res.data.data;
          this.dialog =true;
        }
        else {
          this.$message.error(res.data.message);
        }
      })
    },
    // 展示图片的弹窗
    showImg(item){
      this.imgDialogSrc=item.img;
      this.imgDialog = true
    },
    //展示会议室描述
    showInfo(item){
      this.info=item.info;
      if (item.room ===null){
        item.room="";
      }
      this.location=item.faculty.location+" "+item.room;
      this.infoDialog=true;
    },
    // 点击搜索按钮
    searchUser(){
      this.findPage();
    },

    // 点击修改按钮
    editItem (item) {
      // 保存此id，说明这个哪个用户
      this.editedItem.id =item.id;
      // 查询学院信息
      this.$axios.post("/faculty/findAll",null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          //保存信息
          this.faculty = res.data.data;
          // 修改editedIndex来说明现在是修改
          this.editedIndex = this.dataList.indexOf(item);
          // 将此行的数据复制到editedItem，用于Dialog展示，【es6新语法】
          this.editedItem = Object.assign({},item);
          //获取对应的对象
          let data = this.faculty.filter((list)=>{
            return list.name===this.editedItem.faculty.name;
          })
          //如果是教学楼,则加上-
          this.prefixLocation = data[0].location+'-';
          this.dialog =true;
        }else{
          this.$message.error(res.data.message);
        }
      })
    },

    // 点击删除按钮
    deleteItem (item) {
      // 拿到id
      this.editedItem.id =item.id;
      this.editedIndex = this.dataList.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },

    // 删除页面的删除按钮
    deleteItemConfirm () {
      this.$axios.post("/meetingRoom/delete/"+this.editedItem.id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.$message.success(res.data.message);
        }
        else {
          this.$message.error(res.data.message);
        }
      }).finally(()=>{
        this.findPage()
        this.closeDelete()
      });
    },

    // 删除页面的取消按钮
    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)//清空editedItem
        this.editedIndex = -1  //重置弹出框是修改，还是新建
      })
    },
    // 新建页面的取消按钮

    // 新建，或者修改 页面的保存
    save () {
      // 验证表单输入,如果通过，像后端发请求
      let validate = this.$refs.form.validate();
      if (validate === true) {
        // 如果是新建的页面
        if (this.editedIndex===-1) {
          this.saveLoading =true;
          let formData = new FormData;
          formData.append('file',this.img)
          formData.append('status',this.editedItem.status)
          formData.append('capacity',this.editedItem.capacity)
          formData.append('room',this.editedItem.room)
          formData.append('info',this.editedItem.info)
          formData.append('name',this.editedItem.faculty.name)
          formData.append('location',this.editedItem.faculty.location)
          this.$axios.post("/meetingRoom/upload",formData,{
            //加入token
            headers: {
              'Content-Type': 'application/json',
              'token': this.$store.state.token.tokenValue,
            }
          }).then((res)=>{
            //如果后端提示成功
            if (res.data.code===200){
              this.findPage();
              this.$message.success(res.data.message);
              this.saveLoading =false;
              this.close();
            }
            // 如果后端提示失败
            else{
              this.$message.error(res.data.message);
              this.saveLoading =false;
            }
          }).catch(()=>{
            this.saveLoading =false;
            this.close();
          })
        }
        // 如果是修改
        else{
          // 如果是默认的值空，表示没有修改图片
          if (this.img==='' || this.img===null){
            this.saveLoading =true;
            //不带图片的http请求，表示只修改其他信息
            this.$axios.post("/meetingRoom/edit",this.editedItem,{
              //加入token
              headers: {
                'Content-Type': 'application/json',
                'token': this.$store.state.token.tokenValue,
              }
            }).then((res)=>{
              if (res.data.code===200){
                this.findPage();
                this.$message.success(res.data.message);
                this.saveLoading =false;
                this.close();
              }
              else{
                this.$message.error(res.data.message);
                this.saveLoading =false;
              }
            }).catch(()=>{
              this.saveLoading =false;
              this.close();
            });
          }
          // 否则就代表修改了图片
          else{
            //对会议室地点拼接上前缀
            if (this.editedItem.location===''){
              this.editedItem.location=this.prefixLocation
            }
            else{
              this.editedItem.location=this.prefixLocation+'-'+this.editedItem.location
            }
            this.saveLoading =true;
            let formData = new FormData;
            formData.append('file',this.img)
            formData.append('id',this.editedItem.id)
            formData.append('status',this.editedItem.status)
            formData.append('capacity',this.editedItem.capacity)
            formData.append('room',this.editedItem.room)
            formData.append('info',this.editedItem.info)
            formData.append('name',this.editedItem.faculty.name)
            formData.append('location',this.editedItem.faculty.location)
            this.$axios.post("/meetingRoom/editAndUpload",formData,{
              //加入token
              headers: {
                'Content-Type': 'application/json',
                'token': this.$store.state.token.tokenValue,
              }
            }).then((res)=>{
              //如果后端提示成功
              if (res.data.code===200){
                this.findPage();
                this.$message.success(res.data.message);
                this.saveLoading =false;
                this.close();
              }
              // 如果后端提示失败
              else{
                this.$message.error(res.data.message);
                this.saveLoading =false;
              }
            }).catch(()=>{
              this.saveLoading =false;
              this.close();
            });
          }
        }
      }
    },

    // 分页查询
    findPage(){
      // 当前页，每页显示记录数，查询条件
      let param ={
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        meetingRoom: this.pagination.meetingRoom
      }
      this.$axios.post("/meetingRoom/findPage",param,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        // 为，总记录数，数据集合赋值
        this.pagination.total = res.data.total;
        this.dataList = res.data.rows;
        // 总页码赋值
        this.pageCount =Math.ceil(this.pagination.total/this.pagination.pageSize);
      })
    },
    // 页码变化
    handleCurrentPage(currentPage){
      this.pagination.currentPage =currentPage;
      this.findPage();
    },
    // 新建页面的取消按钮
    close () {
      // 隐藏页面
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem) // 清空保存数据的editedItem
        this.editedIndex = -1   // 重置弹出框标题
        this.prefixLocation = '';
        this.$refs.form.reset() // 重置表单
      })
    },
    clean(){
      this.pagination.meetingRoom.id='';
      this.pagination.meetingRoom.faculty.location='';
      this.pagination.meetingRoom.status='';
      this.pagination.meetingRoom.capacity='';
      this.pagination.meetingRoom.faculty.name='';
    },
  },

  computed: {
    //判断是新建，还是编辑，而展示不同的title
    formTitle () {
      return this.editedIndex === -1 ? '新建会议室' : '编辑会议室信息'
    },
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },
}
</script>

<style scoped>
.mycard{
  width: 100px;
  height: 100px;
  top: -15px;
}
.img:hover{
  cursor: pointer;
}
</style>