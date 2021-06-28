import { writable } from 'svelte/store';
import { writable as writable_ls } from 'svelte-local-storage-store'

function createUser() {
  const initial_user = {
    email         : '',
    name          : '',
    crm           : '',
    lastName      : '',
    verifiedDoctor: false,
    defaultSchedule: [],
    telephone     : '',
    verified      : false,
    appointment   : [],
    roles         : ['USER'],
  }

  const { subscribe, set, update } = writable_ls('user', initial_user);

  return {
    subscribe,
    set,
    update,
    reset: () => set(initial_user)
  };
}

export const User = createUser()

export const modal = writable(false)
