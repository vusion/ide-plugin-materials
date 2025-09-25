// 字段库管理应用制品地址
// const baseUrl = 'https://m1.apifoxmock.com/m1/7023493-6742263-default'; // mock
// const baseUrl = 'https://dev-auxdatamodel-shengji.app.codewave.163.com';
const baseUrl = 'https://data-defaulttenant.lcp.auxgroup.com';

// 获取是否回流字段
export const apiGetIsReflowField = `${baseUrl}/rest/getIsReflowField`;

// 查询字段列表
export const apiGetFieldList = `${baseUrl}/rest/getFieldList`;

// 可回流字段查询接口（弃用，改为直接上传）
export const apiGetReflowFieldList = `${baseUrl}/rest/getReflowFieldList`;

// 上传回流字段接口
export const apiUploadReflowField = `${baseUrl}/rest/uploadReflowField`;
