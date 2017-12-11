/**
 * Combine here all routes
 */
import Vue from 'vue';
import VueRouter, {RouteConfig} from 'vue-router';

Vue.use(VueRouter);

import Overview from './components/Overview.vue';
import Settings from './components/Settings.vue';

import Chain from './components/block/Chain.vue';
import Block from './components/block/Block.vue';
import TxsInBlock from './components/txs/TxInBlock.vue';

import Txs from './components/txs/Txs.vue';

const routes: RouteConfig[] = [
    { path: '/', name: 'overview', component: Overview },
    { path: '/settings', name: 'settings', component: Settings },

    { path: '/chain', name: 'chain', component: Chain, props: { overview: false} },
    { path: '/block/:height/txs', name: 'block-txs', component: TxsInBlock },
    { path: '/block/:height', name: 'block', component: Block },

    { path: '/txs', name: 'txs', component: Txs },
];

export default new VueRouter({
    routes
});
