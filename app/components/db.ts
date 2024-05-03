import { createUserDto } from './types/db_types'
import axios from 'axios'

async function add_user(data: createUserDto) {
  try {
    const response = await fetch(`${process.env.URL}/user/add`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      console.log('add user')
      return true
    } else {
      console.log('user already added')
      return true
    }
  } catch (error) {
    console.error('Error adding user:', error)
    return false
  }
}

async function getProfile(chat_id: string) {
  try {
    const user = await axios.post(
      `${process.env.URL}/user/get`,
      { chat_id },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )

    if (!user.data || Object.keys(user.data).length === 0) {
      throw new Error('Profile not found')
    }

    return user.data
  } catch (error) {
    console.error(error)
    return null
  }
}

export const addLocale = async (adress: string, chat_id: number) => {
  try {
    const locale = await axios.post(
      `${process.env.URL}/user/addAddres`,
      {
        chat_id: chat_id,
        adress: adress,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (locale.status === 200) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const addName = async (fio: string, chat_id: number) => {
  try {
    const response = await axios.post(
      `${process.env.URL}/user/addName`,
      {
        chat_id: chat_id,
        fio: fio,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (response.status === 200) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export const addEmail = async (email: string, chat_id: number) => {
  try {
    const response = await axios.post(
      `${process.env.URL}/user/addEmail`,
      {
        chat_id: chat_id,
        email: email,
      },
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (response.status === 200) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export { add_user, getProfile }
