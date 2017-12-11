<template>
<div>
    <div v-if="!block_loaded" class="loading">
        <img src="../../img/loading.gif"/>
    </div>
    <div v-else>
        <div v-if="block !== null">
            <v-layout row wrap>
                <!-- Block info -->
                <v-flex md10 offset-md1 xl8 offset-xl2>
                    <v-card>
                        <v-toolbar color="grey lighten-4">
                             <v-toolbar-title class="display-1">Block {{block.header.height}}</v-toolbar-title>
                        </v-toolbar>
                        <v-list>

                            <v-list-tile>
                                <v-layout row>
                                    <v-flex md3>
                                        Transactions
                                    </v-flex>
                                    <v-flex md9>
                                        <router-link :to ="{ name: 'block-txs', params: { block: block.header.height } }"> {{ block.header.tx_count }} </router-link>
                                    </v-flex>
                                </v-layout>
                            </v-list-tile>

                            <v-list-tile>
                                <v-layout row>
                                    <v-flex md3>
                                        Hash
                                    </v-flex>
                                    <v-flex md9>
                                        {{ block.header.state_hash }}
                                    </v-flex>
                                </v-layout>
                            </v-list-tile>

                            <v-list-tile>
                                <v-layout row>
                                    <v-flex md3>
                                        Parent Hash
                                    </v-flex>
                                    <v-flex md9>
                                        {{ block.header.prev_hash }}
                                    </v-flex>
                                </v-layout>
                            </v-list-tile>

                            <v-list-tile>
                                <v-layout row>
                                    <v-flex md3>
                                        Proposer
                                    </v-flex>
                                    <v-flex md9>
                                        {{ block.header.proposer_id }}
                                    </v-flex>
                                </v-layout>
                            </v-list-tile>

                        </v-list>
                        </v-card>
                </v-flex>

                <!-- Raw info -->
                <v-flex md10 offset-md1 xl8 offset-xl2>
                    <v-card>
                        <v-toolbar color="grey lighten-4">
                            <div class="display-1">Raw block</div>
                        </v-toolbar>
                        <pre style="white-space: pre-wrap">{{ this.block }}</pre>
                    </v-card>
                </v-flex>
            </v-layout>
        </div>
        <div v-else>
            <div class="display-4">Block {{this.$route.params.height}} does not exist</div>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

import { State } from '../../store';
import { Block } from '../../lib/exonum-types';
import { pull_block } from '../../lib/history';

import Settings from './../Settings.vue';

interface ComponentData {
    block: Block | null;
    block_loaded: boolean;
}

export default Vue.extend({
    components: {
        Settings,
    },

    data(): ComponentData {
        return {
            block: null,
            block_loaded: false,
        }
    },

    methods: {
        async get_block(height: number) {
            this.block_loaded = false;
            this.block = await pull_block(this.$store.getters.explorer_base_path, height);
            this.block_loaded = true;
        }
    },

    created() {
        const height = parseInt(this.$route.params.height, 10);
        if (isNaN(height)) {
            this.router.push({ path: '/' });
        }
        this.get_block(height);
    },

    beforeRouteUpdate(to, from, next) {
        const str_height = to.params.height;
        const height = parseInt(str_height, 10);

        if (isNaN(height)) {
            this.$router.push({ path: '/' });
        } else if(`${height}`!==str_height){
            this.$router.push({ name: 'block', params: {height: `${height}`} });
        } else {
            this.get_block(height);
        }
        next();
    }
});
</script>

<style scoped>
.loading img {
    margin-left: auto;
	margin-right: auto;
	display: block;
}
</style>
