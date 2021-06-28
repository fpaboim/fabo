<script>
  import Header from '$lib/header/index.svelte';
  import Footer from '$lib/footer/index.svelte';
  import Toast from '$lib/toast.svelte'
  import '../app.postcss';

  let sidebarOpen = false
</script>

<main class="h-screen p-6 bg-amber-50 flex flex-col">
  <Header />
  <div class="flex flex-col items-center">
    <div class="w-full max-w-screen-lg 2xl:max-w-screen-xl">
      <slot />
    </div>
    <Toast/>
  </div>
  <Footer/>
</main>

<style>
</style>
