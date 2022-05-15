import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/views/Login"
import Index from "@/views/Index"
//home
import Home from "@/views/index/Home";
// meeting
import Meeting from "@/views/index/meeting/Meeting";
import MeetingRoomList from "@/views/index/meeting/MeetingRoomList";
import FacultyList from "@/views/index/meeting/FacultyList";
//会议相关
import meetingHistory from "@/views/index/meeting/meeting/History"
import Ongoing from "@/views/index/meeting/meeting/Ongoing";
import Verify from "@/views/index/meeting/meeting/Verify";
import VerifyHistory from "@/views/index/meeting/meeting/VerifyHistory";

// user
import RoleList from "@/views/index/user/RoleList";
import UserList from "@/views/index/user/UserList";
import AdminList from "@/views/index/user/AdminList";

//my
import MyMessage from "@/views/index/my/MyMessage";

import MyInfo from "@/views/index/my/MyInfo";
//我的申请
import MyApply from "@/views/index/my/MyApply";
import Apply from "@/views/index/my/MyApply/Apply";
import HistoryApply from "@/views/index/my/MyApply/HistoryApply";
//我的会议
import MyMeeting from "@/views/index/my/MyMeeting";
import History from "@/views/index/my/myMeeting/History";
import Future from "@/views/index/my/myMeeting/Future";
//error
import Error from "@/views/index/Error";
//message
import Message from "@/views/index/Message";

import vuex from "@/vuex/vuex";
import axios from "axios";
import * as path from "path";


import  msg from "@/components/message/index"
Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'index',
        component: Index,
        redirect: '/home',
        children:[
            //主页
            {path: '/home', name: 'home', component: Home},
            //会议相关
            {
                path: '/meeting/meeting',
                name: 'meeting',
                component: Meeting,
                redirect: '/meeting/meeting/meetingHistory',
                children: [
                    {path: '/meeting/meeting/meetingHistory', name: 'meetingHistory', component: meetingHistory},
                    {path: '/meeting/meeting/ongoing', name: 'ongoing', component: Ongoing},
                    {path: '/meeting/meeting/verify', name: 'verify', component: Verify},
                    {path: '/meeting/meeting/verifyHistory', name: 'verifyHistory', component: VerifyHistory},
                ]
            },
            {path: '/meeting/meetingRoomList', name: 'meetingRoomList', component: MeetingRoomList,},
            {path: '/meeting/facultyList', name: 'facultyList', component: FacultyList},
            //用户相关
            {path: '/user/roleList', name: 'roleList', component: RoleList},
            {path: '/user/userList', name: 'userList', component: UserList},
            {path: '/user/adminList', name: 'adminList', component: AdminList},
            //个人相关
            {path: '/my/myInfo', name: 'myInfo', component: MyInfo},
            {path: '/my/myMessage', name: 'myMessage', component: MyMessage},
            {
                path: '/my/myMeeting',
                name: 'myMeeting',
                component: MyMeeting,
                redirect: '/my/myMeeting/history',
                children: [
                    {path: '/my/myMeeting/history', name: 'history', component: History},
                    {path: '/my/myMeeting/future', name: 'future', component: Future},
                ]

            },
            {
                path: '/my/myApply',
                name: 'myApply',
                component: MyApply,
                redirect: '/my/myApply/history',
                children: [
                    {path: '/my/myApply/history', name: 'myHistory', component: HistoryApply},
                    {path: '/my/myApply/apply', name: 'apply', component: Apply},
                ]
            },
            //消息
            {path: '/message', name: 'message', component: Message},
        ]
    },
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/*',
        name: 'error',
        component: Error
    },
]

const router = new VueRouter({
    routes: routes
})

export default router;

/*每次切换页面的时候就判断下*/
router.beforeEach((to,from,next)=>{
    // 如果是登录页可访问
    if (to.name ==='error' || to.name==='login'){
        next();
    }
    // 如果是其他页面,先检测是否有token,没有token则跳转到登录页
    let tokenValue = vuex.state.token.tokenValue;
    if (tokenValue===undefined || tokenValue===''){
        //如果sessionStorage有值
        if (sessionStorage.getItem("store")) {
            let store = sessionStorage.getItem("store");
            let json = eval("("+store+")");
            if (json.token.tokenValue ===''){
                next({path: '/login'})
                msg.error('请先登录')
            }else {
                //如果有token放行
                next()
            }
        }else {
            next({path: '/login'})
            msg.error('请先登录')
        }
    }
    else {
        //如果有token放行
        next()
    }
})



