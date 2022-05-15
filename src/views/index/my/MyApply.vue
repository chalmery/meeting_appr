<template>
  <v-container  style="background-color: #EEEEEE">
    <!--按钮组-->
    <v-card elevation="0" class="mb-3" style="background-color: #EEEEEE">
      <v-card-actions>
        <v-spacer/>
        <v-btn-toggle mandatory dense  class="elevation-2">
          <v-btn  link to="/my/myApply/history" active-class="success white--text">
            <span class="hidden-sm-and-down"><strong>申请历史</strong></span>
          </v-btn>
          <v-btn link to="/my/myApply/apply" value="right"  active-class="success white--text">
            <span class="hidden-sm-and-down"><strong>申请会议</strong></span>
          </v-btn>
        </v-btn-toggle>
      </v-card-actions>
    </v-card>

    <!--子路由展示的页面-->
    <router-view/>
  </v-container>
</template>

<script>
export default {
  name: "MyApply",
  data() {
    return {};
  },
  methods: {},
}
</script>

<style scoped>

</style>