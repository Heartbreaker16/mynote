<template> 
<div class='root'>
  <div v-for='(v,i) in colors' :key='i' :style="'background:'+v"/>
</div>
</template>

<script>
let record_time
export default {
  data() {
    return {
      colors: [
        '#F00',
        '#FFA500',
        '#FF0',
        '#6A5ACD',
        '#00F',
        '#F0F',
        '#0FF',
        '#555',
        '#A52A2A',
        '#FF1493',
      ]
    }
  },
  methods: {
    
  },
  onLoad(){
    
  }
}
</script>
<style lang="stylus" scoped>
.root
  Flex(flex,center)
  div
    Height_Width(40rpx)
    border-radius 50%
    margin 6rpx calc((100% - 7 * 40rpx)/((7 - 1)*2 + 2))
</style>
