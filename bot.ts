import * as dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import TgBot, {
  CallbackQuery,
  InlineKeyboardMarkup,
  Message,
} from 'node-telegram-bot-api'

import { push_profile } from './app/components/profile'

import { addEmail, addLocale, addName, add_user } from './app/components/db'
import { createUserDto } from './app/components/types/db_types'
import { main_key, profile_key } from './app/components/keyboard'

const bot = new TgBot(process.env.TOKEN!, { polling: true })
interface UserStorage {
  [key: number]: { status: string }
}
let userStorage: UserStorage = {}

const caption =
  'Я бот группы <a href="https://t.me/stockhub12"><b>StockHub</b></a>\n\n' +
  '⚙️ Кнопки основного меню:\n\n' +
  '<i><b>➖ Поиск пары</b></i> - Фильтр поиска пары\n' +
  '<i><b>➖ ShowRoom</b></i> - Коллекция магазина\n' +
  '<i><b>➖ Мой профиль</b></i> - Инфа о твоем профиле\n' +
  '<i><b>➖ Обратная связь</b></i> - <code>help@stockhub12.ru</code>\n\n' +
  '💬 Полезное:\n' +
  '<i><b><a href="https://telegra.ph/Dogovor-oferty-na-okazanie-uslugi-11-27">➖ Договор оферты</a></b></i>\n' +
  '<i><b><a href="https://telegra.ph/Instrukciya-po-ispolzovaniyu-StockHubBot-12-13">➖ Инструкция использования</a></b></i>\n' +
  '<i><b>➖ /commands (Дополнительные команды)</b></i>\n\n' +
  '<b>Created by:</b> <a href="https://t.me/YoKrossbot_log">Anton Kamaev</a>\n' +
  'Alfa-version.v3'

console.log('App create by Anton Kamaev')

const mainMessage = async (bot: any, chatId: number, messageId: number) => {
  await bot.editMessageText(caption, {
    chat_id: chatId,
    message_id: messageId,
    disable_web_page_preview: true,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '⚡️ Начать пользоваться',
            web_app: { url: 'https://stockhub12.ru/' },
          },
        ],
        [{ text: '✌🏻 Мой профиль', callback_data: 'profile' }],
      ],
    } as InlineKeyboardMarkup,
  })
}

const errorMessage = async (bot: any, chatId: number) => {
  await bot.sendMessage(
    chatId,
    '☠️Кажется я перезапускался\n<i>💭Используй <b>/start</b> для перезапуска бота</i>',
    {
      parse_mode: 'HTML',
    },
  )
}

bot.onText(/\/start/, async msg => {
  const {
    chat: { id, first_name },
    message_id,
  } = msg

  const data: createUserDto = {
    chat_id: `${id}`,
    username: `${first_name}`,
  }
  userStorage[id] = {
    status: 'none',
  }

  const user = await add_user(data)
  if (user === false) {
    await errorMessage(bot, id)
  }

  return bot.sendMessage(id, `<b>✌🏻 Yo ${first_name}! </b>${caption}`, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '⚡️ Начать пользоваться',
            web_app: { url: 'https://stockhub12.ru' },
          },
        ],
        [{ text: '✌🏻 Мой профиль', callback_data: 'profile' }],
      ],
    } as InlineKeyboardMarkup,
  })
})

bot.on('callback_query', async (callbackQuery: CallbackQuery) => {
  const chatId: number = callbackQuery.message?.chat.id || 0
  const username: string = callbackQuery.message?.chat.first_name || 'Default'
  const messageId: number = callbackQuery.message?.message_id || 0

  if (!chatId || !username || !messageId || !userStorage[chatId]) {
    await bot.deleteMessage(chatId, messageId)
    return errorMessage(bot, chatId)
  }

  // TODO: Сделать логику добавления почты, адреса, ФИО

  switch (callbackQuery.data) {
    case 'main_menu':
      await mainMessage(bot, chatId, messageId)
      break

    case 'profile':
      await push_profile(bot, username, chatId, messageId)
      break

    case 'locale':
      await bot.editMessageText(
        `<i>💭 <b>${username}</b>, введи <b>адрес ПВЗ BoxBerry</b> (город и дом, в котором находится ПВЗ)</i>`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
        },
      )

      userStorage[chatId] = {
        status: 'awaitLocale',
      }
      break

    case 'fio':
      await bot.editMessageText(
        `<i>💭 <b>${username}</b>, введи свое ФИО (для формирования получаетяля при заказе)</i>`,
        { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' },
      )

      userStorage[chatId] = {
        status: 'awaitFIO',
      }
      break

    case 'email':
      await bot.editMessageText(
        `<i>💭 <b>${username}</b>, введи свой email (сюда придет чек после оплаты)</i>`,
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'HTML',
        },
      )

      userStorage[chatId] = {
        status: 'awaitEmail',
      }
      break
  }
})

bot.on('text', async msg => {
  const {
    chat: { id, first_name },
    text,
    message_id,
  }: Message = msg

  if (userStorage[id] && text !== '/start') {
    const currentState = userStorage[id].status
    const userText: string | undefined = text

    switch (currentState) {
      case 'awaitEmail':
        await bot.deleteMessage(id, message_id - 1)
        await bot.deleteMessage(id, message_id)
        if (userText) {
          const email = await addEmail(userText, id)
          if (email === false) {
            return await bot.sendMessage(id, 'Не правильно введен email', {
              reply_markup: main_key,
            })
          }

          bot.sendMessage(
            id,
            `<b>${first_name}</b>, я успешно добавил твой email`,
            {
              parse_mode: 'HTML',
              reply_markup: profile_key,
            },
          )
        } else {
          await errorMessage(bot, id)
        }

        break

      case 'awaitLocale':
        await bot.deleteMessage(id, message_id - 1)
        await bot.deleteMessage(id, message_id)
        if (userText) {
          const locale = await addLocale(userText, id)
          if (locale === false) {
            return await bot.sendMessage(id, 'Не правильно введен адрес', {
              reply_markup: main_key,
            })
          }

          bot.sendMessage(
            id,
            `<b>${first_name}</b>, я успешно добавил твой адрес доставки`,
            {
              parse_mode: 'HTML',
              reply_markup: profile_key,
            },
          )
        } else {
          await errorMessage(bot, id)
        }
        break

      case 'awaitFIO':
        await bot.deleteMessage(id, message_id - 1)
        await bot.deleteMessage(id, message_id)
        if (userText) {
          const fio = await addName(userText, id)
          if (fio === false) {
            return await bot.sendMessage(id, 'Не правильно введен ФИО', {
              reply_markup: main_key,
            })
          }

          bot.sendMessage(
            id,
            `<b>${first_name}</b>, я успешно добавил твое ФИО`,
            {
              parse_mode: 'HTML',
              reply_markup: profile_key,
            },
          )
        } else {
          await errorMessage(bot, id)
        }

        break
    }
  }
})
