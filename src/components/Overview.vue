<template>
    <v-layout row wrap>
        <v-flex md5 offset-md1 xl4 offset-xl2>
            <v-container fluid class="pt-0 pb-0 pl-0">
            <v-card>
                <v-toolbar color="grey lighten-4">
                    <img src="../img/blocks.png" />
                    <span class="pr-2"></span>
                    <v-toolbar-title class="display-1">Blocks</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn :to="{ name: 'chain' }" flat>View All</v-btn>
                </v-toolbar>

                <!-- Block Headers -->
                <block-header-list :headers="headers"></block-header-list>
            </v-card>
            </v-container>
        </v-flex>
        <v-flex md5 xl4>
           <v-container fluid class="pt-0 pb-0 pr-0">
            <v-card>
                <v-toolbar color="grey lighten-4">
                    <img src="../img/txs.png" />
                    <span class="pr-2"></span>
                    <v-toolbar-title class="display-1">Transactions</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn :to="{ name: 'txs' }" flat>View All</v-btn>
                </v-toolbar>

                <!-- Txs -->
                <tx-list :txs="txs" :include_block_ref="true"></tx-list>
            </v-card>
             </v-container>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';

import BlockHeaderList from './block/BlockHeaderList.vue';
import TxList from './txs/TxList.vue';

import { State } from '../store';

import { BlockHeader } from '../lib/exonum-types';
import { Tx, History } from '../lib/extra-types';
import { pull_headers, pull_txs } from '../lib/history';

interface ComponentData {
    headers: BlockHeader[];
    txs: Tx[];
}

export default Vue.extend({
    components: {
        BlockHeaderList,
        TxList,
    },

    data(): ComponentData {
        return {
            headers: [],
            txs: [],
        }
    },

    methods: {
        async get_headers() {
            ({headers: this.headers} = await pull_headers(
                this.$store.getters.explorer_base_path,
                -1, History.GetMorePast, 15,
                (this.$store.state as State).include_empty_blocks
            ));
        },

        async get_txs() {
            ({txs: this.txs} = await pull_txs(
                this.$store.getters.explorer_base_path,
                this.$store.getters.system_base_path,
                -1, "", History.GetMorePast, 15
            ));

        }
    },

    created() {
        this.get_headers();
        this.get_txs();
    }

});
</script>
