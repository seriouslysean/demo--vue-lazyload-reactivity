<template>
  <div class="lazy-load-messages">
    <div
      class="lazy-load-messages__message"
      v-for="i in Array.from({ length: 5 }, (v, i) => i + 1)"
      :key="i"
    >
      <LazyLoad
        v-slot="{ hasEnteredViewport }"
        :cacheKey="`lazy-load-message-${i}`"
        @enter-viewport="() => onEnterViewport(i)"
      >
        <FormattedMessage
          v-if="hasEnteredViewport"
          v-bind="formattedMsgAttrs(i)"
        />
      </LazyLoad>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LazyLoadMessage',
  props: {
    messages: {
      type: Object,
      default: {},
    },
  },
  methods: {
    formattedMsgAttrs(messageId) {
      return {
        id: messageId,
        // Uncomment this line, and then provide will start working
        key: this.getMessageKey(messageId),
      };
    },
    onEnterViewport(messageId) {
      this.$emit('is-visible', messageId);
    },
    getMessageKey(messageId) {
      const isLoaded = this.messages[`message--${messageId}`] === true;
      return `message--${messageId}--${isLoaded ? 'true' : 'false'}`;
    },
  },
};
</script>

<style>
.lazy-load-messages {
}
.lazy-load-messages__message {
  margin-bottom: 10em;
  min-height: 3em;
  width: 100%;
  text-align: center;
  line-height: 3em;
}
</style>
