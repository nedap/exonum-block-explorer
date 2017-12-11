<template>
<!-- Raw transaction content -->
<v-expansion-panel expand>
    <v-expansion-panel-content lazy v-for="(tx, index) in txs" :key="index">
        <div slot="header">
            {{ tx.hash }}<br />
            <router-link  v-if="include_block_ref" :to="{ name: 'block', params: { height: tx.raw.location.block_height } }">
                Block {{tx.raw.location.block_height }}
            </router-link>
        </div>
        <v-card>
            <v-card-text class="grey lighten-3">
                <pre style="white-space: pre-wrap">{{ tx.raw.content.body }}</pre>
            </v-card-text>
        </v-card>
    </v-expansion-panel-content>
</v-expansion-panel>
</template>

<script lang="ts">
import Vue from 'vue';

import { Tx } from '../../lib/extra-types';

import { State } from '../../store';

export default Vue.extend({
    props: {
        txs: {
            type: Array, // Tx[]
            required: true,
            default: [],
        },
        include_block_ref : {
            type: Boolean,
            required: false,
            default: false,
        }
    },
});
</script>
