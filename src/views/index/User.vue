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
          <v-toolbar flat prominent>
            <!--展示表格的icon-->
            <v-card class="white--text success  text-center mycard elevation-5 pa-8" >
              <i class="fa  fa-users fa-2x" />
            </v-card>
            <div class="mt-5 ml-5 text-h6">用户信息表</div>
            <v-spacer></v-spacer>
            <!--搜索框-->
            <v-text-field  v-model="pagination.queryString"  label="在此输入.." dense
                solo hint="根据学工号，院系，权限筛选" color="success" class="mt-5"></v-text-field>
            <v-btn color="success" elevation="5" class="mt-5 ml-5" @click="searchUser"><i class="fa fa-search"></i> </v-btn>
            <v-spacer></v-spacer>
            <!--新建用户的按钮-->
            <v-btn color="success" elevation="5" dark class="mt-5" @click="showDialog">新建用户</v-btn>
          </v-toolbar>
        </template>
        <!--操作的按钮-->
        <template v-slot:item.actions="{ item }">
          <v-btn small elevation="5" color="success" class="mr-2" @click="editItem(item)"><i class="fa fa-pencil"></i></v-btn>
          <v-btn small elevation="5" color="error" @click="deleteItem(item)"><i class="fa fa-times"></i></v-btn>
        </template>
        <!--用户权限的显示样式-->
        <template v-slot:item.role="{ item }">
          <div v-if="item.role==='user'">
            <v-chip class="elevation-5"  color="success" label>user</v-chip>
          </div>
          <div v-if="item.role==='admin' ">
            <v-chip class="elevation-5" color="warning" label>admin</v-chip>
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
      <!--回到顶部的按钮-->

    </v-container>
    <!--删除的弹出页面-->
    <v-dialog v-model="dialogDelete" max-width="250px"   transition="dialog-top-transition">
      <v-card>
        <v-card-title class="subtitle-1">你确定要删除这个用户吗?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" elevation="5" @click="closeDelete">取消</v-btn>
          <v-btn color="error" elevation="5"  @click="deleteItemConfirm">删除</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--新建，编辑的弹窗-->
    <v-form v-model="valid" ref="form">
      <v-dialog v-model="dialog" max-width="400px" transition="dialog-top-transition">
        <!--新建页面的title-->
        <v-card>
          <v-toolbar class="text-h6" color="success" dark>
            <v-spacer/>
            {{ formTitle }}
            <v-spacer/>
          </v-toolbar>
          <!--新建页面的内容-->
          <v-card-text>
            <v-container>
              <v-text-field color="success" v-model="editedItem.username" label="学号/学工号" :rules="usernameRules" :click="click"></v-text-field>
              <v-text-field color="success" v-model="editedItem.password" label="密码" :rules="passwordRules"></v-text-field>
              <v-select
                  v-model="editedItem.faculty"
                  menu-props="auto"
                  color="success"
                  :items="faculty"
                  label="院系"
                  :rules="facultyRules"
              ></v-select>
              <v-radio-group mandatory v-model="editedItem.role" row>
                <v-radio color="success" label="普通用户" value="user"></v-radio>
                <v-radio color="success" label="管理员" value="admin"></v-radio>
              </v-radio-group>
            </v-container>
          </v-card-text>
          <!--新建页面的保存，取消按钮-->
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" elevation="5" @click="close">取消</v-btn>
            <v-btn :disabled="!valid" elevation="5" :loading="saveLoading" color="success" @click="save">保存</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-form>
  </v-app>
</template>

