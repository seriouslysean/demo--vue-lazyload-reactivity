<template>
  <div class="formatted-message" v-if="message">
    <p>{{ message }}</p>
    <p>Store Id: {{ storeMessageId ?? 'not found' }}</p>
    <small v-if="useProvide" class="formatted-message__note"
      >Note: Timer added to try and force reactivity - {{ timer }}</small
    >
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import {
  getMessageModuleName,
  MESSAGES_MODULE_NAME,
  messageStore,
} from '../store/messages';

export default {
  name: 'FormattedMessage',
  props: {
    id: Number,
  },
  inject: ['useProvide', 'onIsVisible'],
  data() {
    return {
      timer: 0,
    };
  },
  computed: {
    ...mapGetters(MESSAGES_MODULE_NAME, ['formattedMessages']),
    message() {
      const type = this.useProvide ? 'provide' : 'emit';
      return `I'm Alive! #${this.id} - count: ${this.formattedMessages.length} (via ${type})`;
    },
    storeMessageId() {
      const messageModuleName = getMessageModuleName(this.id);
      const messageIdKey = `${messageModuleName}/messageId`;
      console.log({
        messageModuleName,
        messageIdKey,
        getters: this.$store.getters,
        idGetter: this.$store.getters[messageIdKey],
      });
      return this.$store.getters[messageIdKey] ?? null;
    },
  },
  mounted() {
    if (!this.useProvide) {
      console.warn(`Provide disabled, skipping provide initiator`);
      return;
    }
    this.onIsVisible(this.id, true);
    setInterval(() => {
      this.$nextTick(() => {
        this.timer += 1;
      });
    }, 1000);
  },
};
</script>

<style>
.formatted-message {
  background: #dedede;
  margin: 0 auto 1em;
  padding: 2em;
}

.formatted-message__note {
  font-size: 0.8em;
  color: #333;
}
</style>
