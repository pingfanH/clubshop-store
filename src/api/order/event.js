import { axios } from '@/utils/request'

// api接口列表
const api = {
  updatePrice: '/order.event/updatePrice',
  updateRemark: '/order.event/updateRemark',
  confirmCancel: '/order.event/confirmCancel',
  delete: '/order.event/delete',
  printer: '/order.event/printer'
}

/**
 * 修改订单价格
 * @param {*} data
 */
export function updatePrice (data) {
  return axios({
    url: api.updatePrice,
    method: 'post',
    data
  })
}

/**
 * 修改商家备注
 * @param {*} data
 */
export function updateRemark (data) {
  return axios({
    url: api.updateRemark,
    method: 'post',
    data
  })
}

/**
 * 审核：用户取消订单
 * @param {*} data
 */
export function confirmCancel (data) {
  return axios({
    url: api.confirmCancel,
    method: 'post',
    data
  })
}

/**
 * 删除订单记录
 * @param {*} data
 */
export function deleted (orderId) {
  return axios({
    url: api.delete,
    method: 'post',
    data: { orderId }
  })
}

/**
 * 小票打印
 * @param {*} data
 */
export function printer (data) {
  return axios({
    url: api.printer,
    method: 'post',
    data
  })
}
