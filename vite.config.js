import { defineConfig } from "vite";

import {svelte} from '@sveltejs/vite-plugin-svelte'
import autoPreprocess from 'svelte-preprocess'

export default defineConfig({
    plugins: [
        svelte({
            preprocess: autoPreprocess()
        }),
    ]
})