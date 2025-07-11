<template>
    <div :class="$style.root" @click.stop="onFullScreen" v-if="fullScreenEnable"><i :class="[$style.icon, isFullScreen? $style.exit : '']"></i></div>
</template>
  
<script setup>
import { usePlugin } from 'opp-vue';
import { ref, onMounted, computed } from 'vue';
const emit = defineEmits(['enlarge', 'enlarge-init']);

const  isFullScreen = ref(false);

const plugin = usePlugin('erd-export-plugin');
const defaultSize = plugin && plugin.useStore((state) => state.defaultSize);
const fullScreenEnable = computed(() => {
    const fullScreenData = plugin && plugin.useStore((state) => state.fullScreen);
    return fullScreenData?.value === 'enabled';
});

onMounted(() => {
    if (plugin) {
        emit('fullscreen-init', JSON.stringify({
            isFullScreen: isFullScreen.value,
            defaultSize: defaultSize.value,
        }));
    }
});

const onFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
    emit('fullscreen', JSON.stringify({
        isFullScreen: isFullScreen.value,
        defaultSize: defaultSize && defaultSize.value,
    }));
};
</script>

<style module>
.root {
    display: inline-block;
    width: 24px;
    height: 24px;

}
.root:hover {
    background-color: rgba(0,0,0,.08);
    border-radius: 4px;
}
.icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    cursor: pointer;
    mask-image: url('../../../assets/fullscreen.svg');
    background-color: #666;
}
.icon:hover {
    background-color: #111;
}
.exit {
    mask-image: url('../../../assets/fullscreen-exit.svg');
}
</style>
  