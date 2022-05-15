<template>
  <v-app>
    <div class="color">
      <v-card class="center">
        <v-card class="white--text success mycard text-center mb-5 pa-7">
          <div class="text-h6">
            <strong>404</strong>
          </div>
        </v-card>
        <div class="subtitle-1 text-center mt-10">
          啊哦....页面找不到了
        </div>
      </v-card>
    </div>
  </v-app>
</template>

<script>
export default {
  name: "Error",
  data(){
    return{
    
    };
  },
  methods:{
  
  },
}
</script>

<style scoped>
.center{
  width: 350px;
  height: 300px;
  left: 50%;
  top: 50%;
  margin-left: -175px;
  margin-top: -150px;
  padding: 20px;
}
.color{
  height:100%;
  width:100%;
  background: rgba(0,0,0,0.4);
}
/*标题突出一部分*/
.mycard{
  width: 100%;
  height: 100px;
  margin-top: -40px;
}
</style>