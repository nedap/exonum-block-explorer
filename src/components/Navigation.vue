<template>
<!-- 40px per button -->
<div class="menu" :style="{ top: top + 'px' }">
<v-card>
    <v-layout row wrap>
        <v-flex md12>
            <v-btn block flat exact class="condensed" :to="{ name: 'overview' }">
                <img src="../img/home.png" alt="Overview"/>
            </v-btn>
            <v-btn block flat class="condensed" :to="{ name: 'chain' }">
                <img src="../img/blocks.png" alt="Blocks"/>
            </v-btn>
            <v-btn block flat class="condensed" :to="{ name: 'txs' }">
                <img src="../img/txs.png" alt="Transactions"/>
            </v-btn>
            <v-btn block flat class="condensed" :to="{ name: 'settings' }">
                <img src="../img/settings.png" alt="Settings"/>
            </v-btn>
        </v-flex>
    </v-layout>
</v-card>
</div>
</template>

<script lang="ts">
import Vue from 'vue';

interface ComponentData {
    height: number;
    buttons: {src: string, ref: string}[];
    top: number;
    toggle_exclusive: number;
}

export default Vue.extend({
    data(): ComponentData {
        return {
                height: 40,
                buttons: [
                    {src: "../img/home.png", ref: ""},
                    {src: "../img/blocks.png", ref: ""},
                    {src: "../img/txs.png", ref: ""},
                ],
                top: Math.floor(0.1 * document.documentElement.clientHeight),
                toggle_exclusive: 0,
            }
    },
});
</script>

<style scoped>
.menu {
    position: fixed;
    width: 80px;
    left: 0px;
}
.condensed {
    margin: 0px;
    height: 60px;
    min-width: 0px;
}
</style>
