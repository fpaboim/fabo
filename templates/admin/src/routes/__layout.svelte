<script>
import "../app.postcss";
import Sidebar from '$lib/components/Sidebar.svelte'
import Navbar from '$lib/components/Navbar.svelte'
import Login from '$lib/components/Login.svelte'

import { User, modal } from '../store/store'
</script>


<div>
  {#if $User.email}
    <div class="shadow bg-base-200 drawer drawer-mobile h-52 min-h-screen">
      <input id="my-drawer-2" type="checkbox" class="drawer-toggle">
      <div class="flex flex-col drawer-content w-full">
        <Navbar/>
        <slot></slot>
      </div>
      <div class="drawer-side">
        <label for="my-drawer-2" class="drawer-overlay"></label>
        <Sidebar/>
      </div>
    </div>
  {:else}
    <Login></Login>
  {/if}
</div>
