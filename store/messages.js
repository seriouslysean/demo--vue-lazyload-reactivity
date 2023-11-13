export const MESSAGES_MODULE_NAME = 'messages';

export const getMessageModuleName = (id) =>
  `${MESSAGES_MODULE_NAME}/message--${id}`;

export const messageStore = {
  namespaced: true,
  state: () => {
    return {
      messageId: null,
    };
  },
  getters: {
    messageId(state) {
      return state.messageId;
    },
  },
  mutations: {
    SET_MESSAGE_ID(state, id) {
      state.messageId = id;
    },
  },
  actions: {
    INITIALIZE({ commit }, id) {
      commit('SET_MESSAGE_ID', id);
    },
  },
};

export const state = () => ({
  messages: {},
});

export const getters = {
  formattedMessages(state) {
    return Object.keys(state.messages);
  },
};

export const mutations = {
  addMessage(state, id) {
    state.messages = {
      ...state.messages,
      [id]: true,
    };
  },
  resetMessages(state) {
    state.messages = {};
  },
};

export const actions = {};
