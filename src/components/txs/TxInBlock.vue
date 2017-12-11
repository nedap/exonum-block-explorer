<template>
    <v-layout row wrap>
        <v-flex md10 offset-md1 xl8 offset-xl2>
            <v-card>
                <v-toolbar color="grey lighten-4">
                    <img src="../../img/txs.png" />
                    <span class="pr-2"></span>
                    <v-toolbar-title class="display-1">Transactions [Block {{height}}]</v-toolbar-title>
                </v-toolbar>

                <!-- Headers -->
                <tx-list :txs="txs"></tx-list>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';

import TxList from './TxList.vue';
import Settings from '../Settings.vue';

import { State } from '../../store';
import { Hash } from '../../lib/exonum-types';
import { pull_tx, pull_block } from '../../lib/history';
import { Tx } from '../../lib/extra-types';


interface ComponentData {
    txs: Tx[];
    height: number;
}

export default Vue.extend({
    components: {
        TxList,
        Settings,
    },

    data(): ComponentData {
        return {
            txs: [],
            height: -1,
        }
    },

    methods: {
        async get_txs() {
            const block_path = this.$store.getters.explorer_base_path;
            const block = await pull_block(block_path, this.height);

            if(block === null) {
                this.router.push({ path: '/' });
            }

            const hashes = block!.txs;

            for (const hash of hashes) {
                const system_path = this.$store.getters.system_base_path;
                let tx = await pull_tx(system_path, hash as Hash);
                if(tx !== null) {
                    // append hash to the transaction record
                    this.txs.push({hash, raw: tx});
                } else {
                    console.log(`Tx ${hash} does not exist`);
                }
            }
        }
    },

    created() {
        const height = parseInt(this.$route.params.height, 10);
        if (isNaN(height)) {
            this.router.push({ path: '/' });
        }

        this.height = height;
        this.get_txs();
    },

    beforeRouteUpdate(to, from, next) {
        const str_height = to.params.height;
        const height = parseInt(str_height, 10);

        if (isNaN(height)) {
            this.$router.push({ path: '/' });
        } else if(`${height}` !== str_height){
            this.$router.push({ name: 'txs_in_block ', params: {height: `${height}`} });
        } else {
            this.height = height;
            this.get_txs();
        }
        next();
    }
});
</script>
