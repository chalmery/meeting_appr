<template>
  <div>
    <!--申请会议-->
    <v-form v-model="valid" ref="form">
      <v-card>
        <!--标题-->
        <v-card-title>
          <v-toolbar flat>
            <!--展示表格的icon-->
            <v-card class="success text-center mycard elevation-5" >
              <v-card-text class="white--text text-h6 mt-1">
                申请会议
              </v-card-text>
            </v-card>
            <v-spacer></v-spacer>
          </v-toolbar>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-text-field
                prepend-icon="mdi-briefcase"
                color="success"
                :rules="[rules.required,rules.length(50)]"
                v-model="editedItem.name"
                label="会议主题"></v-text-field>
            <!--选择日期-->
            <v-menu
                v-model="menu3"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                    color="success"
                    v-model="editedItem.date"
                    label="选择开会日期"
                    prepend-icon="mdi-calendar"
                    readonly
                    :rules="[rules.required]"
                    v-bind="attrs"
                    v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                  color="success"
                  v-model="editedItem.date"
                  :min="toDay"
                  @input="menu3 = false"
              ></v-date-picker>
            </v-menu>
            <v-row>
              <v-col>
                <!--选择开会时间-->
                <v-menu
                    ref="menu1"
                    v-model="menu1"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="editedItem.start"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        color="success"
                        prepend-icon="mdi-alarm"
                        v-model="editedItem.start"
                        label="会议开始时间"
                        :rules="[rules.required]"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                      color="success"
                      format="24hr"
                      v-model="editedItem.start"
                      full-width
                      :allowed-hours="allowedHours"
                      :min="editedItem.end"
                      @click:minute="$refs.menu1.save(editedItem.start)"
                  ></v-time-picker>
                </v-menu>
              </v-col>
              <v-col>
                <!--选择结束时间-->
                <v-menu
                    ref="menu2"
                    v-model="menu2"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    :return-value.sync="editedItem.end"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        color="success"
                        v-model="editedItem.end"
                        label="会议结束时间"
                        :rules="[rules.required]"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                    ></v-text-field>
                  </template>
                  <v-time-picker
                      color="success"
                      format="24hr"
                      v-model="editedItem.end"
                      full-width
                      :allowed-hours="allowedHours"
                      :min="editedItem.start"
                      @click:minute="$refs.menu2.save(editedItem.end)"
                  ></v-time-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="11">
                <v-select
                    prepend-icon="mdi-bank"
                    v-model="editedItem.faculty"
                    menu-props="auto"
                    color="success"
                    item-color="success"
                    :items="faculty.map(map=>map.name)"
                    :rules="[rules.required]"
                    @change="facultyChange(editedItem.faculty)"
                    label="选择会议地点"
                ></v-select>
              </v-col>
              <v-col cols="1">
                <v-btn color="primary" small class="mt-5"  @click="facultyDialog=true"> <i class="fa fa-eye"></i></v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="11">
                <v-select
                    :disabled="locationDisabled"
                    prepend-icon="mdi-account-multiple"
                    v-model="editedItem.location"
                    menu-props="auto"
                    color="success"
                    item-color="success"
                    :items="location.map(map=>map.room)"
                    @change="countCapacity()"
                    :rules="[rules.required]"
                    no-data-text="没有会议室"
                    label="选择会议室"
                ></v-select>
              </v-col>
              <v-col cols="1">
                <v-btn color="primary" small class="mt-5" @click="meetingRoomDialog=true"> <i class="fa fa-eye"></i></v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="11">
                <v-select
                    prepend-icon="mdi-account-multiple"
                    v-model="editedItem.members"
                    menu-props="auto"
                    color="success"
                    :items="members.map(map=>map.username)"
                    chips
                    multiple
                    clearable
                    item-color="success"
                    no-data-text="没有人员"
                    label="选择参加人员"
                    :rules="[rules.required,rules.userNum]">
                </v-select>
              </v-col>
              <v-col cols="1">
                <v-btn color="primary" small class="mt-5" @click="showMembers"> <i class="fa fa-eye"></i></v-btn>
              </v-col>
            </v-row>
            <v-textarea
                counter
                color="success"
                outlined name="input-7-4"
                label="会议简介"
                v-model="editedItem.info"
                :rules="[rules.required,rules.length(200)]">
            </v-textarea>
          </v-container>
        </v-card-text>
        <!--新建页面的保存，取消按钮-->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" elevation="5" @click="close">重置</v-btn>
          <v-btn :disabled="!valid" elevation="5" :loading="saveLoading" color="success" @click="save">提交</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-form>

    <!--院系详情弹窗-->
    <v-dialog v-model="facultyDialog" max-width="400px">
      <v-card>
        <v-toolbar  class="text-h6" color="success" dark>
          <v-spacer/>院系详情信息<v-spacer/>
        </v-toolbar>
        <v-card-text class="mt-3 subtitle-1">
          <div><span class="green--text">院系名称: </span>{{selectFaculty.name}}</div>
          <v-divider/>
         <div><span class="green--text">院系地点: </span>{{selectFaculty.location}}</div>
          <v-divider/>
          <div><span class="green--text">是否是教学楼: </span>{{selectFaculty.teach}}</div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!--会议室详情弹窗-->
    <v-dialog v-model="meetingRoomDialog" max-width="400px">
      <v-card>
        <v-toolbar  class="text-h6" color="success" dark>
          <v-spacer/>会议室详情信息<v-spacer/>
        </v-toolbar>
        <v-card-text class="mt-3 subtitle-1">
          <v-img :src="`http://img.yangcc.top/`+selectMeetingRoom.img" width="400"></v-img>
          <div><span class="green--text">房间号: </span>{{selectMeetingRoom.room}}</div>
          <v-divider/>
          <div><span class="green--text">状态: </span>{{selectMeetingRoom.status}}</div>
          <v-divider/>
          <div><span class="green--text">可容纳人数: </span>{{selectMeetingRoom.capacity}}</div>
          <v-divider/>
          <div><span class="green--text">描述信息: </span></div>
          {{selectMeetingRoom.info}}
        </v-card-text>
      </v-card>
    </v-dialog>
    <!--选择的人员详情弹窗-->
    <v-dialog v-model="membersDialog" max-width="800px">
      <v-card>
        <v-toolbar  class="text-h6" color="success" dark>
          <v-spacer/>人员详情信息<v-spacer/>
        </v-toolbar>
        <!--表格-->
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
            <tr v-for="item in selectMembers" :key="item.id">
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
              <td>
                <v-chip class="elevation-5" color="success" label>{{ item.faculty.name }}</v-chip>
              </td>
              <td>
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
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "Apply",

  data(){
    return{
      //三个弹窗
      facultyDialog: false,
      meetingRoomDialog: false,
      membersDialog: false,
      // 编辑,或者修改页面的表单是否通过验证
      valid: true,
      // 保存按钮的加载样式
      saveLoading: false,
      // 会议室是否可以选择
      locationDisabled: false,
      // 保存新建，修改弹窗的值
      editedItem: {
        id: '',
        name: '',
        faculty: '',
        location: '',
        date: null,
        start: null,
        end: null,
        members: [],
        info: '',
      },
      // 点击清空时候赋值
      defaultItem: {
        id: '',
        name: '',
        faculty: '',
        location: '',
        date: null,
        start: null,
        end: null,
        members: [],
        info: '',
      },
      rules: {
        userNum:  v => (v || '').length <= this.capacity || `会议室最多容纳人数为: ${this.capacity}`,
        length: len => v => (v || '').length <= len || `最大长度为: ${len}`,
        required: v => !!v || '不能为空',
      },
      allowedHours: v => v>=8 && v<24,
      menu1: false,
      menu2: false,
      menu3: false,
      toDay: new Date().toISOString(),   //今天


      faculty: [], // 学院
      location: [], // 会议室信息
      members: [], //要参加会议的人员
      capacity: 0, // 选择的会议室最多容纳的人数

      //选择的院系
      selectFaculty: '',
      //选择的会议室
      selectMeetingRoom: '',
      //选择的人员列表
      selectMembers: [],
    };
  },
  created() {
    this.findFaculty();
  },
  methods:{
    // 查询学院信息
    findFaculty(){
      this.$axios.post("/faculty/findAll",null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.faculty=res.data.data;
        }else{
          this.$message.error("查询学院信息失败");
        }
      })
    },
    //学院框改变的时候查询
    facultyChange(faculty){
      //拿到此名称对应的学院编号
      let faculty1 =  this.faculty.filter((f)=>{
        return f.name===faculty;
      })
      this.selectFaculty = faculty1[0];
      let id = faculty1[0].id;
      //查询会议室
      this.$axios.post("/meetingRoom/findByFacultyId/"+id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.location=res.data.data;
        }else{
          this.$message.error("查询会议室失败");
        }
      })

      // 查询会议室人员
      this.$axios.post("/user/findByFacultyId/"+id,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.members=res.data.data;
        }else{
          this.$message.error("查询会人员失败");
        }
      })
    },
    //计算会议室最大人员
    countCapacity(){
      let location = this.location.filter((f)=>{
        return f.room===this.editedItem.location;
      })
      this.selectMeetingRoom = location[0];
      this.capacity = location[0].capacity;
    },

    // 显示人员详情列表
    showMembers(){
      let members = this.members
      for (let i = 0; i < this.editedItem.members.length; i++) {
        let m =  members.filter((m)=>{
          return m.username === this.editedItem.members[i];
        })
        this.selectMembers[i] = m[0];
      }
      this.membersDialog = true;
    },

    //保存按钮
    save(){
      this.saveLoading =true;
      //获取选择人员的详情信息
      let members = this.members
      for (let i = 0; i < this.editedItem.members.length; i++) {
        let m =  members.filter((m)=>{
          return m.username === this.editedItem.members[i];
        })
        this.selectMembers[i] = m[0];
      }
      //封装对应的实体
      let meeting ={
        id: '',
        name: this.editedItem.name,
        start: this.editedItem.date+" "+this.editedItem.start+":00",
        end: this.editedItem.date+" "+this.editedItem.end+":00",
        info : this.editedItem.info,
        status: '未进行',
        approvalStatus: '未审核',
        members: this.selectMembers,
        meetingRoom: this.selectMeetingRoom,
        sponsor: {
          username: this.$store.state.username,
        },
      }
      this.$axios.post("/meeting/add",meeting,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code===200){
          this.$message.success(res.data.message);
          this.close();
        }
        else{
          this.$message.error(res.data.message);
        }
      }).finally(()=>{
        this.saveLoading =false;
      })
    },
    //重置表单
    close () {
      this.$nextTick(()=>{
        this.editedItem = Object.assign({}, this.defaultItem) // 清空保存数据的editedItem
        this.editedIndex = -1   // 重置弹出框标题
        this.selectFaculty = '';
        this.location = [];
        this.members = [];
        this.selectMeetingRoom= '';
        this.selectMembers = [];
        this.locationDisabled=false
        this.$refs.form.reset() // 重置表单
      })
    },
  },
}
</script>

<style scoped>
.mycard{
  width: 200px;
  height: 80px;
  top: -30px;
}
</style>