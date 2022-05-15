<template>
  <div  style="background-color: #EEEEEE">
    <div>
      <v-sheet
          tile
          height="54"
          class="d-flex">
        <v-btn
            icon
            class="ma-2"
            @click="$refs.calendar.prev()">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-btn
            icon
            class="ma-2"
            @click="$refs.calendar.next()">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
            class="ma-2"
            color="success"
            @click="setToday">
          今天
        </v-btn>
        <v-spacer/>
        <div class=" ma-2 subtitle-1">
          {{extend}},今天是<strong>{{time}}</strong>
        </div>
        <v-spacer/>
        <v-select
            color="success"
            item-color="success"
            v-model="type"
            :items="types"
            dense
            outlined
            hide-details
            class="ma-2"
            label="类型"
        ></v-select>

      </v-sheet>
      <!--日历组件-->
      <v-sheet height="600">
        <v-calendar
            color="success"
            locale="china"
            ref="calendar"
            v-model="value"
            :type="type"
            first-time="上午8时"
            interval-count="16"
            @click:event="showEvent"
            :events="events"
            :event-color="getEventColor"
            :event-overlap-threshold="30"
        ></v-calendar>
        <!--事件点开展开界面-->
        <v-menu
            offset-y
            transition="fab-transition"
            v-model="selectedOpen"
            :close-on-content-click="false"
            :activator="selectedElement"
        >
          <v-card color="grey lighten-4" min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
            </v-toolbar>
            <v-card-subtitle class="subtitle-1">
              会议时间： <span class="black--text">{{selectedEvent.start}}</span>----<span class="black--text">{{selectedEvent.end}}</span>
              <span></span>
            </v-card-subtitle>
            <v-card-text class="subtitle-1" v-if=" selectedEvent.meetingRoom!==undefined && selectedEvent.meetingRoom.faculty!==undefined ">
              <div v-if="selectedEvent.meetingRoom.faculty.location===selectedEvent.meetingRoom.room">会议地点：{{selectedEvent.meetingRoom.room}}</div>
              <div v-else>会议地点：{{selectedEvent.meetingRoom.faculty.location}}-{{selectedEvent.meetingRoom.room}}</div>
            </v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn color="success" @click="gotoFuture()">查看详情</v-btn>
              <v-spacer/>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data(){
    return{
      type: 'month',
      types: ['month', 'week', 'day', '4day'],
      value: '',
      time: '',
      extend: '',
      events: [],
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange','purple','teal','light-green','brown'],
    };
  },
  created() {
    this.init();
    this.findAll();
  },
  methods:{
    setToday () {
      this.value = ''
    },
    init(){
      let time =  new Date();
      let year = time.getFullYear()+'年';
      let month = time.getMonth()+1+'月';
      let day = time.getDate()+'号';
      this.time = year+month+day;
      let hours = time.getHours();
      if (hours>0 && hours<=6){
        this.extend = '午夜好';
      }else if(hours>7 && hours<=11){
        this.extend = '上午好';
      } else if(hours>11 && hours<=14){
        this.extend = '中午好';
      }else if(hours>14 && hours<=18){
        this.extend = '下午好';
      }else{
        this.extend = '晚上好';
      }
    },
    // 获取设置事件的颜色
    getEventColor (event) {
      event.color=this.colors[event.start.substring(8,10)%10];
      return event.color;
    },

    next () {
      this.$refs.calendar.next()
    },
    // 显示事件详细内容
    showEvent ({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        setTimeout(() => {
          this.selectedOpen = true
        }, 10)
      }
      if (this.selectedOpen) {
        this.selectedOpen = false
        setTimeout(open, 10)
      } else {
        open()
      }
      nativeEvent.stopPropagation()
    },

    //获取全部要参加的会议
    findAll(){
      this.$axios.post("/meeting/findAllFutureByUsername/"+this.$store.state.username,null,{
        //加入token
        headers: {
          'Content-Type': 'application/json',
          'token': this.$store.state.token.tokenValue,
        }
      }).then((res)=>{
        if (res.data.code ===200){
          this.events = res.data.data
        }else {
          this.$message.error(res.data.message);
        }
      })
    },
    //
    gotoFuture(){
      //路由到登录页面
      this.$router.push("/my/myMeeting/future")
    }
  },
}
</script>

<style scoped>

</style>