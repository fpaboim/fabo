<script context="module">
  import { browser, dev } from '$app/env';

  export const prerender = false
</script>

<script>
  import { get } from '$lib/req_utils'
  import { User } from '../store/store'
</script>

<svelte:head>
  <title>Author a post</title>
</svelte:head>

<div class="content">
  <div class="flex flex-col items-center justify-center pt-2">
    <div class="font-semibold text-lg pb-2">Write a post</div>
  </div>
</div>

<style>
</style>
