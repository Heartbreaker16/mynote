<template>
<div>
  <div class='tags' v-for='(v,i) in tags' :key='i'>
    <input class='tag-item' v-if='editingIndex===i' v-model='typeText' maxlength=18>
    <div class='tag-item' v-else>{{v.tag_name}}</div>
    <img v-if='editingIndex===i' @tap='save' src='/static/images/save.png'>
    <img v-else @tap='edit(i)' src='/static/images/edit.png'>
    <img v-if='editingIndex===i' @tap='back' src='/static/images/back.png'>
    <img v-else @tap='_delete(i)' src='/static/images/delete.png'>
  </div>
  <div class='tags' v-if='editingIndex===-1'>
    <input class='add' v-model='typeText' placeholder='请输入要添加的新标签' maxlength=18>
    <img @tap='save' src='/static/images/save.png'>
    <img @tap='back' src='/static/images/back.png'>
  </div>
  <button v-else @tap='add'>添加</button>
</div>
</template>

<script>
export default {
  data() {
    return {
      tags: [],
      editingIndex: -2,
      typeText: '',
      submitting: false
    }
  },
  methods: {
    edit(i) {
      this.editingIndex = i
      this.typeText = this.tags[i].tag_name
    },
    save() {
      if(this.submitting) return
      const typeText = this.typeText.replace(/(^\s*)|(\s*$)/g,'')
      const tag_name = this.tags[Math.abs(this.editingIndex)].tag_name
      if (typeText === '')
        wx.showModal({
          title:'提交失败',
          content: '不能提交空标签',
          showCancel: false
        })
      else if(this.editingIndex === -1)
        wx.showModal({
          title: '',
          content: `确定要添加标签“${typeText}”吗？`,
          success: res => {
            if(res.confirm)
              this.addTag(typeText)
          }
        })
      else if(tag_name !== typeText)
        wx.showModal({
          title: '',
          content: `确定要将标签“${tag_name}”修改为“${typeText}”吗？`,
          success: res => {
            if(res.confirm)
              this.updateTag(typeText)
          }
        })
      else this.back()
    },
    back() {
      this.editingIndex = -2
    },
    addTag(tag){
      this.submitting = true
      wx.showLoading({title:'正在操作'})
      wx.request({
        url: this.rootUrl + 'addTag',
        data: {
          tag,
          openid: wx.getStorageSync('openid')
        },
        success: res => {
          wx.hideLoading()
          if(res.data.msg === 'ok'){
            wx.showToast({title: '添加成功'})
            this.editingIndex = -2
            wx.setStorageSync('tagNeedRefresh',true)
            this.getAllTags()
          }else if(res.data.code === 0){
            wx.showToast({title: '已存在同名标签', icon:'none'})
          }
          this.submitting = false
        }
      })
    },
    updateTag(tag){
      this.submitting = true
      wx.showLoading({title:'正在操作'})
      wx.request({
        url: this.rootUrl + 'updateTag',
        data: {
          tag,
          TGID: this.tags[this.editingIndex].TGID,
          openid: wx.getStorageSync('openid')
        },
        success: res => {
          wx.hideLoading()
          if(res.data.msg === 'ok'){
            wx.showToast({title: '修改成功'})
            this.editingIndex = -2
            wx.setStorageSync('tagNeedRefresh',true)
            this.getAllTags()
            this.submitting = false
          } else if(res.data.code === 0){
            wx.showToast({title: '已存在同名标签', icon:'none'})
            this.submitting = false
          }
        }
      })
    },
    _delete(i) {
      if(this.submitting) return
      this.editingIndex = -2
      wx.showModal({
        title:'',
        content:`确定要删除标签“${this.tags[i].tag_name}”及其所有记录吗？`,
        success: res => {
          if(res.confirm) {
            wx.showModal({
              title: '警告',
              content: '该操作不可撤销\n请慎重选择',
              success: res => {
                if(res.confirm) {
                  this.submitting = true
                  wx.showLoading({title:'正在操作'})
                  wx.request({
                    url: this.rootUrl + 'deleteTag',
                    data: {
                      TGID: this.tags[i].TGID
                    },
                    success: res => {
                      wx.hideLoading()
                      if(res.data === 'ok'){
                        wx.showToast({title:'删除成功'})
                        wx.setStorageSync('tagNeedRefresh',true)
                        this.getAllTags()
                      }
                      this.submitting = false
                    }
                  })
                }
              }
            })
          }
        }
      })
    },
    add(){
      this.typeText = ''
      this.editingIndex = -1
    },
    getAllTags(){
      this.service.getAllTags(this.rootUrl).then( tags => {
        this.tags = tags
      })
    }
  },
  onLoad(){
    this.getAllTags()
    this.editingIndex = -2
    this.submitting = false
  }
}
</script>
<style lang="stylus" scoped>
.tags
  Flex(flex,center,center)
  height 90rpx
  .tag-item, input
    Font(36rpx,90rpx)
    width 70%
  img
    Height_Width(45rpx)
    margin-left 30rpx
  input
    width 60%
    border 1rpx solid green
    padding 0 20rpx
    border-radius 8rpx
    height 80rpx
    box-sizing border-box
    margin 5rpx 0 5rpx 10%
  .add
    width 70%
    margin-left 0
    border-color blue
button
  Font(36rpx,75rpx)
  margin-top 20rpx
  width 90%
  background white
  border 1rpx solid blue
  color blue

</style>
