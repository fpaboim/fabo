<script context="module">
  export const prerender = true
</script>

<script>
  import { goto } from "$app/navigation"
  import { User } from '../../store/store'
  import { post, setLocalStorage } from '$lib/req_utils'

  export let redirect = true
  export let showlogin

  let email = ""
  let password = ""
  let errorMsgs = {}

  const resetErrors = () => {
   errorMsgs = {
      email   : 'ok',
      password: 'ok',
    }
  }
  resetErrors()

  const handleSubmit = async () => {
    try {
      let res = {}
      resetErrors()

      if (email == '') {
        errorMsgs['email'] = 'Email is required'
      }
      if (password == '') {
        errorMsgs['password'] = 'Password is required'
      }

      for (let error in errorMsgs) {
        if (errorMsgs[error] != '')
          return
      }

      if (!res.errors) {
        res = await post('/auth/signup', {
          username,
          email,
          password
        })
      }

      if (res.errors) {
        let errors = res.errors
        for (let error in errors) {
          errorMsgs[error] = errors[error].message
        }
        return
      }

      if (res.token) {
        setLocalStorage('jwt', res.token)
      }


      res = await post('/auth/login', {
        email,
        password
      })

      if (res.token) {
        // console.log("SET TOKEN:", res.token)
        setLocalStorage('jwt', res.token)
      }

      const user = res.user
      // console.log('user:', user)

      User.set({
        ...$User,
        email: user.email,
        username: user.username,
        verified: user.verified,
        roles: user.roles
      })

      if (redirect) {
        await goto('/')
      }
    } catch(err) {
      alert(err.error)
    }
  }
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<div class="">
  <h1 class="text-2xl font-bold mb-8">Login</h1>
  <form id="form" on:submit|preventDefault={handleSubmit} novalidate>

    <div class="z-0 w-full mb-5">
      <div class="flex flex-row items-center">
        <label for="email" class="text-right w-1/3 duration-300 pr-3 -z-1 origin-0 text-gray-500">Email</label>
        <input
          bind:value={email}
          type="email"
          name="email"
          placeholder=" "
          class="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
        />
      </div>
      <span class="h-10 text-sm text-red-600 {errorMsgs['email'] != 'ok' ? 'visible':'invisible'}" id="error">{errorMsgs['email']}</span>
    </div>

    <div class="z-0 w-full mb-5">
      <div class="flex flex-row items-center">
        <label for="password" class="text-right w-1/3 duration-300 pr-3 -z-1 origin-0 text-gray-500">Password</label>
        <input
          bind:value={password}
          type="password"
          name="password"
          placeholder=" "
          class="pt-3 pb-2 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
        />
      </div>
      <span class="h-10 text-sm text-red-600 {errorMsgs['password'] != 'ok' ? 'visible':'invisible'}" id="error">{errorMsgs['password']}</span>
    </div>

    <div class="pt-5 flex flex-col justify-center items-center">
      <button
        id="button"
        type="submit"
        class="w-full px-6 py-3 mt-3 text-lg text-white transition-all duration-150 ease-linear rounded-lg shadow outline-none bg-brand-500 hover:bg-brand-600 hover:shadow-lg focus:outline-none"
      >
        Login
      </button>

      <button
        id="login"
        type="button"
        on:click|preventDefault={() => showlogin=false}
        class="px-2 pt-4 pb-2 mt-3 text-lg text-brand-500 transition-all duration-150 ease-linear rounded-lg outline-none hover:text-brand-700"
      >
        Create Account
      </button>
    </div>

  </form>
</div>

<style style lang="postcss">

</style>
