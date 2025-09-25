import { get, post } from '../utils/methods';
import { apiGetIsReflowField, apiGetFieldList, apiGetReflowFieldList, apiUploadReflowField } from '../config';

/**
 * 通用API请求封装函数
 * @param {Function} api - API请求函数
 * @param {Object} params - 请求参数对象
 * @param {Function} success - 请求成功回调函数
 * @param {Function} fail - 请求失败回调函数
 * @param {Function} finallyFn - 请求完成回调函数
 */
function noop() {}

export function requestApi(api, params, success = noop, fail = noop, finallyFn = noop) {
  api(params)
    .then(res => {
      success(res);
    })
    .catch(err => {
      fail(err);
    })
    .finally(() => {
      finallyFn();
    });
}

// 获取是否回流字段
export function getIsReflowField(params) {
  return get(apiGetIsReflowField, { ...params });
}

// 查询字段列表
export function getFieldList(params, signal = null) {
  return get(apiGetFieldList, { ...params }, signal);
}

// 可回流字段查询接口
export function getReflowFieldList(params) {
  return post(apiGetReflowFieldList, { ...params });
}

// 上传回流字段接口
export function uploadReflowField(params) {
  return post(apiUploadReflowField, { ...params });
}
