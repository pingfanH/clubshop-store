import request from '@/utils/request'

// api地址
const api = {
  sessions: 'chat/sessions',
  messages: 'chat/messages',
  send: 'chat/send',
  sendImage: 'chat/sendImage',
  unreadCount: 'chat/unreadCount'
}

// 获取会话列表
export const sessions = () => {
  return request.get(api.sessions)
}

// 获取聊天记录
export const messages = (params = {}) => {
  return request.get(api.messages, params)
}

// 发送文本消息
export const send = (data) => {
  return request.post(api.send, data)
}

// 发送图片消息
export const sendImage = (data) => {
  return request.post(api.sendImage, data)
}

// 获取未读消息数
export const unreadCount = () => {
  return request.get(api.unreadCount, {}, { load: false })
}
