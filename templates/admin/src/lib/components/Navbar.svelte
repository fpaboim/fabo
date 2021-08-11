<script>
  import { User, modal } from '../../store/store'
  import { goto } from "$app/navigation"
</script>

<div class="navbar mb-2 shadow-lg bg-neutral text-neutral-content">
  <div class="flex-none">
    <label for="my-drawer-2" class="btn btn-square btn-ghost drawer-mobile lg:hidden">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </label>
  </div>
  <div class="px-2 mx-2 navbar-start">
    <span class="text-lg font-bold">
      <a href="/">fabojs</a>
    </span>
  </div>
  <div class="navbar-end">
    <button class="btn btn-square btn-ghost" on:click={() => {User.reset(); goto('/')}}>
      <svg xmlns="http://www.w3.org/2000/svg" class="inline-block w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    </button>
  </div>
</div>
