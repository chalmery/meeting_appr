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
              <i class="fa fa-address-book-o fa-2x" />
            </v-card>
            <div class="mt-5 ml-5 text-h6">角色列表</div>
            <v-spacer></v-spacer>
            <!--搜索框-->
            <v-text-field v-model="pagination.queryString"  label="在此输入.." dense solo
                          hint="输入角色代号筛选" color="success" class="mt-5"></v-text-field>
            <v-btn color="success" elevation="5" class="mt-5 ml-5" @click="search"><i class="fa fa-search"></i></v-btn>
            <v-spacer></v-spacer>
            <!--新建角色按钮-->
            <v-btn color="success" elevation="5" dark class="mt-5" @click="showCreateDialog">新建角色</v-btn>
          </v-toolbar>
        </template>

        <!--用户权限的显示样式-->
        <template v-slot:item.name="{ item }">
          <div v-if="item.admin===true">
            <v-chip class="elevation-5"  color="warning" label>{{item.name}}</v-chip>
          </div>
          <div v-else>
            <v-chip class="elevation-5" color="success" label>{{item.name}}</v-chip>
          </div>
        </template>
        <!--用户权限的显示样式-->
        <template v-slot:item.admin="{ item }">
          <div v-if="item.admin=== true">是</div>
          <div v-else>否</div>
        </template>
        <!--操作的按钮-->
        <template v-slot:item.actions="{ item }">
          <v-btn v-if="item.code!=='SuperAdmin'" small elevation="5" color="success" class="mr-2" @click="editItem(item)"><i class="fa fa-pencil"></i></v-btn>
          <v-btn v-if="item.code!=='SuperAdmin'" small elevation="5" color="error" @click="deleteItem(item)"><i class="fa fa-times"></i></v-btn>
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

    <!--新设角色的弹出页面-->
    <v-form v-model="valid"  ref="form">
      <v-dialog v-model="dialog" max-width="600px" transition="dialog-top-transition">
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
              <v-text-field prepend-icon="mdi mdi-account-box" color="success" v-model="editedItem.name" label="角色名称" :rules="[rules.required]"></v-text-field>
              <v-text-field prepend-icon="mdi mdi-alpha-c-box" color="success" v-model="editedItem.code" label="角色代号" :rules="[rules.required]"></v-text-field>
              <v-text-field prepend-icon="mdi mdi-alpha-i-box" color="success" v-model="editedItem.info" label="角色描述" :rules="[rules.required,rules.length(30)]"></v-text-field>
              <v-radio-group mandatory v-model="editedItem.admin" row>
                <v-radio color="success" label="管理员" :value=true></v-radio>
                <v-radio color="success" label="非管理员" :value=false></v-radio>
              </v-radio-group>
              <v-treeview
                  open-all
                  selectable
                  selected-color="success"
                  v-model="editedItem.menuList"
                  :items="AllMenuList"
              ></v-treeview>
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
  </v-app>
</template>

