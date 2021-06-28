<script context="module">
  import { browser, dev } from '$app/env';

  export const prerender = false
</script>

<script>
  import { get } from '$lib/req_utils'
  import { User } from '../store/store'
</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<div class="content">
  <div class="flex flex-col items-center justify-center pt-4">
    <div class="text-bold text-lg bg-green-300">profile</div>
    <div>Name: {$User.name}</div>
    <div>Lastname:{$User.lastName}</div>
    <div>Email: {$User.email}</div>
    <div>Verified: {$User.verified}</div>
    <div>Roles: {$User.roles}</div>
  </div>
</div>

<style>
</style>
