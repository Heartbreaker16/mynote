<template>
<form @submit='submit'>
  <div class='account'>{{account}}</div>
  <input v-model='tag' name='tag' placeholder='请输入要添加的Tag' maxlength=10>
  <button :disabled='tag.length===0 || submitting' type='primary' form-type='submit'>添加</button>
</form>
</template>

<script>
export default {
  data() {
    return {
      account: '',
      tag: '',
      submitting: false
    }
  },
  methods: {
    submit(e){
      this.submitting = true
      const input = e.mp.detail.value
      wx.request({
        url: this.rootUrl + 'addTag',
        method: 'POST',
        data: {
          tag: input.tag,
          USID: wx.getStorageSync('userInfo').USID
        },
        success: res => {
          this.tag = ''
          wx.showToast({title: res.data})
          this.submitting = false
        }
      })
    }
  },
  onLoad(){
    this.account = wx.getStorageSync('userInfo').account
  }
}
</script>
<style lang="stylus" scoped>
.account
  text-align center
  margin-top 100rpx
input
  Height_Width(90rpx, 60%)
  padding 0 10rpx
  Font(33rpx,90rpx)
  text-align center
  border 1px solid blue
  BorderBox()
  border-radius 10rpx
  margin 50rpx 20%
button 
  width 60%
  margin-left 20%
</style>
