import {createUserDto} from './types/db_types'
import axios from 'axios'

async function add_user(data: createUserDto) {
  try {
    const response = await fetch(`${process.env.URL}/user/add`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {'Content-Type': 'application/json'},
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
  console.log(typeof chat_id)
  try {
    const user = await axios.post(
      `${process.env.URL}/user/get`,
      {chat_id},
      {
        headers: {'Content-Type': 'application/json'},
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

export {add_user, getProfile}
