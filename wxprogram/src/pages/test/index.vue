<template> 
<div class='root'>
  <div v-for='(v,i) in 600' :key='i'>
    <div :style="'background:rgba('+ (i+2) * seed % 255 + ',' + (i+3) * seed % 255 + ',' + i * seed % 255 +','+ i * seed % 1+')'"/>
  </div>
</div>
</template>

<script>
let record_time
export default {
  data() {
    return {
      seed: 425.489
    }
  },
  methods: {
    setColor() {
      setInterval(() => {this.seed = 500*Math.random()},500)
    }
  },
  onLoad(){
    this.setColor()
  }
}
</script>
<style lang="stylus" scoped>
.root
  position fixed
  Flex(flex,,center)
  flex-wrap wrap
  >div
    Height_Width(50rpx)
    Flex(flex,center,center)
    border 1rpx solid
    border-radius 50%
    div
      Height_Width(50%)
      border 1rpx solid black
      border-radius 50%
</style>