<script>
export default {
  name: "User",
  data(){
    return{
      // 编辑,或者修改页面的表单是否通过验证
      valid: true,
      // 编辑，新建弹出框是否展示
      dialog: false,
      dialogDelete: false,
      editedIndex: -1, // 用于判断是否是新建，还是修改
      loading: false,  // 是否展示加载样式
      // 保存按钮的样式
      saveLoading: false,
      // 输入框规则
      usernameRules: [
        value => !!value || '不能为空',
        value => {
          let pattern = /^[0-9]*$/
          return pattern.test(value)|| '只能是数字'},
      ],
      passwordRules: [value => !!value || '不能为空'],
      facultyRules: [value => !!value || '不能为空'],
      //存放学院信息
      faculty: [],
      //所有的列信息
      headers: [
        {
          text: '学工号',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'username',
        },
        { text: '密码',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'password' },
        { text: '所属院系',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'faculty.name' },
        { text: '用户权限',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'role' },
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
        queryString: '', // 查询条件
      },
      dataList: [],  // 要展示的数据数组
      pageCount: 1, // 总页码


      // 保存新建，修改弹窗的值
      editedItem: {
        id: '',
        username: '',
        password: '',
        faculty: '',
        role: '',
      },
      // 点击清空时候赋值
      defaultItem: {
        username: '',
        password: '',
        faculty: '',
        role: '',
      },
    };
  },

  created () {
    this.init();
  },

  // 所有的方法
  methods: {
    // 新建页面用户输入学工号后的事件
    click(){
      console.log("xxxx")
    },
    // 显示弹出框
    showDialog(){
      // 查询学院信息
      this.$axios.post("/faculty/findFacultyNameForTeach").then((res)=> {
        if (res.data.code === 200) {
          this.faculty=res.data.data;
          this.dialog =true;
        }
        else {
          this.$message.error(res.data.data);
        }
      }).catch(()=>{
        this.$message.error("查询院系信息失败请检查网络")
      })
    },
    // 页面初始化
    init(){
      this.loading=true;
      this.findPage();
      this.loading=false;
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
      this.$axios.post("/faculty/findFacultyNameForTeach").then((res)=>{
        if (res.data.code===200){
          //保存学员信息
          this.faculty = res.data.data;
          // 修改editedIndex来说明现在是修改
          this.editedIndex = this.dataList.indexOf(item);
          // 将此行的数据复制到editedItem，用于Dialog展示，【es6新语法】
          this.editedItem = Object.assign({},item);
          this.dialog =true;
        }
        else{
          this.$message.error(res.data.data);
        }
      }).catch(()=>{
        this.$message.error("查询院系信息失败请检查网络")
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
      this.$axios.post("/user/delete",{id:this.editedItem.id}).then((res)=>{
        if (res.data.code===200){
          this.$message.success(res.data.data);
        }
        else {
          this.$message.error(res.data.data);
        }
      }).catch(()=>{
        this.$message.error("发送请求失败，请检查网络");
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
    close () {
      // 隐藏页面
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem) // 清空保存数据的editedItem
        this.editedIndex = -1   // 重置弹出框标题
        this.$refs.form.reset() // 重置表单
      })
    },

    // 新建，或者修改 页面的保存
    save () {
      this.saveLoading =true;
      // 如果是新建的保存
      if (this.editedIndex===-1){
        // 验证表单输入,如果通过，像后端发请求
        let validate = this.$refs.form.validate();
        if (validate===true){
          this.$axios.post("/user/add",this.editedItem)
              .then((res)=>{
                // 如果后端成功
                if (res.data.code===200){
                  this.findPage();
                  this.$message.success(res.data.data);
                  this.saveLoading =false;
                  this.close();
                }
                // 如果后端提示失败
                else{
                  this.$message.error(res.data.data);
                  this.saveLoading =false;
                }
              })
              // 如果请求发送失败
              .catch(()=>{
                this.$message.error("请求发送失败，请检查网络");
                this.saveLoading =false;
                this.close();
              });
        }
        // 如果表单输入有问题，则关闭弹窗
        else{
          this.$message.error("请检查输入的格式是否有问题");
          this.saveLoading =false;
        }
      }
      // 如果是修改保存
      else{
        // 验证表单输入,如果通过，才向后端发请求
        let validate = this.$refs.form.validate();
        if (validate===true){
          this.$axios.post("/user/edit",this.editedItem).then((res)=>{
            // 如果成功
            if (res.data.code===200){
              this.$message.success(res.data.data);
            }
            // 如果后端提示失败打印
            else{
              this.$message.error(res.data.data);
            }
          }).catch(()=>{
            this.$message.error("请求发送失败，请检查网络")
          })
              // 无论成功还是失败都要调用查询方法，重新查询
              .finally(()=>{
                this.findPage();
                this.saveLoading =false;
                this.close();
              });
        }
        else {
          this.$message.error("请检查输入的格式是否有问题");
          this.saveLoading =false;
        }
      }
    },

    // 分页查询
    findPage(){
      // 当前页，每页显示记录数，查询条件
      let param ={
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        queryString: this.pagination.queryString,
      }
      this.$axios.post("/user/findPage",param).then((res)=>{
        // 为，总记录数，数据集合赋值
        this.pagination.total = res.data.total;
        this.dataList = res.data.rows;
        // 总页码赋值
        this.pageCount =Math.ceil(this.pagination.total/this.pagination.pageSize);
      }).catch((res)=>{
        this.$message.error("分页请求发送失败，请检查网络")
      })
    },
    // 页码变化
    handleCurrentPage(currentPage){

      this.pagination.currentPage =currentPage;
      this.findPage();
    }
  },

  computed: {
    //判断是新建，还是编辑，而展示不同的title
    formTitle () {
      return this.editedIndex === -1 ? '新建用户' : '编辑用户'
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
  top: -30px;
}
</style>