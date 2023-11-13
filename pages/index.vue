<template>
  <div class="app">
    <h1 class="app__heading">
      LazyLoad Reactivity Example ({{ type }})
      <p><a href="/">Emit</a> | <a href="/?provide=true">Provide</a></p>
    </h1>
    <h2 class="app__subheading">Elements Start Here</h2>
    <div class="app__message">
      <p>Count: {{ formattedMessages.length }}</p>
      <ul v-if="formattedMessages.length">
        <li v-for="m in formattedMessages">{{ m }}</li>
      </ul>
    </div>
    <LazyLoadMessages :messages="messages" @is-visible="onIsVisible" />
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapState } from 'vuex';

import {
  getMessageModuleName,
  MESSAGES_MODULE_NAME,
  messageStore,
} from '../store/messages';

const getType = (isProvide = false) => (isProvide ? 'provide' : 'emit');

export default {
  name: 'App',
  provide() {
    return {
      // Switch to true to test the provide functionality instead
      useProvide: this.useProvide,
      onIsVisible: this.onIsVisible,
    };
  },
  data() {
    return {
      count: 0,
    };
  },
  computed: {
    ...mapState(MESSAGES_MODULE_NAME, {
      messages: (state) => state.messages,
    }),
    ...mapGetters(MESSAGES_MODULE_NAME, ['formattedMessages']),
    // SWITCH THIS TO SWAP BETWEEN TWO MUTATION METHODS
    //     - true to use the provided method directly in LazyLoadMessage
    //     - false to use the `is-visible` emitted event in this component
    useProvide() {
      return this.$route.query.provide === 'true';
    },
    type() {
      return getType(this.useProvide);
    },
  },
  methods: {
    ...mapMutations({
      addMessage: `${MESSAGES_MODULE_NAME}/addMessage`,
    }),
    async registerMessageSubmodule(messageId) {
      const messageModuleName = getMessageModuleName(messageId);
      if (this.$store.hasModule(messageModuleName.split('/'))) {
        console.log('Message store already registered!', { messageModuleName });
        return;
      }
      this.$store.registerModule(messageModuleName.split('/'), messageStore);
      const initializeAction = `${messageModuleName}/INITIALIZE`;
      console.log('Initializing message submodule', {
        messageModuleName,
        initializeAction,
        messageId,
      });
      await this.$store.dispatch(initializeAction, messageId, {
        root: true,
      });
    },
    async onIsVisible(messageId, isProvide = false) {
      const currentType = getType(isProvide);
      console.log(`Running onIsVisible via ${currentType}`);
      // No-op when provide is enabled
      if (this.useProvide && !isProvide) {
        console.warn(`Provide enabled, skipping emit initiator`);
        return;
      }
      console.log('LazyLoadMessage entered the viewport!');

      // Register submodule
      await this.registerMessageSubmodule(messageId);

      this.addMessage(`message--${messageId}`);
    },
  },
};
</script>

<style>
.app {
  padding: 2em;
}

.app__heading {
  margin-bottom: 80vh;
  border-bottom: 1px solid #000;
}

.app__heading p {
  font-size: 0.5em;
  padding: 1em 0;
  font-weight: normal;
}

.app__heading:after {
  content: '';
  display: block;
  position: absolute;
  left: 50%;
  height: 70vh;
  border-left: 1px solid #000;
}

.app__subheading {
  margin-bottom: 10em;
  border-bottom: 1px solid #000;
}

.app__message {
  background: pink;
  position: fixed;
  top: 0;
  right: 0;
  padding: 1em;
  font-size: 0.8em;
}
.app__message ul,
.app__message li {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
