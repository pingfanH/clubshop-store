<template>
  <div class="chat-container">
    <!-- 会话列表 -->
    <div class="session-list">
      <div class="session-header">
        <span>用户会话</span>
        <a-badge :count="totalUnread" />
      </div>
      <div class="session-body">
        <div 
          v-for="(item, index) in sessionList" 
          :key="index" 
          class="session-item"
          :class="{ active: currentSession && currentSession.user_id === item.user_id }"
          @click="onSelectSession(item)"
        >
          <div class="session-avatar">
            <a-avatar :src="item.user_avatar" icon="user" />
            <a-badge v-if="item.unread_count > 0" :count="item.unread_count" class="session-badge" />
          </div>
          <div class="session-info">
            <div class="session-header-row">
              <span class="session-name">{{ item.user_name }}</span>
              <span class="session-time">{{ formatTime(item.last_message_time) }}</span>
            </div>
            <div class="session-footer">
              <span class="session-msg">{{ item.last_message }}</span>
            </div>
          </div>
        </div>
        <div v-if="sessionList.length === 0" class="empty-state">
          <a-empty description="暂无会话" />
        </div>
      </div>
    </div>

    <!-- 聊天详情 -->
    <div class="chat-detail" v-if="currentSession">
      <div class="chat-header">
        <div class="chat-user-info">
          <span class="chat-user-name">{{ currentSession.user_name }}</span>
          <span class="chat-user-mobile" v-if="currentSession.user_mobile">
            <a-icon type="phone" /> {{ currentSession.user_mobile }}
          </span>
        </div>
      </div>
      <div class="chat-messages" ref="messageList">
        <div 
          v-for="(msg, index) in messageList" 
          :key="index" 
          class="message-item"
          :class="{ 'message-mine': msg.sender_type === 20 }"
        >
          <div class="message-avatar">
            <a-avatar :src="msg.sender_type === 10 ? currentSession.user_avatar : ''" :icon="msg.sender_type === 10 ? 'user' : 'shop'" />
          </div>
          <div class="message-content">
            <!-- 文本消息 -->
            <div v-if="msg.type === 10" class="message-text">{{ msg.content }}</div>
            <!-- 图片消息 -->
            <div v-else-if="msg.type === 20" class="message-image">
              <img :src="msg.content" @click="onPreviewImage(msg.content)" />
            </div>
            <!-- 商品卡片 -->
            <div v-else-if="msg.type === 30" class="message-goods">
              <div class="goods-info">
                <img :src="getGoodsImage(msg.content)" class="goods-image" />
                <div class="goods-detail">
                  <div class="goods-name">{{ getGoodsName(msg.content) }}</div>
                  <div class="goods-price">¥{{ getGoodsPrice(msg.content) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <div class="input-actions">
          <a-upload
            :showUploadList="false"
            :beforeUpload="beforeUpload"
            @change="handleUploadChange"
          >
            <a-button icon="picture" />
          </a-upload>
        </div>
        <a-input v-model="inputMessage" placeholder="输入消息..." @pressEnter="onSendMessage">
          <a-button slot="append" type="primary" @click="onSendMessage">发送</a-button>
        </a-input>
      </div>
    </div>
    <div class="chat-detail empty" v-else>
      <a-empty description="选择一个会话开始聊天" />
    </div>
  </div>
</template>

<script>
import * as ChatApi from '@/api/chat'

export default {
  name: 'ChatIndex',
  data() {
    return {
      sessionList: [],
      currentSession: null,
      messageList: [],
      inputMessage: '',
      loading: false,
      totalUnread: 0,
      refreshTimer: null
    }
  },
  mounted() {
    this.getSessions()
    this.getUnreadCount()
    // 定时刷新会话列表
    this.refreshTimer = setInterval(() => {
      this.getSessions(false)
      this.getUnreadCount()
    }, 10000) // 每10秒刷新
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    // 获取会话列表
    getSessions(showLoading = true) {
      if (showLoading) this.loading = true
      ChatApi.sessions().then(res => {
        this.sessionList = res.data.list || []
      }).finally(() => {
        this.loading = false
      })
    },
    // 获取未读消息数
    getUnreadCount() {
      ChatApi.unreadCount().then(res => {
        this.totalUnread = res.data.count || 0
      })
    },
    // 选择会话
    onSelectSession(session) {
      this.currentSession = session
      // 清除该会话的未读数
      session.unread_count = 0
      this.getMessages()
    },
    // 获取聊天记录
    getMessages() {
      if (!this.currentSession) return
      
      ChatApi.messages({
        user_id: this.currentSession.user_id,
        limit: 100
      }).then(res => {
        this.messageList = (res.data.list || []).reverse()
        this.scrollToBottom()
      })
    },
    // 发送消息
    onSendMessage() {
      if (!this.inputMessage.trim() || !this.currentSession) return
      
      const content = this.inputMessage
      ChatApi.send({
        user_id: this.currentSession.user_id,
        content: content,
        type: 10
      }).then(() => {
        // 添加到消息列表
        this.messageList.push({
          message_id: Date.now(),
          sender_type: 20,
          content: content,
          type: 10,
          create_time: Math.floor(Date.now() / 1000)
        })
        this.inputMessage = ''
        this.scrollToBottom()
        // 更新会话列表
        this.getSessions(false)
      })
    },
    // 上传前处理
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB')
        return false
      }
      return true
    },
    // 上传状态变化
    handleUploadChange(info) {
      if (info.file.status === 'uploading') {
        this.$message.loading('上传中...')
        return
      }
      if (info.file.status === 'done') {
        const imageUrl = info.file.response.data.fileInfo.url
        this.sendImageMessage(imageUrl)
      }
      if (info.file.status === 'error') {
        this.$message.error('上传失败')
      }
    },
    // 发送图片消息
    sendImageMessage(imageUrl) {
      if (!this.currentSession) return
      
      ChatApi.sendImage({
        user_id: this.currentSession.user_id,
        image_url: imageUrl,
        type: 20
      }).then(() => {
        this.messageList.push({
          message_id: Date.now(),
          sender_type: 20,
          content: imageUrl,
          type: 20,
          create_time: Math.floor(Date.now() / 1000)
        })
        this.scrollToBottom()
      })
    },
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.messageList
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      
      if (isToday) {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      } else {
        return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      }
    },
    // 获取商品图片
    getGoodsImage(content) {
      try {
        const data = typeof content === 'string' ? JSON.parse(content) : content
        return data.goods_image || ''
      } catch {
        return ''
      }
    },
    // 获取商品名称
    getGoodsName(content) {
      try {
        const data = typeof content === 'string' ? JSON.parse(content) : content
        return data.goods_name || '商品'
      } catch {
        return '商品'
      }
    },
    // 获取商品价格
    getGoodsPrice(content) {
      try {
        const data = typeof content === 'string' ? JSON.parse(content) : content
        return data.goods_price || '0.00'
      } catch {
        return '0.00'
      }
    },
    // 预览图片
    onPreviewImage(url) {
      window.open(url, '_blank')
    }
  }
}
</script>