<script>
export default {
  name: "FacultyList",
  data(){
    return{
      // 编辑,或者修改页面的表单是否通过验证
      valid: true,
      // 编辑，新建弹出框是否展示
      dialog: false,
      dialogDelete: false,
      editedIndex: -1, // 用于判断是否是新建，还是修改
      // 保存按钮的加载样式
      saveLoading: false,
      //所有的列信息
      headers: [
        {
          text: '#',
          align: 'center',
          sortable: false, // 不可排序
          class: 'green--text subtitle-1',
          value: 'id',
        },
        { text: '角色名称',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'name'
        },
        { text: '角色代号',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'code'
        },
        { text: '创建时间',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'createTime'
        },
        { text: '角色描述',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'info'
        },
        { text: '是否为管理员',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'admin'
        },
        { text: '操作',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'actions',
          sortable: false
        },
      ],
      rules: {
        length: len => v => (v || '').length <= len || `最大长度为: ${len}`,
        required: v => !!v || '不能为空',
      },
      // 分页相关数据
      pagination:{
        currentPage: 1, // 当前页
        pageSize: 10,  // 每页显示条数
        total: 10,    // 总记录数
        queryString: '', // 查询条件
      },
      dataList: [],  // 要展示的数据数组
      AllMenuList: [],  // menu列表
      pageCount: 1, // 总页码

      // 保存新建，修改弹窗的值
      editedItem: {
        id: '',
        name: '',
        code:'',
        admin: '',
        info:'',
        createTime: null,
        menuList: [],
      },
      // 点击清空时候赋值
      defaultItem: {
        id: '',
        name: '',
        code: '',
        admin: '',
        info: '',
        createTime: null,
        menuList: [],
      },
    };
  },
  created () {
    this.init();
    this.findPage();
  },
  methods:{
    init(){
      // 获取全部菜单信息
      this.$axios.post("/menu/findAllMenu",null,{
        //加入token
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.AllMenuList = res.data.data;
        }
      });
    },
    //展示新建弹窗
    showCreateDialog(){
      console.log(this.AllMenuList)
      this.dialog =true;
    },
    //点击保存按钮
    save(){
      //先过滤到被删除的父节点,然后加入
      let menu =  this.editedItem.menuList.filter((m)=>{
        return m!==2 && m!==3 && m!==5 && m!==11 && m!==15 && m!==6
      })
      //
      for (let i = 0; i <menu.length ; i++) {
        let m = menu[i];
        if (m===6 || m===7 || m===8){
          menu.push(2);
        }
        if (m===9 || m===10 || m===14){
          menu.push(3)
        }
        if(m===11||m===12||m===13||m===15){
          menu.push(5)
        }
        if (m===16||m===17){
          menu.push(11)
        }
        if(m===18||m===19){
          menu.push(15)
        }
        if(m===20||m===21||m===22||m===23){
          menu.push(6)
        }
      }
      //去重
      function unique (arr) {
        return Array.from(new Set(arr))
      }
      this.editedItem.menuList = unique(menu);
      this.saveLoading =true;
      // 验证表单输入,如果通过，像后端发请求
      let validate = this.$refs.form.validate();
      if (validate === true) {
        // 如果是新建的页面
        if (this.editedIndex===-1) {
          this.$axios.post("/role/add",this.editedItem,{
            //加入token
            headers: {
              'Content-Type': 'application/json',
              'token': this.$store.state.token.tokenValue,
            }
          }).then((res)=>{
            if (res.data.code===200){
              this.$message.success(res.data.message)
              this.findPage();
              this.close();
            }else {
              this.$message.error(res.data.message)
            }
          }).catch(()=>{
            this.$message.error("请求发送失败，请检查网络");
          }).finally(()=>{
            this.saveLoading= false;
          })
        }
        //如果是修改
        else {
          this.$axios.post("/role/edit",this.editedItem,{
            //加入token
            headers: {
              'Content-Type': 'application/json',
              'token': this.$store.state.token.tokenValue,
            }
          }).then((res)=>{
            if (res.data.code===200){
              this.$message.success(res.data.message)
              this.findPage();
              this.close();
            }else {
              this.$message.error(res.data.message)
            }
          }).catch(()=>{
            this.$message.error("请求发送失败，请检查网络");
          }).finally(()=>{
            this.saveLoading= false;
          })
        }
      }
    },
    //修改按钮点击
    editItem(item){
      // 保存此id，说明这个哪个院系
      this.editedItem.id =item.id;
      // 修改editedIndex来说明现在是修改
      this.editedIndex = this.dataList.indexOf(item);
      // 将此行的数据复制到editedItem，用于Dialog展示，【es6新语法】
      this.editedItem = Object.assign({},item);
      this.dialog =true;
    },
    //删除按钮点击
    deleteItem(item){
      // 拿到id
      this.editedItem.id =item.id;
      this.dialogDelete = true
    },
    // 删除页面的取消按钮
    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)//清空editedItem
        this.editedIndex = -1  //重置弹出框是修改，还是新建
      })
    },
    // 删除页面的删除按钮
    deleteItemConfirm () {
      this.$axios.post("/role/delete/"+this.editedItem.id,null,{
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
      }).catch(()=>{
        this.$message.error("发送请求失败，请检查网络");
      }).finally(()=>{
        this.findPage()
        this.closeDelete()
      });
    },
    //点击搜索按钮
    search(){
      this.findPage();
    },
    //分页查询
    findPage(){
      // 当前页，每页显示记录数，查询条件
      let param ={
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        queryString: this.pagination.queryString,
      }
      this.$axios.post("/role/findPage",param,{
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
  },
  computed: {
    //判断是新建，还是编辑，而展示不同的title
    formTitle () {
      return this.editedIndex === -1 ? '新建角色' : '编辑角色'
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