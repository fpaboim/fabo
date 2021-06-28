<script>
  import { User } from '../../store/store'
  import { goto } from "$app/navigation"
  import Hamburger from './hamburger.svelte'
  import AuthModal from '$lib/auth/auth_modal.svelte'

  let showmodal = false

  function login() {
    showmodal = true
  }
</script>

<header class="flex flex-col items-center pt-2">
  <div class="w-full max-w-screen-xl flex-row items-center justify-center border-black border-t-2 py-3">
    <div class="flex flex-row justify-between">
      <div class="text-lg font-bold uppercase"></div>
      <div class="flex flex-row">
        <a href="/" class="font-bold px-3 transition duration-300 ease-in-out hover:text-yellow-500" on:click={() => goto('/')}>posts</a>
        <a href="/about" class="font-bold px-3 transition duration-300 ease-in-out hover:text-yellow-500" on:click={() => goto('/about')}>about</a>
      </div>
      <button on:click={() => login()}
              class="button font-bold transition duration-300 ease-in-out hover:text-yellow-500">login</button>
    </div>
  </div>
</header>
{#if showmodal}
  <AuthModal bind:showmodal/>
{/if}

<style>
</style>
