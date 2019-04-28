<template>
  <div class="monthView">
    <div class="fix-bar">
      <div class="left" @tap="monthShift(-1)" hover-class="left-hover hover" hover-stay-time=100><div/></div>
      <picker @tap="red=true" @cancel="red=false" @change="pickerConfirm" :class="{'red-text':red}" mode="date" fields='month'
        :value="year + '-' + (month+1)">
        <div class="picker-box">
          <div hover-class="red-text">{{year || '0'}}年{{month + 1 || '0'}}月</div>
          <div style='margin-left: 15rpx;' :class="red ? 'triangle-color':'triangle'"/>
        </div>
      </picker>
      <div class="right" @tap="monthShift(1)" hover-class="right-hover hover" hover-stay-time=100><div/></div>
    </div>
    <div class="calendar-head">
      <div>日</div>
      <div>一</div>
      <div>二</div>
      <div>三</div>
      <div>四</div>
      <div>五</div>
      <div>六</div>
    </div>
    <div class='view'>
      <navigator v-for='(v,i) in days_of_month' :key='i' :url="v==='' ? '': '../setTag/main?year='+year+'&month='+(month+1)+'&day='+v.date"
      :class="[{day: v.date!=''},{red: v.tagged},{today: v.isToday}]" :hover-class="v ? v.tagged ? 'fade' : 'hover' : ''">
        <div class='date'>{{v.date}}</div>
      </navigator>
    </div>     
    <div class='tags'>
      <span v-for="(v, i) in tags" :key="i" @tap='selectTag(i)' :class='{selected: i===selectedTagIndex}'>{{v.tag_name}}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      year: 0,
      month: 0,
      day: 999999999,
      days_of_month: [],
      tags: [],
      selectedTagIndex: 0,
      red: false
    }
  },
  methods: {
    monthShift(shift){
      const targetDate = new Date(this.year, this.month + shift, 1)
      const now = new Date()
      if(targetDate.getFullYear() > now.getFullYear())
        wx.showToast({ title: '还没到下个月呢~', icon:'none' })
      else if (targetDate.getFullYear() === now.getFullYear() && targetDate.getMonth() > now.getMonth())
        wx.showToast({ title: '还没到下个月呢~', icon:'none' })
      else this.change(targetDate)
    },
    changeMonthView(){
      const today = new Date()
      const monthArray = Array.from(
        new Array(new Date(this.year, this.month + 1, 0).getDate()),
        (v, i) => {
          return {
            date: i + 1,
            isToday: today.getFullYear() === this.year && today.getMonth() === this.month && today.getDate() === i + 1
          }
        }
      )
      this.days_of_month = [
        ...new Array(new Date(this.year, this.month, 1).getDay()).fill(''),
        ...monthArray
      ]
    },
    pickerConfirm(arg){
      this.red = false
      const dateArr = arg.split('-').map(Number)
      const targetDate = new Date(dateArr[0],dateArr[1]-1,1)
      this.change(targetDate)
    },
    change(targetDate){
      const oldYear = this.year
      const oldMonth = this.month
      this.year = targetDate.getFullYear()
      this.month = targetDate.getMonth()
      if(oldYear !== this.year || oldMonth !== this.month){
        this.changeMonthView()
        this.overview()
      }
    },
    selectTag(i){
      this.selectedTagIndex = i
      this.overview()
    },
    overview(){
      if(this.tags[this.selectedTagIndex])
        wx.request({
          url: this.rootUrl + 'overview',
          data: {
            dateStr: `${this.year.toString().slice(-2)}${('0'+(this.month+1)).slice(-2)}`,
            TGID: this.tags[this.selectedTagIndex].TGID,
            openid: wx.getStorageSync('openid')
          },
          success: res => {
            const shift = new Date(this.year, this.month, 1).getDay()
            const days_of_month = this.days_of_month
            days_of_month.forEach(v => {if(v!=='') v.tagged = false})
            res.data.forEach(v => days_of_month[v + shift-1].tagged = true)
            this.days_of_month = []
            this.days_of_month = days_of_month
            wx.hideLoading()
          }
        })
      else setTimeout(() => this.overview(), 80)
    },
    getAllTags(){
      this.service.getAllTags(this.rootUrl).then( tags => {
        this.tags = tags
        this.selectTag(this.selectedTagIndex)
      })
    }
  },
  onLoad(){
    wx.removeStorageSync('tagNeedRefresh')
    wx.showLoading({title:'正在加载'})
    const now = new Date()
    this.year = now.getFullYear()
    this.month = now.getMonth()
    this.changeMonthView()
    this.getAllTags()
  },
  onShow(){
    // this.checkUpdate()
    wx.getStorage({
      key: 'tagNeedRefresh',
      success: () => {
        this.getAllTags()
        wx.removeStorageSync('tagNeedRefresh')
      }
    })
    wx.getStorage({
      key: 'tagChanged',
      success: () => {
        this.overview()
        wx.removeStorageSync('tagChanged')
      }
    })
  }
}
</script>
<style lang="stylus" scoped>
.monthView
  position absolute
  width 100%
  min-height 100%
  .fix-bar
    Height_Width(100rpx, 100%)
    Flex(flex, space-between, center)
    Font(30rpx)
    >div
      Flex(flex, , center)
      height 100%
      img
        Height_Width(30rpx)
    .left
      width 80rpx
      Flex(flex, center, center)
      div
        Triangle(left, 30rpx, 18rpx)
    .right
      width 80rpx
      Flex(flex, center, center)
      div
        Triangle(right, 30rpx, 18rpx)
    .triangle
      // Triangle(down, 24rpx, 14rpx)
  picker
    height 100rpx
    Font(35rpx, 50rpx, bold)
    .picker-box
      height 100rpx
      Flex(flex, , center)
  .left-hover div
    border-right-color themeColor !important
  .right-hover div
    border-left-color themeColor !important
  .triangle-color
    Triangle(up, 24rpx, 14rpx, themeColor)
.calendar-head
  display flex
  div
    width calc((100% / 7))
    text-align center
    Font(30rpx, 80rpx, bold)
    &:nth-child(1), &:nth-child(7)
      color themeColor
.view
  display flex
  flex-wrap wrap
  width 100%
  padding 20rpx 0 0 0
  height 612rpx
  navigator
    height 90rpx
    width calc(100%/7 - 12rpx)
    margin 6rpx
    Flex(flex,center,center,column)
    Font(34rpx)
    border-radius 22rpx
    BorderBox()
  .day
    background white
  .red
    color white
    background themeColor
  .today
    border 1px solid blue
  .date
    // Font(30rpx)
    margin-bottom 10rpx
  .mark
    Font(22rpx)
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
.selected, .tagged
  background blue
  color white
</style>
