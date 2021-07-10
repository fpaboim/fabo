<script context="module">
  export const prerender = true
</script>

<script>
  import { User, modal } from '../../store/store'

  let showlogin = true
  import Login from '$lib/auth/login.svelte'
  import Register from '$lib/auth/register.svelte'

  function hidemodal() {
    $modal = false
  }
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div class="absolute top-0 left-0 h-screen w-screen flex flex-col justify-center items-center z-50 bg-brand-100 bg-opacity-70" on:click|self={() => hidemodal()}>
  <div class="pt-6 sm:p-12">
    <div class="mx-auto max-w-md px-6 py-6 bg-white border-0 shadow-lg sm:rounded-3xl">
      <div class="w-full flex flex-row justify-end">
        <button on:click={() => hidemodal()}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {#if showlogin}
        <Login bind:showlogin/>
      {:else}
        <Register bind:showlogin/>
      {/if}
    </div>
  </div>
</div>

<style style lang="postcss">

</style>
