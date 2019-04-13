<template>
<form @submit='submit'>
<div class='container'>
<div class='text'>欢迎使用My Note</div>
<input v-model='account' name='account' placeholder='请输入您的昵称' maxlength=10>
<input type='password' v-model='password' name='password' placeholder='请输入您的密码' maxlength=20>
<button :disabled="account === '' || password === '' || submitting" type='primary' form-type='submit' class='button'>{{register ? '注册' : '登录'}}</button>
<div class='text-bottom'>
<span v-if='!submitting' class='shift' @tap='shift'>{{register ? '登录账号' : '注册账号'}}</span>
</div>
</div>
</form>
</template>

<script>
export default {
  data () {
    return {
      account: '',
      password: '',
      register: true,
      submitting: false
    }
  },
  methods: {
    shift(){
      this.register = !this.register
      wx.setNavigationBarTitle({title: this.register ? '注册' : '登录'})
    },
    clear(){
      this.account = ''
      this.password = ''
    },
    submit(e){
      const input = e.mp.detail.value
      this.submitting = true
      wx.showLoading({title: `正在${this.register ? '注册' : '登录'}`})
      wx.request({
        url: this.rootUrl + (this.register ? 'register' : 'login'),
        method: 'POST',
        data: {
          account: input.account,
          password: input.password
        },
        success: res => {
          wx.hideLoading()
          if(this.register){
            if(res.data === '注册成功'){
              wx.showToast({title: res.data})
              this.clear()
            } else {
              wx.showToast({title: res.data, icon:'none'})
              this.shift()
              this.clear()
            }
          } else if (typeof res.data === 'string'){ //登录失败
            this.clear()
            wx.showToast({title: res.data, icon:'none'})
          } else { //登录成功
            wx.setStorageSync('userInfo', res.data)
            wx.switchTab({url: '../me/main'})
          }
          this.submitting = false
        },
        fail: err => {
          console.log(err)
          this.error = JSON.stringify(err)
        }
      })
    }
  },
  onUnload(){
    this.account = ''
    this.password = ''
    this.register = true
  }
}
</script>

<style lang="stylus" scoped>
.container
  position fixed
  height 100%
  width 100%
  display flex
  align-items center
  flex-direction column
  .text
    font 38rpx/38rpx !specified
    align-self flex-start
    margin 100rpx 10%
  input
    height 80rpx
    width 80%
    font 32rpx/32rpx !specified
    border-bottom 1rpx solid #DDD
    margin-bottom 30rpx
  button
    height 80rpx
    width 80%
    font 32rpx/80rpx !specified
  .text-bottom
    width 80%
    text-align center
    margin-top 300rpx
  .shift
    font 28rpx/28rpx !specified
    color #09BB07
  .phone-call
    font 28rpx/28rpx !specified
    color #E64340

</style>

