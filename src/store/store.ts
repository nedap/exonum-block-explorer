import Vue from 'vue';
import Vuex, { Commit, Dispatch } from 'vuex';

Vue.use(Vuex);

interface State {
    public_api: string;
    include_empty_blocks: boolean;
}


const Store = new Vuex.Store<State> ({
    state: {
        public_api: "http://127.0.0.1:8000/api",
        include_empty_blocks: true,
    },

    actions: {
    },

    mutations: {
        public_api(state: State, url: string) {
            state.public_api = url;
        }
    },

    getters: {
        explorer_base_path(state: State): string {
            return `${state.public_api}/explorer/v1`;
        },

        system_base_path(state: State): string {
            return `${state.public_api}/system/v1`;
        }
    }
});

export { State, Store };
