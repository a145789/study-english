#!/usr/bin/env zx

await $`git pull`

await $`cd ../service && pnpm i`

await $`cd ../web-app && pnpm i && pnpm build && rm -rf node_modules`

await $`rm -rf ../service/dist`

await $`mv ../web-app/dist ../service/dist`

await $`rm -rf ../web-app/dist`

await $`cd ../service && pnpm prestart`

console.log('Done!')
