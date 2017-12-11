<template>
    <v-layout row wrap>
        <v-flex md10 offset-md1 xl8 offset-xl2>
            <v-card>
                <!-- Headers -->
                <v-toolbar color="grey lighten-4">
                    <img src="../img/settings.png" />
                    <span class="pr-2"></span>
                    <v-toolbar-title class="display-1">Settings</v-toolbar-title>
                </v-toolbar>
                <v-layout row wrap>
                    <v-flex md2>
                        <v-subheader>Exonum explorer endpoint</v-subheader>
                    </v-flex>
                    <v-flex md6>
                        <v-text-field
                            v-model="public_api"
                            :rules="api_settings.urlRules">
                        </v-text-field>
                    </v-flex>
                </v-layout>
            </v-card>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue from 'vue';
import { State } from '../store';

interface ComponentData {
    api_settings: {
        activated: boolean;
        valid: boolean;
        urlRules: [(url: string)=> boolean|string];
    }
}

function is_url_valid(url: string): boolean | string {
  let pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

//   return pattern.test(url) ? true : "Invalid url";
    return true;
}

export default Vue.extend({
    data(): ComponentData {
        return {
            api_settings: {
                valid: false,
                activated: false,
                urlRules: [
                    (v)=> v.length !== 0 ? true : "URL required",
                    (v)=> is_url_valid(v),
                ]
            }
        }
    },

    methods: {
        settings(): void {
            this.api_settings.activated = !this.api_settings.activated;
        }
    },

    computed: {
        public_api: {
            get(): string {
                return (this.$store.state as State).public_api;
            },
            set(url: string) {
                this.$store.commit('public_api', url);
            }
        },
    },
});
</script>
