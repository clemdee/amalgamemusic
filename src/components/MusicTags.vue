<template>
  <div
    class="music-tags"
  >
    <span
      v-for="tag in tags"
      :key="tag.name"
      class="tag"
      :class="[`size-${size}`]"
      :title="tag.name"
    >
      <span class="hashtag">#</span>{{ tag.name }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import type { MusicTags } from '~/composables/music';
import { computed } from 'vue';

const props = defineProps<{
  tags: MusicTags
  size?: 'small' | 'normal'
}>();

const tags = computed(() => {
  // Only display tags without value
  return props.tags.filter(tag => !tag.value);
});

const size = computed(() => props.size ?? 'normal');
</script>

<style lang="scss" scoped>
.music-tags {
  display: flex;
  flex-flow: row nowrap;

  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  .tag {
    display: inline-block;
    padding: 0.3rem 0.7rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    background-color: #111;

    &.size-small {
      padding: 0.3rem 0.7rem;
      font-size: 0.8rem;
    }

    .hashtag {
      color: #aaa;
    }
  }
}
</style>
