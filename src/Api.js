
import { Notify } from './Notify';

export const ApiConfig = {
  prefix: '/ajax',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'same-origin', // fetch Request credential option to send cookies
};

export const Api = {

  Config: ApiConfig,

  prefix: '',

  request(url, method = 'GET', body = null, additionalHeaders = {}, responseType = 'json', useGlobalHeaders = true) {
    const req = this.createRequest(url, method, body, additionalHeaders, responseType, useGlobalHeaders);
    return fetch(req).then(response => {
      if (response.status === 200) {
        return response[responseType]();
      } else {
        return this.onStatusFail(response.status);
      }
    }).then(data => {
      return this.onResponse(data);
    }).catch(e => {
      return this.onError(e, this.createUrl(url), method);
    });
  },

  createRequest(url, method = 'GET', body = null, additionalHeaders = {}, responseType = 'json', useGlobalHeaders = true) {
    const headers = this.createHeaders(additionalHeaders, useGlobalHeaders);
    return new Request(this.createUrl(url), {method, headers, body, credentials: this.Config.credentials});
  },

  createHeaders(additionalHeaders = {}, useGlobalHeaders = true) {
    let headers = {};
    if (useGlobalHeaders) {
      headers = Object.assign({}, this.Config.headers, additionalHeaders);
    } else {
      headers = additionalHeaders;
    }
    return new Headers(headers);
  },

  createUrl(url) {
    return this.Config.prefix + this.prefix + url;
  },

  get(url, additionalHeaders = {}) {
    return this.request(url, 'GET', null, additionalHeaders);
  },

  createFormData(data) {
    if (data instanceof FormData) {
      return data;
    }
    const formData = new FormData();
    for (let key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  },

  post(url, data, additionalHeaders = {}) {
    return this.request(url, 'POST', this.createFormData(data), additionalHeaders);
  },

  onResponse(data) {
    if (data.message) {
      // May be show custom alert
      console.warn(data.message);
      return [];
    }
    return data;
  },

  onError(error, url, method) {
    console.error('Api call error:\n  URL: ' + url + '\n  Method: ' + method + '\n  Message: ' + error);
    return Promise.reject(error);
  },

  onStatusNotFound() {
    this.showStatusError('404: API Route not found!');
  },

  onStatusAccessDenied() {
    this.showStatusError('403: Access denied!');
  },

  onStatusUnauthorized() {
    this.showStatusError('401: You are not logged in!');
  },

  onStatusServerError() {
    this.showStatusError('500: Server error!');
  },

  onStatusFail(status) {
    if (status === 404) {
      this.onStatusNotFound();
    } else if (status === 403) {
      this.onStatusAccessDenied();
    } else if (status === 401) {
      this.onStatusUnauthorized();
    } else if (status === 500) {
      this.onStatusServerError();
    }
    return Promise.reject(status);
  },

  showStatusError(status) {
    Notify.danger(status)
  },

};
