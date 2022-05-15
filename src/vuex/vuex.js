import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex);


const store =new Vuex.Store({
    // 共享数据
    state:{
        // 用户token
        token: {
            tokenName: '',
            tokenValue: '',
        },
        //用户名
        username: '',
        //头像
        avatar: 'header.jpg',
    },
    // 修改共享数据的方法
    mutations:{
        setUsername(state,username){
            state.username = username;
        },
        setAvatar(state,avatar){
            state.avatar = avatar;
        },
        //给tokenName赋值
        setTokenName(state,tokenName){
            state.token.tokenName = tokenName;
        },
        //给tokenValue赋值
        setTokenValue(state,tokenValue){
            state.token.tokenValue = tokenValue;
        }
    }

})

// 暴露store对象
export  default  store;