<style lang="less" scoped>
.chat-container {
  display: flex;
  height: calc(100vh - 64px);
  background: #fff;
}

.session-list {
  width: 320px;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
}

.session-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
}

.session-body {
  flex: 1;
  overflow-y: auto;
}

.session-item {
  display: flex;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  position: relative;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.active {
    background: #e6f7ff;
  }
}

.session-avatar {
  margin-right: 12px;
  position: relative;
}

.session-badge {
  position: absolute;
  top: -4px;
  right: -4px;
}

.session-info {
  flex: 1;
  overflow: hidden;
}

.session-header-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.session-name {
  font-weight: 500;
  color: #333;
}

.session-time {
  font-size: 12px;
  color: #999;
}

.session-footer {
  display: flex;
  align-items: center;
}

.session-msg {
  flex: 1;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  &.empty {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.chat-user-info {
  display: flex;
  align-items: center;
}

.chat-user-name {
  font-weight: 500;
  margin-right: 16px;
}

.chat-user-mobile {
  color: #666;
  font-size: 14px;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  
  &.message-mine {
    flex-direction: row-reverse;
    
    .message-content {
      margin-right: 12px;
      margin-left: 0;
    }
    
    .message-text {
      background: #1890ff;
      color: #fff;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  margin-left: 12px;
  max-width: 70%;
}

.message-text {
  background: #f5f5f5;
  padding: 10px 14px;
  border-radius: 8px;
  word-break: break-all;
}

.message-image {
  img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    cursor: pointer;
  }
}

.message-goods {
  .goods-info {
    display: flex;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  
  .goods-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    margin-right: 10px;
    object-fit: cover;
  }
  
  .goods-detail {
    flex: 1;
  }
  
  .goods-name {
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
  }
  
  .goods-price {
    font-size: 16px;
    color: #f5222d;
    font-weight: 500;
  }
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  
  .input-actions {
    margin-right: 12px;
  }
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
