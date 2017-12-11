import Vue from 'vue';
import Vuetify from 'vuetify';
import router from './router';
import { Store as store } from './store';

Vue.use(Vuetify);

import Navigation from './components/Navigation.vue';

const template =
`<v-app>
	<navigation></navigation>
	<v-container fluid>
		<router-view/>
	</v-container>
</v-app>`;

const vue = new Vue({
	el: '#app',
	template,
	components: { Navigation },
	created() {
		// this.$router.push({ path: '/explore' });
		this.$router.push({ path: '/' });
	},
	store,
	router,
});
