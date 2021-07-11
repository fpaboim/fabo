<script context="module">
  import { browser, dev } from '$app/env';

  export const prerender = false
</script>

<script>
  import { get } from '$lib/req_utils'
  import { User } from '../store/store'
  import dayjs from "dayjs";
  import RelativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(RelativeTime);
</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<div class="content">
  <div class="flex flex-col items-center justify-center pt-2">
    <div class="font-semibold text-lg pb-2">profile</div>
    <div>username: {$User.username}</div>
    <div>email: {$User.email}</div>
    <div>verified: {$User.verified}</div>
    <div>joined: {dayjs($User.joined).fromNow()}</div>
  </div>
</div>

<style>
</style>
