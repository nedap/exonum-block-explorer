<template>
    <v-list>
        <template v-for="header in headers">
            <v-list-tile avatar :key="header.height" :to="{ name: 'block', params: { height: header.height } }">
                <v-list-tile-content>
                    <v-list-tile-title>Height {{header.height}}</v-list-tile-title>
                    <v-list-tile-sub-title>
                        <span class="pr-4">Proposed by {{header.proposer_id}}</span> Txs: {{header.tx_count}}
                    </v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
        </template>
    </v-list>
</template>

<script lang="ts">
import Vue from 'vue';
import { State } from '../../store';
import { BlockHeader } from '../../lib/exonum-types';
import { pull_headers } from '../../lib/history';


export default Vue.extend({
    props: {
        headers: {
            type: Array,
            required: true,
            default: []
        }
    },
});
</script>
