<template> 
<div class='tags'>
  <span :class='{tagged: v.RCID}' v-for="(v, i) in tags" :key="i" @tap='changeStatus(i)'>{{v.tag_name}}</span>
</div>
</template>

<script>
let record_time
export default {
  data() {
    return {
      tags: []
    }
  },
  methods: {
    changeStatus(i){
      wx.showLoading({title:'正在操作'})
      const formdata = {}
      if(this.tags[i].RCID)
        formdata.RCID = this.tags[i].RCID
      else formdata.TGID = this.tags[i].TGID
      formdata.record_time = record_time
      formdata.openid = wx.getStorageSync('openid')
      wx.request({
        url: this.rootUrl + 'changeTagStatusOnDate',
        data: formdata,
        success: res => {
          if(res.data.status === 'ok'){
            const tag = this.tags[i]
            tag.RCID = res.data.RCID
            this.$set(this.tags, i ,tag)
            wx.setStorageSync('tagChanged', true)
            wx.hideLoading()
          }
        }
      })
    },
    getTagOfDate(){
      wx.request({
        url: this.rootUrl + 'tagsOfDay',
        data: {
          openid: wx.getStorageSync('openid'),
          record_time
        },
        success: res => {
          this.tags = res.data
          console.log(res.data)
        }
      })
    }
  },
  onLoad(){
    const data = this.$root.$mp.query
    record_time = `${data.year.slice(-2)}${('0'+data.month).slice(-2)}${('0'+data.day).slice(-2)}`
    wx.setNavigationBarTitle({title: record_time})
    this.getTagOfDate()
  }
}
</script>
<style lang="stylus" scoped>
.tags
  display flex
  flex-wrap wrap
  padding 0 20rpx
  span
    flex 1
    white-space nowrap
    Font(30rpx)
    margin 10rpx
    padding 15rpx
    border 1rpx solid blue
    border-radius 20rpx
    text-align center
  .tagged
    background blue
    color white
</style>
