<script>
  import { fade } from 'svelte/transition';

  export let open = false
</script>

<button name='menu' class="stroke-current text-teal-500 hover:text-teal-700 cursor-pointer mr-4 border-none focus:outline-none transition duration-500 ease-in-out" class:open on:click={() => open = !open}>
  {#if !open}
    <svg class='h-8 w-8 pt-1' in:fade>
      <line id="top" x1=0 y1=2  x2=32 y2=2/>
      <line id="middle" x1=0 y1=12 x2=24 y2=12/>
      <line id="bottom" x1=0 y1=22 x2=32 y2=22/>
    </svg>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" in:fade>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  {/if}
</button>

<style>
  svg {
    min-height: 24px;
  }
  
  svg line {
    stroke: currentColor;
    stroke-width: 3;
  }
  
  button {
    z-index: 20;
  }
</style>
