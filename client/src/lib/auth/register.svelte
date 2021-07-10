<script context="module">
  export const prerender = true
</script>

<script>
  import { goto } from "$app/navigation"
  import { modal, User } from '../../store/store'
  import { post, setLocalStorage } from '$lib/req_utils.js'
  import { getErrors } from '$lib/form_utils.js'
  import userValidators from '$fabo/models/User/validation.js'
  export let redirect = true
  export let showlogin


  let formInput = {
    username : "",
    email    : "",
    password : "",
    password2: ""
  }

  let resetInput = () => {
    return {
      username:  'ok',
      email:     'ok',
      password:  'ok',
      password2: 'ok',
    }
  }
  let errorMsgs = resetInput()

  const handleSubmit = async () => {
    errorMsgs = resetInput()

    try {
      let res = {}

      const validationErrors = getErrors(formInput, userValidators)
      errorMsgs = {...errorMsgs, ...validationErrors}

      if (formInput.password != formInput.password2) {
        errorMsgs['password2'] = 'Repeating password does not match'
      }

      for (let error in errorMsgs) {
        if (errorMsgs[error] != 'ok')
          return
      }

      const {username, email, password} = formInput

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

      delete res.token
      const user = res


      if (res.email) {
        User.set({
          ...$User,
          ...user
        })
        $modal = false
      }
    } catch(err) {
      console.log(err)
      alert(err.error)
    }
  }
</script>

<main class="">
  <h1 class="text-2xl font-bold mb-8">Create Account</h1>
  <form id="form" on:submit|preventDefault={handleSubmit} novalidate on:keydown={() => errorMsgs = resetInput()}>
    <div class="z-0 w-full pb-2">
      <div class="flex flex-row items-center">
        <label for="username" class="text-right duration-300 w-1/3 pr-3 -z-1 origin-0 text-gray-500">Username</label>
        <input
          bind:value={formInput.username}
          type="text"
          name="name"
          placeholder=" "
          class="pt-3 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
        />
      </div>
      <span class:invisible={errorMsgs['username'] == 'ok'} class="text-sm text-red-600" id="error">{errorMsgs['username']}</span>
    </div>

    <div class="z-0 w-full pb-2">
      <div class="flex flex-row items-center">
        <label for="email" class="text-right duration-300 w-1/3 pr-3 -z-1 origin-0 text-gray-500">Email</label>
        <input
          bind:value={formInput.email}
          type="email"
          name="email"
          placeholder=" "
          class="pt-3 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
        />
      </div>
      <span class:invisible={errorMsgs['email'] == 'ok'} class="text-sm text-red-600" id="error">{errorMsgs['email']}</span>
    </div>

    <div class="z-0 w-full pb-2">
      <div class="flex flex-row items-center">
        <label for="password" class="text-right duration-300 w-1/3 pr-3 -z-1 origin-0 text-gray-500">Password</label>
        <input
          bind:value={formInput.password}
          type="password"
          name="password"
          placeholder=" "
          class="pt-3 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
        />
      </div>
      <span class:invisible={errorMsgs['password'] == 'ok'} class="text-sm text-red-600" id="error">{errorMsgs['password']}</span>
    </div>

    <div class="z-0 w-full pb-2">
      <div class="flex flex-row items-center">
        <label for="password" class="text-right duration-300 w-1/3 pr-3 -z-1 origin-0 text-gray-500">Repeat password</label>
        <input
          bind:value={formInput.password2}
          type="password"
          name="passwordrepeat"
          placeholder=" "
          class="pt-3 block w-full px-0 mt-0 bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-black border-gray-200"
        />
      </div>
      <span class:invisible={errorMsgs['password2'] == 'ok'} class="text-sm text-red-600" id="error">{errorMsgs['password2']}</span>
    </div>

    <div class="pt-5 flex flex-col justify-center items-center">
      <button
        id="button"
        type="submit"
        on:click|preventDefault={() => handleSubmit()}
        class="w-full px-6 py-3 mt-3 text-lg text-white transition-all duration-150 ease-linear rounded-lg shadow outline-none bg-brand-500 hover:bg-brand-600 hover:shadow-lg focus:outline-none"
      >
        Criar
      </button>

      <button
        id="login"
        type="button"
        on:click|preventDefault={() => showlogin=true}
        class="px-2 pt-4 mt-3 text-lg text-brand-500 transition-all duration-150 ease-linear rounded-lg outline-none hover:text-brand-700"
      >
        Ja tenho conta
      </button>
    </div>

  </form>
</main>

<style style lang="postcss">

</style>
