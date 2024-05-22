import { WebClient } from '@slack/web-api'
import { slackAuthToken, slackChannel, slackErrorChannel, slackInfoChannel, slackLogChannel, slackSuccessChannel, slackUsername, slackWarnChannel } from '#config/index.js'
import type { Notifier } from './interfaces.js'

type MessageOptions = {
  channel: string
}

export class SlackClient implements Notifier {
  private static readonly instance: SlackClient
  private readonly client!: WebClient
  private readonly channel!: string
  private readonly label!: string

  constructor (label: string = '') {
    if (!slackAuthToken) {
      return
    }
    this.client = new WebClient(slackAuthToken)
    this.channel = slackChannel!
    this.label = label
  }

  async sendMessage (message: string, options: Partial<MessageOptions> = {}) {
    if (!this.client) {
      return
    }
    if (this.label) {
      message = `${this.label}\n${message}`
    }
    try {
      await this.client.chat.postMessage({
        channel: options.channel ?? this.channel,
        text: message,
        username: slackUsername,
        icon_emoji: ':rabbit'
      })
    } catch (err) {
      console.error('notifier error:', err.message)
    }
  }

  async error (message: string, options: Partial<MessageOptions> = {}) {
    const icon = '❌'
    return this.sendMessage(`${icon} ${message}`, {
      channel: options.channel ?? slackErrorChannel
    })
  }

  async info (message: string, options: Partial<MessageOptions> = {}) {
    const icon = 'ℹ️'
    return this.sendMessage(`${icon} ${message}`, {
      channel: options.channel ?? slackInfoChannel
    })
  }

  async log (message: string, options: Partial<MessageOptions> = {}) {
    const icon = 'ℹ️'
    return this.sendMessage(`${icon} ${message}`, {
      channel: options.channel ?? slackLogChannel
    })
  }

  async success (message: string, options: Partial<MessageOptions> = {}) {
    const icon = '✅'
    return this.sendMessage(`${icon} ${message}`, {
      channel: options.channel ?? slackSuccessChannel
    })
  }

  async warn (message: string, options: Partial<MessageOptions> = {}) {
    const icon = '⚠️'
    return this.sendMessage(`${icon} ${message}`, {
      channel: options.channel ?? slackWarnChannel
    })
  }
}
