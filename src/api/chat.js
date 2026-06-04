import { axios } from '@/utils/request'

// api地址
const api = {
  sessions: 'chat/sessions',
  messages: 'chat/messages',
  send: 'chat/send',
  sendImage: 'chat/sendImage',
  unreadCount: 'chat/unreadCount'
}

// 获取会话列表
export function sessions() {
  return axios({
    url: api.sessions,
    method: 'get'
  })
}

// 获取聊天记录
export function messages(params = {}) {
  return axios({
    url: api.messages,
    method: 'get',
    params
  })
}

// 发送文本消息
export function send(data) {
  return axios({
    url: api.send,
    method: 'post',
    data
  })
}

// 发送图片消息
export function sendImage(data) {
  return axios({
    url: api.sendImage,
    method: 'post',
    data
  })
}

// 获取未读消息数
export function unreadCount() {
  return axios({
    url: api.unreadCount,
    method: 'get',
    params: { load: false }
  })
}
