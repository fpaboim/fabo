<script context="module">
  import { browser, dev } from '$app/env';
  import { post } from '$lib/req_utils.js'
  import dayjs from "dayjs";
  import RelativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(RelativeTime);

  export const prerender = true

  export async function load({ page, fetch, session, context }) {
    const res = await post('/post/find')

    if (res) {
      return {
        props: {
          posts: res
        }
      };
    }
  }
</script>

<script>
  import { User } from '../store/store'
  export let posts
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div class="content">
  <div class="flex flex-col items-start justify-start">
    <div class="pt-2 font-bold text-lg">posts</div>

    <div class="flex flex-col items-center justify-center">
      {#each posts as post}
      <div class="flex flex-col items-start justify-start pt-4">
        <div class="font-semibold text-md">
          <a sveltekit:prefetch href="/posts/{post.author}/{post.slug}">
            {post.title}
          </a>
        </div>
        <div class="text-sm">
          by {post.author} {dayjs(post.created).fromNow()}
        </div>
      </div>
      {/each}
    </div>
  </div>
</div>


<style style lang="postcss">
</style>
