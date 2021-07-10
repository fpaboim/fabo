import { writable } from 'svelte/store';
import { writable as writable_ls } from 'svelte-local-storage-store'
import { setLocalStorage } from '$lib/req_utils'

function createUser() {
  const initial_user = {
    username: '',
    email   : '',
    joined: '',
    verified: false,
    roles: [],
    liked: [],
    messages: []
  }

  const { subscribe, set, update } = writable_ls('user', initial_user);

  return {
    subscribe,
    set,
    update,
    reset: () => {
      set(initial_user)
      setLocalStorage('jwt', '')
    }
  };
}

export const User = createUser()

export const modal = writable(false)
