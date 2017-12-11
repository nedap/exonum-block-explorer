<template>
    <v-layout row wrap>
        <v-flex md10 offset-md1 xl8 offset-xl2>
            <v-card>
                <v-toolbar color="grey lighten-4">
                    <img src="../../img/blocks.png" />
                    <span class="pr-2"></span>
                    <v-toolbar-title class="display-1">Blocks</v-toolbar-title>
                </v-toolbar>

                <!-- Headers -->
                <block-header-list :headers="headers"></block-header-list>
            </v-card>
        </v-flex>

        <!-- Pagination -->
        <v-flex md1 offset-md3>
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

import BlockHeaderList from './BlockHeaderList.vue';
import Settings from '../Settings.vue';

import { State } from '../../store';
import { BlockHeader } from '../../lib/exonum-types';
import { Exhaustion, History } from '../../lib/extra-types';
import { pull_headers } from '../../lib/history';

interface ComponentData {
    headers: BlockHeader[];
    per_page: number;
    height_low: number;
    height_high: number;
    exhaustion: Exhaustion

}

export default Vue.extend({
    components: {
        BlockHeaderList,
        Settings,
    },

    data(): ComponentData {
        return {
            headers: [],
            per_page: 15,
            height_low: -1,
            height_high: -1,
            exhaustion: Exhaustion.NotReached,
        }
    },

    computed: {
        last_page(): boolean {
            return this.exhastion === Exhaustion.NoMorePast;
        }
    },

    methods: {
        async get_headers(dir: History) {
            ({headers: this.headers, exhaustion: this.exhaustion} = await pull_headers(
                this.$store.getters.explorer_base_path,
                dir === History.GetMorePast ? this.height_low : this.height_high,
                dir,
                this.per_page,
                (this.$store.state as State).include_empty_blocks
            ));

            if (this.headers.length !== 0) {
                this.height_high = this.headers[0].height;
                this.height_low = this.headers[this.headers.length-1].height;
            }
        },

        prev() {
            this.get_headers(History.GetMoreFuture);
        },
        next() {
            this.get_headers(History.GetMorePast);
        }
    },

    created() {
        this.get_headers(History.GetMorePast);
    }
});
</script>
