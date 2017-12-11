<template>
    <v-layout row wrap>
        <v-flex md10 offset-md1 xl8 offset-xl2>
            <v-card>
                <v-toolbar color="grey lighten-4">
                    <img src="../../img/txs.png" />
                    <span class="pr-2"></span>
                    <v-toolbar-title class="display-1">Transactions</v-toolbar-title>
                </v-toolbar>

                <!-- Headers -->
                <tx-list :txs="txs" :include_block_ref="true"></tx-list>
            </v-card>
        </v-flex>

        <!-- Pagination -->
        <v-flex md1 offset-md3 >
            <v-btn flat @click.stop="prev">
                <v-icon x-large>chevron_left</v-icon>
            </v-btn>
        </v-flex>
        <v-flex md1 offset-md4>
            <v-btn flat @click.stop="next" v-if = "!last_page">
                <v-icon x-large>chevron_right</v-icon>
            </v-btn>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';

import TxList from '../txs/TxList.vue';

import { State } from '../../store';
import { Hash } from '../../lib/exonum-types';
import { Tx, History, Exhaustion } from '../../lib/extra-types';
import { pull_txs } from '../../lib/history';

interface ComponentData {
    txs: Tx[];
    per_page: number;
    height_low: number;
    tx_low: Hash;
    height_high: number;
    tx_high: Hash;
    exhaustion: Exhaustion;
}

export default Vue.extend({
    components: {
        TxList,
    },

    data(): ComponentData {
        return {
            txs: [],
            per_page: 15,
            height_low: -1,
            tx_low: "",
            height_high: -1,
            tx_high: "",
            exhaustion: Exhaustion.NotReached,
        }
    },

    computed: {
        last_page(): boolean {
            return this.exhaustion === Exhaustion.NoMorePast;
        }
    },

    methods: {
        async get_txs(dir: History) {
             ({txs: this.txs, exhaustion: this.exhaustion} =
                await pull_txs(
                    this.$store.getters.explorer_base_path,
                    this.$store.getters.system_base_path,
                    dir === History.GetMorePast ? this.height_low : this.height_high,
                    dir === History.GetMorePast ? this.tx_low : this.tx_high,
                    dir,
                    this.per_page
            ));

            if (this.txs.length !== 0) {
                this.height_high = parseInt((this.txs[0].raw as any).location.block_height, 10);
                this.tx_high = this.txs[0].hash;
                this.height_low = parseInt((this.txs[this.txs.length-1].raw as any).location.block_height, 10);
                this.tx_low = this.txs[this.txs.length-1].hash;
            }
        },

        prev() {
            this.get_txs(History.GetMoreFuture);
        },
        next() {
            this.get_txs(History.GetMorePast);
        }
    },

    created() {
        this.get_txs(History.GetMorePast);
    }
});
</script>
