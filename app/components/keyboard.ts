import {InlineKeyboardMarkup} from 'node-telegram-bot-api'

export const main_key: InlineKeyboardMarkup = {
  inline_keyboard: [
    [
      {
        text: '🏠 Главное меню',
        callback_data: 'main_menu',
      },
    ],
  ],
}

export const profile_key: InlineKeyboardMarkup = {
  inline_keyboard: [[{text: '✌🏻 Мой профиль', callback_data: 'profile'}]],
}
