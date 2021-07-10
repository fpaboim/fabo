<script context="module">
  import { browser, dev } from '$app/env';

  export const prerender = true
</script>

<script>
  import { User } from '../store/store'

  let posts = []
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main class="w-full h-full flex flex-col">
  <div>
    <p class="text-2xl font-bold uppercase">{$User.email}</p>
  </div>
</main>


<style style lang="postcss">
</style>
