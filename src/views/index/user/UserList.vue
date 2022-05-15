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
          <v-toolbar flat  >
            <!--展示表格的icon-->
            <v-card class="white--text success  text-center mycard elevation-5 pa-8" >
              <i class="fa fa fa-users fa-2x" />
            </v-card>
            <div class="mt-5 ml-5 text-h6">用户信息表</div>
            <v-spacer></v-spacer>
            <!--新建用户的按钮-->
            <v-btn color="success" elevation="5" dark class="mt-5" @click="showDialog">新建用户</v-btn>
          </v-toolbar>
          <v-container>
            <v-row class="mt-3">
              <v-col cols="2">
                <!--搜索框-->
                <v-text-field  v-model="pagination.user.id"
                               label="#"
                               outlined
                               dense
                               color="success"></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.user.username"
                               label="用户名"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.user.faculty"
                               label="所在院系"
                               outlined
                               dense
                               color="success"
                ></v-text-field>
              </v-col>
              <v-col cols="2">
                <v-text-field  v-model="pagination.user.role"
                               label="角色Code"
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
        <!--头像-->
        <template v-slot:item.avatar="{ item }">
          <v-avatar  size="36px">
            <v-img alt="Avatar"
                   :src="'http://img.yangcc.top/'+item.avatar"
                   lazy-src="http://img.yangcc.top/header.jpg"
            ></v-img>
          </v-avatar>
        </template>
        <!--角色-->
        <template v-slot:item.role.name="{ item }">
          <v-chip class="elevation-5" color="warning" label>{{ item.role.name }}</v-chip>
        </template>
        <!--状态-->
        <template v-slot:item.status="{ item }">
          <v-chip v-if="item.status==='在线'" class="elevation-5" color="success" label>{{ item.status }}</v-chip>
          <v-chip v-if="item.status==='离线'" class="elevation-5" color="primary" label>{{ item.status }}</v-chip>
          <v-chip v-if="item.status==='封禁中'" class="elevation-5" color="error" label @click="showBanStatusDialog(item)">{{ item.status }}</v-chip>
        </template>

        <!--操作的按钮-->
        <template v-slot:item.actions="{ item }">
          <v-btn v-if="item.role.code!=='SuperAdmin'" small elevation="5" color="success" class="mr-2" @click="editItem(item)"><i class="fa fa-pencil"></i></v-btn>
          <v-btn v-if="item.role.code!=='SuperAdmin'" small elevation="5" color="error" @click="deleteItem(item)"><i class="fa fa-times"></i></v-btn>
        </template>

        <!--用户操作的按钮-->
        <template v-slot:item.userActions="{ item }">
          <v-btn v-if="item.status==='在线' && item.role.code!=='SuperAdmin'" small elevation="5" color="primary" class="mr-2" @click="showOfflineDialig(item)">下线</v-btn>
          <v-btn v-if="item.status!=='在线'" small elevation="5" color="primary" class="mr-2" disabled>下线</v-btn>
          <v-btn v-if="item.role.code!=='SuperAdmin'" small elevation="5"  class="mr-2"   color="error" @click="showBanDialig(item)">封禁</v-btn>
          <v-btn v-if="item.role.code!=='SuperAdmin'&&item.status==='封禁中'" small elevation="5" color="success" @click="showUnBanDialog(item)">解封</v-btn>
          <v-btn v-if="item.role.code!=='SuperAdmin'&&item.status!=='封禁中'" disabled small elevation="5" color="success">解封</v-btn>
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
    <!--踢人下线的弹出页面-->
    <v-dialog v-model="dialogOffLine" max-width="300" transition="dialog-top-transition">
      <v-card>
        <v-card-title class="subtitle-1">你确定要让此用户强制下线吗?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" elevation="5" @click="closeOffline">取消</v-btn>
          <v-btn color="error" elevation="5"  @click="offline">下线</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--账号封禁的弹出页面-->
    <v-form v-model="validBan" ref="banForm">
      <v-dialog v-model="dialogBan" max-width="500" transition="dialog-top-transition">
        <v-card>
          <v-toolbar class="text-h6" color="success" dark>
            <v-spacer/>账号封禁<v-spacer/>
          </v-toolbar>
          <v-card-text>
            <!--是否永久封禁-->
            <v-radio-group
                dense
                label="选择封禁类型"
                prepend-icon="mdi-format-list-bulleted-type"
                v-model="forever" row>
              <v-radio
                  color="success"
                  label="永久封禁"
                  :value="true"
              ></v-radio>
              <v-radio
                  color="success"
                  label="自定义时间"
                  :value="false"
              ></v-radio>
            </v-radio-group>
            <!--自定义封禁时间-->
            <v-text-field
                prepend-icon="mdi-calendar-clock"
                v-if="this.forever===false"
                label="自定义封禁时间,输入1代表1天"
                outlined
                dense
                color="success"
                :rules="foreverRules"
                v-model="banTime"
            ></v-text-field>
            <!--是否删除此用户对应的所有待审核的会议-->
            <v-radio-group
                dense
                label="删除待审核会议申请"
                prepend-icon="mdi-palette-swatch"
                v-model="deleteMeetingApply" row>
              <v-radio
                  color="success"
                  label="是"
                  :value="true"
              ></v-radio>
              <v-radio
                  color="success"
                  label="否"
                  :value="false"
              ></v-radio>
            </v-radio-group>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" elevation="5" @click="closeBan">取消</v-btn>
            <v-btn :disabled="!validBan" color="error" elevation="5"  @click="ban">封禁</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-form>
    <!--封禁的详情的弹出页-->
    <v-dialog v-model="dialogStatusBan" max-width="300" transition="dialog-top-transition">
      <v-card>
        <v-toolbar class="text-h6" color="success" dark>
          <v-spacer/>封禁详情<v-spacer/>
        </v-toolbar>
        <v-card-subtitle class="mt-5 subtitle-1" v-if="this.userBanTime===-1">该账号是永久封禁</v-card-subtitle>
        <v-card-subtitle class="mt-5 subtitle-1" v-else>距离解封天数还有： <v-chip label color="success">{{Math.ceil(userBanTime/86400)}}天</v-chip></v-card-subtitle>
      </v-card>
    </v-dialog>
    <!--解封的弹出页面-->
    <v-dialog v-model="dialogUnBan" max-width="250px"   transition="dialog-top-transition">
      <v-card>
        <v-card-title class="subtitle-1">你确定要解封这个用户吗?</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" elevation="5" @click="closeUnBan">取消</v-btn>
          <v-btn color="error" elevation="5"  @click="unBan">解封</v-btn>
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
              <!--图片上传-->
              <v-file-input
                  accept="image/*"
                  @change="onFileChange"
                  label="上传头像,为空即为,默认头像"
                  show-size color="success"
                  truncate-length="20"></v-file-input>
              <v-text-field
                  prepend-icon="mdi mdi-face"
                  color="success"
                  v-model="editedItem.username"
                  label="学工号"
                  :rules="usernameRules"
                  ></v-text-field>
              <div v-if="editedIndex===-1">
                <v-text-field
                    prepend-icon="mdi mdi-lock-outline"
                    color="success"
                    v-model="editedItem.password"
                    label="用户密码"
                    :rules="[rules.required]"></v-text-field>
              </div>
              <div v-else>
                <v-text-field
                    prepend-icon="mdi mdi-lock-outline"
                    color="success"
                    v-model="editedItem.password"
                    label="输入代表重置密码"></v-text-field>
              </div>
              <v-select
                  prepend-icon="mdi mdi-bank"
                  v-model="editedItem.faculty"
                  menu-props="auto"
                  color="success"
                  :items="faculty"
                  label="选择院系"
                  :rules="[rules.required]"
              ></v-select>
              <v-select
                  prepend-icon="mdi mdi-account-box"
                  v-model="editedItem.role"
                  menu-props="auto"
                  color="success"
                  :items="roles.map(map=>map.name)"
                  label="选择角色"
                  :rules="[rules.required]"
              ></v-select>
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
      validBan: true,
      dialogOffLine: false,
      dialogBan: false,
      dialogStatusBan: false,
      dialogUnBan: false,
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
      rules: {
        length: len => v => (v || '').length <= len || `最大长度为: ${len}`,
        required: v => !!v || '不能为空',
      },
      //存放学院信息
      faculty: [],
      //存放角色信息
      roles: [],
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
          text: '头像',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'avatar'
        },
        { text: '用户名',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'username'
        },
        { text: '所在院系',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'faculty.name'
        },
        {
          text: '角色',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'role.name'
        },
        {
          text: '角色Code',
          align: 'center',
          sortable: false,
          class: 'green--text subtitle-1',
          value: 'role.code'
        },
        { text: '状态',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'status',
          sortable: false
        },
        { text: '编辑操作',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'actions',
          sortable: false
        },
        { text: '账号操作',
          align: 'center',
          class: 'green--text subtitle-1',
          value: 'userActions',
          sortable: false
        },
      ],

      // 分页相关数据
      pagination:{
        currentPage: 1, // 当前页
        pageSize: 10,  // 每页显示条数
        total: 10,    // 总记录数
        user: {  // 查询条件
          id: '',
          username: '',
          faculty: '',
          role: ''
        },
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
        id: '',
        username: '',
        password: '',
        faculty: '',
        role: '',
      },
      //封禁时间
      banTime: 0,
      //是否永久封禁
      forever: true,
      deleteMeetingApply: true,
      //此用户剩余的时间
      userBanTime: '',
    };
  },

  created () {
    this.init();
  },

  // 所有的方法
  methods: {
    //图片上传
    onFileChange(file){
      this.img = file;
    },
    // 显示弹出框
    showDialog(){
      // 查询学院信息
      this.$axios.post("/faculty/findFacultyNameForTeach",null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=> {
        if (res.data.code === 200) {
          this.faculty=res.data.data;
          // 查询角色信息
          this.$axios.post("/role/findAllUserRole",null,{
            //加入token
            headers: {
              'Content-Type': 'application/json',
              'token': this.$store.state.token.tokenValue,
            }
          }).then((res)=> {
            if (res.data.code === 200) {
              this.roles=res.data.data;
              this.dialog =true;
            }
            else {
              this.$message.error(res.data.message);
            }
          }).catch(()=>{
            this.$message.error("查询角色失败请检查网络")
          })
        }
        else {
          this.$message.error(res.data.message);
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
      this.$axios.post("/faculty/findFacultyNameForTeach",null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          //保存学员信息
          this.faculty = res.data.data;
          // 查询角色信息
          this.$axios.post("/role/findAllUserRole",null,{
            //加入token
            headers: {
              'Content-Type': 'application/json',
              'token': this.$store.state.token.tokenValue,
            }
          }).then((res)=> {
            if (res.data.code === 200) {
              this.roles=res.data.data;
              // 修改editedIndex来说明现在是修改
              this.editedIndex = this.dataList.indexOf(item);
              // 将此行的数据复制到editedItem，用于Dialog展示，【es6新语法】
              this.editedItem = Object.assign({},item);
              this.editedItem.faculty =  item.faculty.name;
              this.editedItem.role = item.role.name;
              this.dialog =true;
            }
            else {
              this.$message.error(res.data.message);
            }
          }).catch(()=>{
            this.$message.error("查询角色失败请检查网络")
          })
        }
        else{
          this.$message.error(res.data.message);
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
      this.$axios.post("/user/delete/"+this.editedItem.id,null,{
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
      this.img = ''
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem) // 清空保存数据的editedItem
        this.editedIndex = -1   // 重置弹出框标题
        this.$refs.form.reset() // 重置表单
      })
    },

    // 新建，或者修改 页面的保存
    save() {
      this.saveLoading = true;
      // 如果是新建的保存
      if (this.editedIndex === -1) {
        // 验证表单输入,如果通过，像后端发请求
        let validate = this.$refs.form.validate();
        if (validate === true) {
          //拿到此角色对应的code
          this.roles.forEach((value => {
            if (value.name === this.editedItem.role) {
              this.editedItem.role = value.code;
            }
          }))
          //因为是带图片的方式所以只能使用FormData方式
          let formData = new FormData;
          formData.append('avatar',this.img)
          formData.append('username',this.editedItem.username)
          formData.append('password',this.editedItem.password)
          formData.append('faculty',this.editedItem.faculty)
          formData.append('role',this.editedItem.role)
          //请求
          this.$axios.post("/user/add",formData,{
            //加入token
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'token': this.$store.state.token.tokenValue,
            }
          })
              .then((res)=>{
                // 如果后端成功
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
              })
              // 如果请求发送失败
              .catch(()=>{
                this.$message.error("请求发送失败，请检查网络");
                this.saveLoading =false;
                this.close();
              });
        }
        // 如果表单输入有问题，则关闭弹窗
        else {
          this.$message.error("请检查输入的格式是否有问题");
          this.saveLoading = false;
        }
      }
      // 如果是修改保存
      else {
        //拿到此角色对应的code
        this.roles.forEach((value => {
          if (value.name === this.editedItem.role) {
            this.editedItem.role = value.code;
          }
        }))
        // 验证表单输入,如果通过，才向后端发请求
        let validate = this.$refs.form.validate();
        if (validate === true) {
          // 如果是默认的值空，表示没有修改图片
          if (this.img==='' || this.img===null){
            this.$axios.post("/user/edit", this.editedItem,{
              //加入token
              headers: {
                'Content-Type': 'application/json',
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
            }).catch(() => {
              this.$message.error("请求发送失败，请检查网络")
            })
                // 无论成功还是失败都要调用查询方法，重新查询
                .finally(() => {
                  this.findPage();
                  this.saveLoading = false;
                  this.close();
                });
          }
          // 否则就代表修改了图片
          else {
            //拿到此角色对应的code
            this.roles.forEach((value => {
              if (value.name === this.editedItem.role) {
                this.editedItem.role = value.code;
              }
            }))
            this.saveLoading =true;
            let formData = new FormData;
            formData.append("id",this.editedItem.id)
            formData.append('avatar',this.img)
            formData.append('username',this.editedItem.username)
            formData.append('password',this.editedItem.password)
            formData.append('role',this.editedItem.role)
            formData.append('faculty',this.editedItem.faculty)
            this.$axios.post("/user/editAndUpload",formData,{
              //加入token
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
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
              this.$message.error("请求发送失败，请检查网络");
              this.saveLoading =false;
              this.close();
            });
          }
        } else {
          this.$message.error("请检查输入的格式是否有问题");
          this.saveLoading = false;
        }
      }
    },

    // 分页查询
    findPage(){
      // 当前页，每页显示记录数，查询条件
      let param ={
        currentPage: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        user: this.pagination.user
      }
      this.$axios.post("/user/findPage",param,{
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
    // 清除搜索条件
    clean(){
      this.pagination.user.id = '';
      this.pagination.user.role = '';
      this.pagination.user.faculty = '';
      this.pagination.user.username = '';
    },
    //展开账号下线弹窗
    showOfflineDialig(item){
      this.editedItem.id = item.id
      this.dialogOffLine =true
    },
    //取消下线
    closeOffline(){
      this.editedItem = Object.assign({}, this.defaultItem)//清空editedItem
      this.dialogOffLine = false;
    },
    //账号下线
    offline(){
      this.$axios.put("/user/offline/"+this.editedItem.id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.$message.success(res.data.message)
          this.findPage()
        }else {
          this.$message.error(res.data.message)
        }
      }).finally(()=>{
        this.editedItem = Object.assign({}, this.defaultItem)//清空editedItem
        this.dialogOffLine = false;
      });
    },
    //账号封禁弹窗展示
    showBanDialig(item){
      this.editedItem.id = item.id
      this.dialogBan =true
    },
    //关闭封禁弹窗
    closeBan(){
      this.dialogBan = false
      this.editedItem.id=''
      this.forever = true
      this.banTime= 0
      this.deleteMeetingApply=true
    },
    //封禁
    ban(){
      this.$axios.put("/user/ban/"+this.editedItem.id+"/"+this.banTime+"/"+this.forever+"/"+this.deleteMeetingApply,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.$message.success(res.data.message)
          this.findPage()
        }else {
          this.$message.error(res.data.message)
        }
      }).finally(()=>{
        this.editedItem = Object.assign({}, this.defaultItem)//清空editedItem
        this.dialogBan = false;
      });
    },
    //显示封禁详情弹窗
    showBanStatusDialog(item){
      //查询封禁剩余时间
      this.$axios.get("/user/banTime/"+item.username,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.userBanTime =res.data.data
          this.dialogStatusBan =true
        }else {
          this.$message.error(res.data.message)
        }
      })
    },
    //展开解封禁弹窗
    showUnBanDialog(item){
      this.editedItem.username = item.username
      this.dialogUnBan =true
    },
    //关闭解封弹窗
    closeUnBan(){
      this.editedItem.username = ''
      this.dialogUnBan =false
    },
    unBan(){
      this.$axios.put("/user/unBan/"+this.editedItem.username,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.$message.success(res.data.message)
          this.findPage()
        }else {
          this.$message.error(res.data.message)
        }
      }).finally(()=>{
        this.editedItem.username = ''
        this.dialogUnBan =false
      })
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
  top: -15px;
}
</style>